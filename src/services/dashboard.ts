import Client from "../database";
import { Product } from "../models/product";
import { ProductCategory } from "../models/product_category";

export class DashboardQueries {
	async mostPopular(count: number): Promise<Product[]> {
		try {
			const conn = await Client.connect();

			try {
				const sql = `SELECT products.*
							FROM products 
							JOIN order_products ON products.id=order_products.product_id
							GROUP BY (products.id)
							ORDER BY COUNT(product_id) DESC, id ASC
							LIMIT ($1)`;

				const result = await conn.query(sql, [count]);
				const products = this.mapRowsToProducts(result.rows);

				return products;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not get popular products. ${error}`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapRowsToProducts(rows: any[]): Product[] {
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
