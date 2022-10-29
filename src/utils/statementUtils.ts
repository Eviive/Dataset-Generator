import { FileHandle } from "fs/promises";
import { timer } from "./dataUtils.js";

export const generateStatements = async <E>(fd: FileHandle, table: string, data: E[], createStatement: (data: E) => string | Promise<string>) => {

	const label = `Wrote ${table} statements in`;
	
	await timer(label, async () => {
		await fd.write(`\n-- ${table}\n\n`);
	
		await Promise.all(data.map(async d => {
			const stmt = await createStatement(d);
	
			await writeStatement(fd, stmt);
		}));
	});
};

export const writeStatement = async (fd: FileHandle, stmt: string) => {
	await fd.write(sanitizeStatement(stmt));
};

const sanitizeStatement = (sql: string) => {
	
	sql = sql.replace(/(?<!;|\*\/)(?=\s)[^ ]/gm, ""); // puts the statement on a single line
	
	sql = sql.replace(/(?<!\(|\s|,)'(?!\)|,|;)/gm, "''"); // escapes single quotes
	
	return sql;
};