import Client from "../database";
import { ProductCategory } from './product_category';

export type Product = {
	id: number;
	name: string;
	price: number;
    category: ProductCategory;
};
