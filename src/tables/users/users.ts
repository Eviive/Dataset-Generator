import { hash } from "bcrypt";
import { downloadImage, fetchData, generateStatements } from "../../utils/dataUtils.js";
import { getUsers } from "../../api/api.js";
import { GeneratorFunction, User } from "../../types/types.js";
import { mkdir } from "fs/promises";

import predefinedUsers from "./users.json" assert { type: "json" };

export const generateUsers: GeneratorFunction = async fd => {
	
	const users: User[] = [...predefinedUsers, ...await fetchData(getUsers, "Users")];

	await mkdir('output/images/users', { recursive: true });
	
	await generateStatements(fd, "Users", users, async u => {
		const pwd = await hash(u.password, 10);
		
		await downloadImage(`https://robohash.org/${u.firstName}-${u.lastName}`, `../../output/images/users/${u.firstName}-${u.lastName}.png`);
		
		return `
			INSERT INTO users (first_name, last_name, password_hash, email, picture_url) 
			VALUES (
				'${u.firstName}', 
				'${u.lastName}', 
				'${pwd}', 
				'${u.email}', 
				'${u.firstName}-${u.lastName}.png'
			); 
			-- ${u.password}
		`;
	});
};