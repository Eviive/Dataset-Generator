import { GeneratorFunction } from "../../types/types.js";
import { generateStatements } from "../../utils/statementUtils.js";

import socialMedias from "./social-medias.json" assert { type: "json" }

export const generateSocialMedias: GeneratorFunction = async fd => {
	
	await generateStatements(fd, "Categories", socialMedias, async s => `
		INSERT INTO socialmedias (social_media_name) VALUES ('${s}');
	`);
};