import { FileHandle } from "fs/promises";

export type GeneratorFunction = (fd: FileHandle) => Promise<void>;

export type User = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	admin?: boolean;
};

export type Category = {
	name: string;
	description: string;
};

export type Product = {
	id: number;
	title: string;
	description: string;
	price: number;
	discountPercentage: number;
	rating: number;
	stock: number;
	brand: string;
	category: string;
	thumbnail: string;
	images: string[];
};