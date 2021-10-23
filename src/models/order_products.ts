import { Product } from "./product";

export type OrderProduct = {
	productId: number;
	product?: Product;
	quanity: number;
};
