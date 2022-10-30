import { GeneratorFunction } from "../../types/types.js";
import { getProducts } from "../../api/api.js";
import { downloadImage, fetchData } from "../../utils/dataUtils.js";
import { generateStatements, writeStatement } from "../../utils/statementUtils.js";
import { mkdir } from "fs/promises";

import categories from "../categories/categories.json" assert { type: "json" };

export const generateProducts: GeneratorFunction = async fd => {

	let products = await fetchData(getProducts, "Products");
	
	products = products.map(p => {
		p.category = categories.find(category => category.mappedCategories.includes(p.category))?.name || "Others";
		return p;
	});

	await mkdir("output/images/products", { recursive: true });
	
	await generateStatements(fd, "Products", products, async p => {
		
		const filename = await downloadImage(p.thumbnail, "products", `${p.title}`);
		
		return `
			INSERT INTO products (category_id, user_id, product_name, product_description, product_image_url, price, discount_percentage, stock, visible) 
			VALUES (
				(SELECT category_id FROM categories WHERE category_name = '${p.category}'), 
				(SELECT MIN(user_id) FROM creators), 
				'${p.title}', 
				'${p.description}', 
				'${filename}', 
				${p.price}, 
				${p.discountPercentage < 10 ? 0 : p.discountPercentage}, 
				${p.stock}, 
				true
			);
		`;
	});

	// equally distributes products among creators
	await writeStatement(fd, `
		DROP PROCEDURE IF EXISTS distributeProductsToCreators; 
	
		DELIMITER && 
		CREATE OR REPLACE PROCEDURE distributeProductsToCreators() 
		BEGIN 
			DECLARE v_nb_creators INT DEFAULT (SELECT COUNT(*) FROM creators); 
			DECLARE v_creator_offset INT; 
			
			DECLARE v_finished INT DEFAULT 0; 
			DECLARE v_product_id INT; 
			DECLARE c_products CURSOR FOR SELECT product_id FROM products; 
			DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1; 
			
			OPEN c_products; 
			l_products: LOOP 
				FETCH c_products INTO v_product_id; 
				IF v_finished = 1 THEN 
					LEAVE l_products; 
				END IF; 
				SET v_creator_offset = FLOOR(MOD(v_product_id - 1, v_nb_creators)); 
				PREPARE STMT FROM 'UPDATE products SET user_id = (SELECT user_id FROM creators LIMIT 1 OFFSET ?) WHERE product_id = ?'; 
				EXECUTE STMT USING v_creator_offset, v_product_id; 
				DEALLOCATE PREPARE STMT; 
			END LOOP l_products; 
			CLOSE c_products; 
		END && 
		DELIMITER ; 
		
		CALL distributeProductsToCreators; 

		DROP PROCEDURE IF EXISTS distributeProductsToCreators;
	`);
};