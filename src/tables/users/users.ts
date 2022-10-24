import { hash } from "bcrypt";
import { downloadImage, fetchData } from "../../utils/dataUtils.js";
import { generateStatements, writeStatement } from "../../utils/statementUtils.js";
import { getUsers } from "../../api/api.js";
import { GeneratorFunction, User } from "../../types/types.js";
import { mkdir } from "fs/promises";

import predefinedUsers from "./users.json" assert { type: "json" };

export const generateUsers: GeneratorFunction = async fd => {
	
	const users: User[] = [...predefinedUsers, ...await fetchData(getUsers, "Users")];

	await mkdir('output/images/users', { recursive: true });
	
	await generateStatements(fd, "Users", users, async u => {
		const pwd = await hash(u.password, 10);
		
		const filename = await downloadImage(`https://robohash.org/${u.firstName}-${u.lastName}`, "users", `${u.firstName}-${u.lastName}`);
		
		return `
			INSERT INTO users (first_name, last_name, password_hash, email, picture_url) 
			VALUES (
				'${u.firstName}', 
				'${u.lastName}', 
				'${pwd}', 
				'${u.email}', 
				'${filename}'
			); 

			${u.admin
				? `INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID()); `
				: ""
			}
			-- ${u.password}
		`;
	});

	// sets one third of the users that are not admins as creators
	await writeStatement(fd, `
		INSERT INTO creators 
			(user_id, creator_description) 
			SELECT user_id, first_name 
				FROM users 
				WHERE 
					user_id NOT IN (SELECT user_id FROM admins) 
				AND 
					user_id <= (SELECT COUNT(*) / 3 FROM users);
	`);
};