import Client from "../database";
import { ProductCategory } from "./product_category";

export type Product = {
	id: number;
	name: string;
	price: number;
	category: ProductCategory;
};

export class ProductStore {
	async index(): Promise<Product[]> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM products";

			const result = await conn.query(sql);

			conn.release();

			return result.rows;
		} catch (error) {
			throw new Error(`Could not get products. Error: ${error}`);
		}
	}

	async show(id: number): Promise<Product> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM products WHERE id=($1)";

			const result = await conn.query(sql, [id]);

			conn.release();

			return result.rows[0];
		} catch (error) {
			throw new Error(`Could not find product ${id}. Error: ${error}`);
		}
	}

	async create(product: Product): Promise<Product> {
		try {
			const conn = await Client.connect();
			const sql =
				"INSERT INTO products(name, price, category) VALUES ($1,$2,$3) RETURNING *";

			const result = await conn.query(sql, [
				product.name,
				product.price,
				product.category,
			]);
			const createdProduct = result.rows[0];
			conn.release();

			return createdProduct;
		} catch (error) {
			throw new Error(
				`Could not create new product ${product.name}. Error: ${error}`
			);
		}
	}

	async delete(id: string): Promise<Product> {
		try {
			const sql = "DELETE FROM products WHERE id=($1);";
			//if product is in some orders, database will throw an error so product will not be deleted so we don't need to check it manually for this app
			const conn = await Client.connect();

			const result = await conn.query(sql, [id]);

			const deletedProduct = result.rows[0];

			conn.release();

			return deletedProduct;
		} catch (error) {
			throw new Error(
				`Could not delete product with id = ${id}. Error: ${error}`
			);
		}
	}

	async mostPopular(count: number): Promise<Product[]> {
		try {
			const conn = await Client.connect();

			const sql = `SELECT products.*
			FROM products 
			JOIN order_products ON products.id=order_products.product_id
			GROUP BY (products.id)
			ORDERD BY COUNT(product_id) DESC
			LIMIT ($1)`;

			const result = await conn.query(sql, [count]);

			conn.release();

			return result.rows;
		} catch (error) {
			throw new Error(`Could not get popular products. Error: ${error}`);
		}
	}

	async productsByCategory(category: string): Promise<Product[]> {
		try {
			const conn = await Client.connect();

			const sql = `SELECT *
			FROM products 
			WHERE category = '($1)'`;

			const result = await conn.query(sql, [category]);

			conn.release();

			return result.rows;
		} catch (error) {
			throw new Error(
				`Could not get products with category ${category}. Error: ${error}`
			);
		}
	}
}
