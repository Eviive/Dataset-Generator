import { generateUsers, generateProducts, generateCategories, generateTicketTypes, generateSocialMedias, generateCarts, generateTags } from "./tables/index.js";
import { mkdir, open } from "fs/promises";

await mkdir("output", { recursive: true });

let fd;

try {
	fd = await open("output/dataset.sql", "w");

	await generateSocialMedias(fd);

	await generateUsers(fd);
	
	await generateCategories(fd);
	
	await generateTags(fd);

	await generateProducts(fd);

	await generateCarts(fd);

	await generateTicketTypes(fd);

} catch (e) {
	console.error(e);
} finally {
	await fd?.close();
}