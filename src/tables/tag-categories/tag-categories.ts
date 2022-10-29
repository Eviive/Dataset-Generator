import { generateStatements } from "../../utils/statementUtils.js";
import { TagCategory, GeneratorFunction } from "../../types/types.js";

import tagCategories from "./tag-categories.json" assert { type: "json" }

export const generateTags: GeneratorFunction = async fd => {
	
	await generateStatements<TagCategory>(fd, "Tag Categories", tagCategories, async tc => {

		const stmts = [`INSERT INTO TagCategories (tag_category_name) VALUES ('${tc.name}');`];
		
		for (const category of tc.categories) {
			stmts.push(`
				INSERT INTO CategoryTagCategories (category_id, tag_category_id)
				VALUES (
					(SELECT category_id FROM Categories WHERE category_name = '${category}'), 
					(SELECT tag_category_id FROM TagCategories WHERE tag_category_name = '${tc.name}')
				);
			`);
		}
		
		for (const tag of tc.tags) {
			stmts.push(`
				INSERT INTO Tags (tag_name, tag_category_id) 
				VALUES (
					'${tag}', 
					(SELECT tag_category_id FROM TagCategories WHERE tag_category_name = '${tc.name}')
				);
			`);
		}
		
		return stmts.join("");
	});
};