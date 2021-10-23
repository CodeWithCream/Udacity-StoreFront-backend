import Client from "../../database";
import { Order, OrderStore } from "../order";
import { Product, ProductStore } from "../product";
import { ProductCategory } from "../product_category";
import { User, UserStore } from "../user";
import { OrderProduct } from "../order_products";

const userorderStore = new UserStore();
const productorderStore = new ProductStore();
const orderStore = new OrderStore();

describe("Test order model", () => {
	beforeEach(async function () {
		await addTestData();
	});

	afterEach(async function () {
		await clearTestData();
	});

	it("should have an index method", () => {
		expect(orderStore.index).toBeDefined();
	});

	it("index method should return a list of orders", async () => {
		const createdOrders = await orderStore.index();

		expect(createdOrders.length).toEqual(initOrderTestData.length);

		let i = 0;
		createdOrders.forEach((order) => {
			expect(order.id).toBeDefined();
			expect(order.userId).toEqual(initOrderTestData[i].userId);
			expect(order.isCompleted).toEqual(initOrderTestData[i].isCompleted);
			i++;
		});
	});

	it("should have a show method", () => {
		expect(orderStore.show).toBeDefined();
	});

	it("show method should return the correct order without products", async () => {
		const orderId = 3;
		const order = await orderStore.show(orderId);
		checkOrderProperties(order, initOrderTestData[orderId - 1]);
	});

	it("show method should return the correct order with products", async () => {
		const orderId = 1;
		const order = await orderStore.show(orderId);
		checkOrderProperties(order, initOrderTestData[orderId - 1]);
	});

	it("show method should throw error when order not exists", async () => {
		const orderId = 10;
		await expectAsync(orderStore.show(orderId)).toBeRejectedWith(
			new Error(
				`Could not find order with id ${orderId}. Error: Order doesn't exist.`
			)
		);
	});

	it("should have a create method", () => {
		expect(orderStore.create).toBeDefined();
	});

	it("create method should add an order", async () => {
		const userId = 3;
		const createdOrder = await orderStore.create(userId);

		expect(createdOrder.id).toBeDefined();
		expect(createdOrder.userId).toEqual(userId);
		expect(createdOrder.isCompleted).toBeFalse();
		expect(createdOrder.products).toBeUndefined();
	});

	it("create method should throw an error if an user already has an active order", async () => {
		const userId = 3;
		await orderStore.create(userId);

		await expectAsync(orderStore.create(userId)).toBeRejectedWith(
			new Error(
				`Could not create new order. Error: User already has an active order.`
			)
		);
	});

	it("create method should throw an error if user doesn't exist", async () => {
		const userId = 10;

		await expectAsync(orderStore.create(userId)).toBeRejectedWith(
			new Error(
				`Could not create new order. error: insert or update on table "orders" violates foreign key constraint "orders_user_id_fkey"`
			)
		);
	});

	it("should have a delete method", () => {
		expect(orderStore.delete).toBeDefined();
	});

	it("delete method should remove the order without products", async () => {
		const orderId = 3;
		const deletedOrder = await orderStore.delete(orderId);
		checkOrderProperties(deletedOrder, initOrderTestData[orderId - 1]);
	});

	it("delete method should remove the order with products", async () => {
		const orderId = 1;
		const deletedOrder = await orderStore.delete(orderId);

		expect(deletedOrder.id).toEqual(orderId);
		expect(deletedOrder.userId).toEqual(
			initOrderTestData[orderId - 1].userId
		);
		expect(deletedOrder.isCompleted).toEqual(
			initOrderTestData[orderId - 1].isCompleted
		);

		const sql = `SELECT * FROM order_products WHERE order_id = ${orderId};`;
		const conn = await Client.connect();
		const result = await conn.query(sql);
		conn.release();

		expect(result.rows.length).toEqual(0);
	});

	it("delete method should execute successfully when order doesn't exist", async () => {
		const orderId = 10;
		const deletedOrder = await orderStore.delete(orderId);
		expect(deletedOrder).toBeUndefined();
	});

	it("should have a addProduct method", () => {
		expect(orderStore.addProduct).toBeDefined();
	});

	it("addProduct method should add a product to existing order", async () => {
		const orderId = 5;
		const productId = 1;
		const quantity = 5;
		await orderStore.addProduct(orderId, productId, quantity);

		const updatedOrder = await orderStore.show(orderId);

		expect(updatedOrder.products?.length).toEqual(
			(<OrderProduct[]>initOrderTestData[orderId - 1].products).length + 1
		);
		const addedProduct = (<OrderProduct[]>updatedOrder.products)[
			(<OrderProduct[]>updatedOrder.products).length - 1
		];
		expect(addedProduct.productId).toEqual(productId);
		expect(addedProduct.quanity).toEqual(quantity);
	});

	it("addProduct method should throw an error if order is completed", async () => {
		const orderId = 1;
		const productId = 1;
		const quantity = 5;

		await expectAsync(
			orderStore.addProduct(orderId, productId, quantity)
		).toBeRejectedWith(
			new Error(
				`Could not add product with id ${productId} to order with id ${orderId}. Error: Order is completed`
			)
		);
	});

	it("add Product should increase quantity if product already in order", async () => {
		const orderId = 5;
		const productId = 3;
		const quantity = 5;
		await orderStore.addProduct(orderId, productId, quantity);

		const updatedOrder = await orderStore.show(orderId);

		expect(updatedOrder.products?.length).toEqual(
			(<OrderProduct[]>initOrderTestData[orderId - 1].products).length
		); //no length change
		const updatedProduct = (<OrderProduct[]>updatedOrder.products)[0];

		const testProduct = (<OrderProduct[]>(
			initOrderTestData[orderId - 1].products
		))[0];
		expect(updatedProduct.quanity).toEqual(testProduct.quanity + quantity);
	});

	it("addProduct method should throw an error if order doesn't exist", async () => {
		const orderId = 10;
		const productId = 3;
		const quantity = 5;

		await expectAsync(
			orderStore.addProduct(orderId, productId, quantity)
		).toBeRejectedWith(
			new Error(
				`Could not add product with id ${productId} to order with id ${orderId}. Error: Order doesn't exist`
			)
		);
	});

	it("should have a completeOrder method", () => {
		expect(orderStore.completeOrder).toBeDefined();
	});

	it("completeOrder should complete active order", async () => {
		const orderId = 5;
		expect(initOrderTestData[orderId - 1].isCompleted).toBeFalse();

		await orderStore.completeOrder(orderId);

		const order = await orderStore.show(orderId);
		expect(order.isCompleted).toBeTrue();
	});

	it("complete order should do nothing to completed order", async () => {
		const orderId = 1;
		expect(initOrderTestData[orderId - 1].isCompleted).toBeTrue();

		await orderStore.completeOrder(orderId);

		const order = await orderStore.show(orderId);
		expect(order.isCompleted).toBeTrue();
	});

	it("completeOrder method should throw an error if order doesn't exist", async () => {
		const orderId = 10;

		await expectAsync(orderStore.completeOrder(orderId)).toBeRejectedWith(
			new Error(
				`Could not complete order with id ${orderId}. Error: Order doesn't exist`
			)
		);
	});

	it("should have a showByUser method", () => {
		expect(orderStore.showByUser).toBeDefined();
	});

	it("showByUser method should return orders for user", async () => {
		const userId = 1;
		const orders = await orderStore.showByUser(userId);

		expect(orders.length).toEqual(3);
		let i = 0;
		orders.forEach((order) => {
			checkOrderProperties(order, initOrderTestData[i++]);
		});
	});

	it("showByUser method should return completed orders for user", async () => {
		const userId = 1;
		const orders = await orderStore.showByUser(userId, true);

		expect(orders.length).toEqual(2);
		let i = 0;
		orders.forEach((order) => {
			checkOrderProperties(order, initOrderTestData[i++]);
		});
	});

	it("showByUser method should return active order for user", async () => {
		const userId = 1;
		const orders = await orderStore.showByUser(userId, false);

		expect(orders.length).toEqual(1);
		checkOrderProperties(orders[0], initOrderTestData[2]);
	});

	it("showByUser methoud should return empty if user has no orders", async () => {
		const userId = 3;
		const orders = await orderStore.showByUser(userId);

		expect(orders.length).toEqual(0);
	});

	it("showByUser methoud should return empty if user doesn't exist", async () => {
		const userId = 10;
		const orders = await orderStore.showByUser(userId);

		expect(orders.length).toEqual(0);
	});

	async function addTestData(): Promise<void> {
		for await (const user of initUsersTestData) {
			await userorderStore.create(user);
		}

		for await (const product of initProductsTestData) {
			await productorderStore.create(product);
		}

		for await (const order of initOrderTestData) {
			const createdOrder = await orderStore.create(order.userId);
			if (order.products) {
				for await (const product of order.products) {
					await orderStore.addProduct(
						<number>createdOrder.id,
						product.productId,
						product.quanity
					);
				}
			}
			if (order.isCompleted) {
				await orderStore.completeOrder(<number>createdOrder.id);
			}
		}
	}

	async function clearTestData(): Promise<void> {
		try {
			const sql =
				"DELETE FROM order_products;" +
				"DELETE FROM orders; ALTER SEQUENCE orders_id_seq RESTART WITH 1;" +
				"DELETE FROM users; ALTER SEQUENCE users_id_seq RESTART WITH 1;" +
				"DELETE FROM products; ALTER SEQUENCE products_id_seq RESTART WITH 1;";
			const conn = await Client.connect();
			await conn.query(sql);
			conn.release();
		} catch (error) {
			throw new Error(`Could not delete test data. ${error}`);
		}
	}

	const initUsersTestData: User[] = [
		{
			firstname: "Udacity",
			lastname: "User",
			username: "uuser",
			password: "u_password",
		},
		{
			firstname: "Udacity",
			lastname: "Admin",
			username: "uadmin",
			password: "ua_password",
		},
		{
			firstname: "Udacity",
			lastname: "Third",
			username: "uthird",
			password: "ut_password",
		},
	];

	const initProductsTestData: Product[] = [
		{
			name: "Bread",
			price: 2.0,
			category: ProductCategory.Food,
		},
		{
			name: "The Midset",
			price: 20.0,
			category: ProductCategory.Books,
		},
		{
			name: "Lenovo T40",
			price: 2000.0,
			category: ProductCategory.Electronics,
		},
	];

	const initOrderTestData: Order[] = [
		{
			userId: 1,
			isCompleted: true,
			products: [
				{
					productId: 3,
					quanity: 1,
				},
			],
		},
		{
			userId: 1,
			isCompleted: true,
			products: [
				{
					productId: 1,
					quanity: 2,
				},
				{
					productId: 2,
					quanity: 1,
				},
			],
		},
		{
			userId: 1,
			isCompleted: false,
		},
		{
			userId: 2,
			isCompleted: true,
			products: [
				{
					productId: 3,
					quanity: 2,
				},
				{
					productId: 2,
					quanity: 10,
				},
			],
		},
		{
			userId: 2,
			isCompleted: false,
			products: [
				{
					productId: 3,
					quanity: 3,
				},
				{
					productId: 2,
					quanity: 3,
				},
			],
		},
	];

	function checkOrderProperties(createdOrder: Order, testOrder: Order): void {
		expect(createdOrder.id).toBeDefined();
		expect(createdOrder.userId).toEqual(testOrder.userId);
		expect(createdOrder.isCompleted).toEqual(testOrder.isCompleted);
		expect(createdOrder.products?.length ?? 0).toEqual(
			testOrder.products?.length ?? 0
		);

		if (testOrder.products) {
			expect(testOrder.products).toBeDefined();
			let i = 0;
			(<OrderProduct[]>createdOrder.products).forEach((orderProduct) => {
				const testProduct = (<OrderProduct[]>testOrder.products)[i];
				expect(orderProduct.productId).toEqual(testProduct.productId);
				expect(orderProduct.product).toBeDefined();
				expect(orderProduct.product?.id).toEqual(testProduct.productId);
				expect(orderProduct.quanity).toEqual(testProduct.quanity);
				i++;
			});
		}
	}
});
