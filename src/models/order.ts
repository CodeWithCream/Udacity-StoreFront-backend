import Client from "../database";
import { OrderProduct } from "./order_products";
import { User } from "./user";

export type Order = {
	id: number;
	user: User;
	isCompleted: boolean;
	products: OrderProduct[];
};
