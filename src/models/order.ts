import Client from "../database";
import { OrderProduct } from "./order_products";

export type Order = {
	id?: number;
	userId: number;
	isCompleted: boolean;
	products?: OrderProduct[];
};

export class OrderStore {
	//returns basic order data
	async index(): Promise<Order[]> {
		try {
			const conn = await Client.connect();

			try {
				const sql = "SELECT * FROM orders";
				const result = await conn.query(sql);
				const orders = this.mapRowsToBasicOrder(result.rows);
				return orders;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not get orders. Error: ${error}`);
		}
	}

	async show(id: number): Promise<Order> {
		try {
			const conn = await Client.connect();

			try {
				const sql = `SELECT orders.*, products.id as product_id, products.name, products.price, 
			products.category, order_products.quantity  
			FROM orders 
			LEFT OUTER JOIN order_products ON orders.id=order_products.order_id
			LEFT OUTER JOIN products ON order_products.product_id = products.id
			WHERE orders.id=($1)
			ORDER BY order_products.id ASC`;

				const result = await conn.query(sql, [id]);

				if (result.rows.length === 0) {
					throw new Error("Order doesn't exist.");
				}

				const orderDetails = this.mapRowsToOrderDetails(result.rows)[0];

				return orderDetails;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not find order with id ${id}. ${error}`);
		}
	}

	//create empty, active order for given user
	async create(userId: number): Promise<Order> {
		try {
			const conn = await Client.connect();
			//check active orders
			try {
				const ordersql =
					"SELECT * FROM orders WHERE user_id=($1) AND is_completed IS false";
				const selectResult = await conn.query(ordersql, [userId]);

				if (selectResult.rows.length > 0) {
					throw new Error("User already has an active order.");
				}

				const sql =
					"INSERT INTO orders(user_id, is_completed) VALUES ($1,$2) RETURNING *";
				const insertResult = await conn.query(sql, [userId, false]);
				const order = this.mapRowsToBasicOrder(insertResult.rows)[0];

				return order;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not create new order. ${error}`);
		}
	}

	async delete(id: number): Promise<Order> {
		try {
			const conn = await Client.connect();
			try {
				const orderProductsSql =
					"DELETE FROM order_products WHERE order_id=($1)";
				const ordersSql =
					"DELETE FROM orders WHERE id=($1) RETURNING *";

				await conn.query(orderProductsSql, [id]);
				const result = await conn.query(ordersSql, [id]);
				const deletedProduct = this.mapRowsToBasicOrder(result.rows)[0];

				return deletedProduct;
			} finally {
				conn.release();
			}
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
	): Promise<void> {
		try {
			const conn = await Client.connect();

			try {
				// get order to see if it is open
				const selectSql = "SELECT * FROM orders WHERE id=($1)";
				const selectResult = await conn.query(selectSql, [orderId]);

				if (selectResult.rows.length === 0) {
					throw new Error("Order doesn't exist");
				}
				if (selectResult.rows[0].is_completed) {
					throw new Error("Order is completed");
				}

				//get existing product in order
				const selectOrderProductSql =
					"SELECT * FROM order_products WHERE order_Id=($1) AND product_id=($2)";
				const orderProductsResult = await conn.query(
					selectOrderProductSql,
					[orderId, productId]
				);

				if (orderProductsResult.rows.length === 0) {
					//no product in order
					//add new product
					const insertSql =
						"INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1,$2,$3)";
					await conn.query(insertSql, [orderId, productId, quantity]);
				} else {
					//product already in order
					//update quantity
					const currentQuantity = parseInt(
						orderProductsResult.rows[0].quantity
					);
					const updateSql =
						"UPDATE order_products SET quantity=($3) WHERE order_id=($1) AND product_id=($2)";
					await conn.query(updateSql, [
						orderId,
						productId,
						currentQuantity + quantity,
					]);
				}
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(
				`Could not add product with id ${productId} to order with id ${orderId}. ${error}`
			);
		}
	}

	async completeOrder(id: number): Promise<void> {
		try {
			const conn = await Client.connect();

			try {
				const selectOrdersql = "SELECT * FROM orders WHERE id=($1)";
				const selectResult = await conn.query(selectOrdersql, [id]);

				if (selectResult.rows.length === 0) {
					throw new Error("Order doesn't exist");
				}

				const sql =
					"UPDATE orders SET is_completed = true WHERE id=($1)";
				await conn.query(sql, [id]);
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not complete order with id ${id}. ${error}`);
		}
	}

	async showByUser(
		userId: number,
		isCompleted: boolean | undefined = undefined
	): Promise<Order[]> {
		try {
			const conn = await Client.connect();
			try {
				const sql = `SELECT orders.*, products.id as product_id, products.name, products.price, 
							products.category, order_products.quantity  
							FROM orders 
							LEFT OUTER JOIN order_products ON orders.id=order_products.order_id
							LEFT OUTER JOIN products ON order_products.product_id = products.id
							WHERE user_id=($1)
							${isCompleted !== undefined ? "AND is_completed=($2)" : ""}
							ORDER BY orders.id ASC`;

				const parameters: (number | boolean | undefined)[] = [userId];
				if (isCompleted !== undefined) {
					parameters.push(isCompleted);
				}
				const result = await conn.query(sql, parameters);
				const orders = this.mapRowsToOrderDetails(result.rows);

				return orders;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not get orders. ${error}`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapRowsToBasicOrder(rows: any[]): Order[] {
		const orders = new Array<Order>();
		rows.forEach((row) =>
			orders.push({
				id: row.id,
				userId: parseInt(row.user_id),
				isCompleted: row.is_completed,
			})
		);
		return orders;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapRowsToOrderDetails(rows: any[]): Order[] {
		const orders = new Array<Order>();
		let currentOrder: Order | undefined = undefined;

		rows.forEach((orderRow) => {
			if (!currentOrder || orderRow.id !== currentOrder.id) {
				currentOrder = {
					id: orderRow.id,
					userId: parseInt(orderRow.user_id),
					isCompleted: orderRow.is_completed,
				};
				orders.push(currentOrder);
			}

			if (!currentOrder.products) {
				currentOrder.products = new Array<OrderProduct>();
			}

			if (orderRow.product_id !== null) {
				//null is if no products in order
				currentOrder.products.push({
					quanity: orderRow.quantity,
					productId: orderRow.product_id,
					product: {
						id: orderRow.product_id,
						name: orderRow.name,
						price: orderRow.price,
						category: orderRow.category,
					},
				});
			}
		});
		return orders;
	}
}
