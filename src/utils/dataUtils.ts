import { image } from "image-downloader";
import { basename, extname, join } from "path";

export const fetchData = async <E>(queryFn: () => Promise<E[]>, table: string): Promise<E[]> => {

	const label = `Fetched ${table} in`;

	return await timer(label, async () => await queryFn());
};

export const downloadImage = async (url: string, category: string, name: string) => {
	
	const label = `Downloaded ${url} in`;
	
	name = name + (extname(url) || ".png");
	
	name = name.replace(/[<>:"/\\|?*]/g, "");

	const dest = join("..", "..", "output", "images", category, name);
	
	const { filename } = await timer(label, async () => await image({ url, dest }));

	return basename(filename);
};

export const timer = async <E>(label: string, fn: () => Promise<E>) => {

	console.time(label);

	const res = await fn();

	console.timeEnd(label);

	return res;
};