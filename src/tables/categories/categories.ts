import { generateStatements } from "../../utils/statementUtils.js";
import { Category, GeneratorFunction } from "../../types/types.js";

import predefinedCategories from "./categories.json" assert { type: "json" }

export const generateCategories: GeneratorFunction = async fd => {
	
	await generateStatements<Category>(fd, "Categories", predefinedCategories, async c => `
		INSERT INTO categories (category_name, category_description) 
		VALUES (
			'${c.name}', 
			'${c.description}'
		);
	`);
};