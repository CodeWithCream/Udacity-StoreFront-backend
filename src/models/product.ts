import Client from "../database";
import { ProductCategory } from "./product_category";

export type Product = {
	id?: number;
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

			return this.mapRows(result.rows);
		} catch (error) {
			throw new Error(`Could not get products. ${error}`);
		}
	}

	async show(id: number): Promise<Product> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM products WHERE id=($1)";

			const result = await conn.query(sql, [id]);

			conn.release();			

			if (result.rows.length === 0) {
				throw new Error("Product doesn't exist.");
			}

			return this.mapRows(result.rows)[0];
		} catch (error) {
			throw new Error(`Could not find product with id ${id}. ${error}`);
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
			const createdProduct = this.mapRows(result.rows)[0];
			conn.release();

			return createdProduct;
		} catch (error) {
			throw new Error(
				`Could not create new product ${product.name}. ${error}`
			);
		}
	}

	async delete(id: number): Promise<Product> {
		try {
			const sql = "DELETE FROM products WHERE id=($1) RETURNING *";
			//if product is in some orders, database will throw an error so product will not be deleted so we don't need to check it manually for this app
			const conn = await Client.connect();

			const result = await conn.query(sql, [id]);

			const deletedProduct = this.mapRows(result.rows)[0];

			conn.release();

			return deletedProduct;
		} catch (error) {
			throw new Error(
				`Could not delete product with id = ${id}. ${error}`
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
			ORDER BY COUNT(product_id) DESC, id ASC
			LIMIT ($1)`;

			const result = await conn.query(sql, [count]);

			conn.release();

			return this.mapRows(result.rows);
		} catch (error) {
			throw new Error(`Could not get popular products. ${error}`);
		}
	}

	async productsByCategory(category: string): Promise<Product[]> {
		try {
			const conn = await Client.connect();

			const sql = "SELECT * FROM products WHERE category = ($1)";

			const result = await conn.query(sql, [category]);

			conn.release();

			return this.mapRows(result.rows);
		} catch (error) {
			throw new Error(
				`Could not get products with category ${category}. ${error}`
			);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapRows(rows: any[]): Product[] {
		const products = new Array<Product>();
		rows.forEach((row) => {
			products.push({
				id: row.id,
				name: row.name,
				price: parseFloat(row.price),
				category: row.category as ProductCategory,
			});
		});
		return products;
	}
}
