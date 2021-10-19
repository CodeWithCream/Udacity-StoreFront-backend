import { QueryResult } from "pg";
import Client from "../database";
import { OrderProduct } from "./order_products";
import { Product } from "./product";

export type Order = {
	id: number;
	userId: number;
	isCompleted: boolean;
	products: OrderProduct[];
};

export class OrderStore {
	async index(): Promise<Order[]> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM orders";

			const result = await conn.query(sql);

			conn.release();

			return result.rows;
		} catch (error) {
			throw new Error(`Could not get orders. Error: ${error}`);
		}
	}

	async show(id: number): Promise<Order> {
		try {
			const conn = await Client.connect();
			const sql = `SELECT orders.id, orders.is_completed, products.id as product_id, products.name, products.price, 
			products.category, order_products.quantity  
			FROM orders 
			JOIN order_products ON orders.id=order_products.order_id
			JOIN products ON order_products.product_id = products.id
			WHERE orders.id=($1)`;

			const result = await conn.query(sql, [id]);

			conn.release();

			const orders = this.mapOrdersResult(result);

			return orders[0];
		} catch (error) {
			throw new Error(`Could not find product ${id}. Error: ${error}`);
		}
	}

	async create(userId: number): Promise<Order> {
		try {
			const conn = await Client.connect();
			const sql =
				"INSERT INTO orders(user_id, is_completed) VALUES ($1,$2) RETURNING *";

			const result = await conn.query(sql, [userId, false]);
			const createdOrder = result.rows[0];
			conn.release();

			return createdOrder;
		} catch (error) {
			throw new Error(`Could not create new order. Error: ${error}`);
		}
	}

	async delete(id: string): Promise<Order> {
		try {
			const conn = await Client.connect();

			const orderProductsSql =
				"DELETE FROM order_products WHERE order_id=($1)";
			const ordersSql = "DELETE FROM orders WHERE id=($1)";

			await conn.query(orderProductsSql, [id]);
			const result = await conn.query(ordersSql, [id]);

			const deletedProduct = result.rows[0];

			conn.release();

			return deletedProduct;
		} catch (error) {
			throw new Error(
				`Could not delete order with id = ${id}. Error: ${error}`
			);
		}
	}

	async addProduct(
		orderId: number,
		productId: number,
		quantity: number
	): Promise<OrderProduct> {
		// get order to see if it is open
		try {
			const ordersql = "SELECT * FROM orders WHERE id=($1)";
			const conn = await Client.connect();

			const result = await conn.query(ordersql, [orderId]);

			const order = result.rows[0];

			if (order.is_completed) {
				throw new Error(
					`Could not add product ${productId} to order ${orderId} because order is completed.`
				);
			}

			conn.release();
		} catch (err) {
			throw new Error(`${err}`);
		}

		try {
			const conn = await Client.connect();

			const sql =
				"INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *";

			const result = await conn.query(sql, [
				orderId,
				productId,
				quantity,
			]);

			const addedProduct = result.rows[0];

			conn.release();

			return addedProduct;
		} catch (error) {
			throw new Error(
				`Could not add product with id = ${productId} to order with id ${orderId}. Error: ${error}`
			);
		}
	}

	async showByUser(
		userId: number,
		isCompleted: boolean | undefined
	): Promise<Order[]> {
		try {
			const conn = await Client.connect();
			const sql = `SELECT orders.id, orders.is_completed, products.id as product_id, products.name, products.price, 
			products.category, order_products.quantity  
			FROM orders 
			JOIN order_products ON orders.id=order_products.order_id
			JOIN products ON order_products.product_id = products.id
			WHERE user_id=($1)
				${isCompleted !== undefined ? " AND is_completed=($2)" : ""}
				ORDERBY orders.id ASC`;

			const result = await conn.query(sql, [userId, isCompleted]);

			const orders = this.mapOrdersResult(result);

			conn.release();

			return orders;
		} catch (error) {
			throw new Error(`Could not get orders. Error: ${error}`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapOrdersResult(result: QueryResult<any>) {
		const orders = new Array<Order>();
		let currentOrder: Order;
		result.rows.forEach((orderRow) => {
			if (orderRow.id !== currentOrder.id) {
				currentOrder = {
					id: orderRow.id,
					userId: orderRow.userId,
					isCompleted: orderRow.is_completed,
					products: new Array<OrderProduct>(),
				};
				orders.push(currentOrder);
			}

			currentOrder.products.push({
				quanity: orderRow.quantity,
				product: {
					id: orderRow.product_id,
					name: orderRow.name,
					price: orderRow.price,
					category: orderRow.category,
				},
			});
		});
		return orders;
	}
}
