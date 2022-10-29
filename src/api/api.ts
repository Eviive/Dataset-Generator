import axios from "axios";
import { User, Product, Cart } from "../types/types.js";

const httpClient = axios.create({
	baseURL: "https://dummyjson.com/",
});

const request = async (url: string, dataPath: string = ""): Promise<any> => {
	const res = await httpClient.get(url);
	return dataPath ? res.data[dataPath] : res.data;
};

export const getUsers = async (): Promise<User[]> => request("users?limit=1000", "users");

export const getProducts = (): Promise<Product[]> => request("products?limit=1000", "products");

export const getCarts = (): Promise<Cart[]> => request("carts?limit=1000", "carts");