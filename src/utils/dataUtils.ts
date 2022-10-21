import { FileHandle } from "fs/promises";
import downloader from "image-downloader";

export const fetchData = async <E>(queryFn: () => Promise<E[]>, table: string): Promise<E[]> => {

	const label = `Fetched ${table} in`;

	return await timer(label, async () => await queryFn());
};

export const generateStatements = async <E>(fd: FileHandle, table: string, data: E[], createStatement: (data: E) => string | Promise<string>) => {

	const label = `Wrote ${table} statements in`;
	
	await timer(label, async () => {
		await fd.write(`-- ${table}\n\n`);
	
		await Promise.all(data.map(async d => {
			const stmt = await createStatement(d);
	
			await fd.write(sanitizeStatement(stmt) + "\n");
		}));
		
		await fd.write("\n");
	});
};

export const downloadImage = async (url: string, dest: string) => {
	
	const label = `Downloaded ${url} in`;

	await timer(label, async () => await downloader.image({ url, dest }));
};

const sanitizeStatement = (sql: string) => {
	
	sql = sql.replace(/(?=\s)[^ ]/gm, ""); // puts the statement on a single line
	
	sql = sql.replace(/(?<!\(|\s|,)'(?!\)|,)/gm, "''"); // escapes single quotes
	
	return sql;
};

const timer = async <E>(label: string, fn: () => Promise<E>) => {

	console.time(label);

	const res = await fn();

	console.timeEnd(label);

	return res;
};