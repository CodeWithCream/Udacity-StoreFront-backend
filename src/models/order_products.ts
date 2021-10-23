import { Product } from "./product";

export type OrderProduct = {
	productId: number;
	product?: Product; //filled when selected from database
	quanity: number;
};
