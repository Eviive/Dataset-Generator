import { hash } from "bcrypt";
import { downloadImage, fetchData } from "../../utils/dataUtils.js";
import { generateStatements, writeStatement } from "../../utils/statementUtils.js";
import { getUsers } from "../../api/api.js";
import { GeneratorFunction, User } from "../../types/types.js";
import { mkdir } from "fs/promises";

import predefinedUsers from "./users.json" assert { type: "json" };

export const generateUsers: GeneratorFunction = async fd => {
	
	const users: User[] = [...predefinedUsers, ...await fetchData(getUsers, "Users")];

	await mkdir("output/images/users", { recursive: true });
	
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
			/* ${u.password} */
		`;
	});
	
	// sets one third of the users that are not admins as creators
	// also sets up their socials based on their first name and last name
	await writeStatement(fd, `
		DROP PROCEDURE IF EXISTS generateSocialMedias; 
		DROP PROCEDURE IF EXISTS generateCreators; 
	
		DELIMITER && 
		CREATE OR REPLACE PROCEDURE generateSocialMedias(
			IN p_creator_id INT, 
			IN p_creator_first_name VARCHAR(254), 
			IN p_creator_Last_name VARCHAR(254) 
		) 
		BEGIN 
			DECLARE v_finished_social_media INT DEFAULT 0; 
			DECLARE v_social_media_id INT; 
			
			DECLARE c_social_media CURSOR FOR SELECT social_media_id FROM socialmedias; 
			DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished_social_media = 1; 
			
			OPEN c_social_media; 
			l_social_media: LOOP 
				FETCH c_social_media INTO v_social_media_id; 
				IF v_finished_social_media = 1 THEN 
					LEAVE l_social_media; 
				END IF; 
		
				PREPARE STMT_SOCIAL_MEDIA FROM 'INSERT INTO socialmediaaccounts (user_id, social_media_id, account) VALUES (?, ?, ?)'; 
				EXECUTE STMT_SOCIAL_MEDIA USING p_creator_id, v_social_media_id, CONCAT(p_creator_first_name, '-', p_creator_last_name); 
				DEALLOCATE PREPARE STMT_SOCIAL_MEDIA; 
			END LOOP l_social_media; 
			CLOSE c_social_media; 
		END && 
		DELIMITER ; 
		
		DELIMITER && 
		CREATE OR REPLACE PROCEDURE generateCreators() 
		BEGIN 
			DECLARE v_finished_creator INT DEFAULT 0; 
			DECLARE v_creator_id INT; 
			DECLARE v_creator_first_name VARCHAR(254); 
			DECLARE v_creator_last_name VARCHAR(254); 
		
			DECLARE c_creators CURSOR FOR SELECT user_id, first_name, last_name FROM users WHERE user_id NOT IN (SELECT user_id FROM admins) AND user_id <= (SELECT COUNT(*) / 3 FROM users); 
			DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished_creator = 1; 
		
			OPEN c_creators; 
			l_creators: LOOP 
				FETCH c_creators INTO v_creator_id, v_creator_first_name, v_creator_last_name; 
				IF v_finished_creator = 1 THEN 
					LEAVE l_creators; 
				END IF; 
		
				PREPARE STMT_CREATOR FROM 'INSERT INTO creators (user_id, creator_description) VALUES (?, ?)'; 
				EXECUTE STMT_CREATOR USING v_creator_id, CONCAT('Welcome to the page of ', v_creator_first_name, ' ', v_creator_last_name); 
				DEALLOCATE PREPARE STMT_CREATOR; 
				
				CALL generateSocialMedias(v_creator_id, v_creator_first_name, v_creator_last_name); 
			END LOOP l_creators; 
			CLOSE c_creators; 
		END && 
		DELIMITER ; 
				
		CALL generateCreators(); 

		DROP PROCEDURE IF EXISTS generateSocialMedias; 
		DROP PROCEDURE IF EXISTS generateCreators;
	`);
};