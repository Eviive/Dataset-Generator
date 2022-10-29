import { generateStatements } from "../../utils/statementUtils.js";
import { Cart, GeneratorFunction } from "../../types/types.js";
import { fetchData } from "../../utils/dataUtils.js";
import { getCarts } from "../../api/api.js";

export const generateCarts: GeneratorFunction = async fd => {
	
	const carts = await fetchData(getCarts, "Carts");
	
	await generateStatements<Cart>(fd, "Carts", carts, async c => {

		let stmts: string[] = [];
		
		for (const p of c.products) {
			stmts.push(`
				INSERT INTO carts (product_id, user_id, quantity) 
				VALUES (
					'${p.id}', 
					'${c.userId}',
					'${p.quantity}'
				);
			`);
		}
		
		return stmts.join("");
	});
};