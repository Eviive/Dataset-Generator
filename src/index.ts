import { generateUsers, generateProducts, generateCategories, generateTicketTypes, generateSocialMedias } from "./tables/index.js";
import { mkdir, open } from "fs/promises";

await mkdir('output', { recursive: true });

let fd;

try {
	fd = await open('output/dataset.sql', 'w');

	await generateUsers(fd);
	
	await generateCategories(fd);
	
	await generateProducts(fd);

	await generateTicketTypes(fd);

	await generateSocialMedias(fd);
} catch (e) {
	console.error(e);
} finally {
	await fd?.close();
}