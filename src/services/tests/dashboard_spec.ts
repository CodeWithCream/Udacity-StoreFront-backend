import Client from "../../database";
import { Order, OrderStore } from "../../models/order";
import { Product, ProductStore } from "../../models/product";
import { ProductCategory } from "../../models/product_category";
import { User, UserStore } from "../../models/user";
import { DashboardQueries } from "../dashboard";

const userStore = new UserStore();
const orderStore = new OrderStore();
const productStore = new ProductStore();
const dashboardQueries = new DashboardQueries();

describe("Test complex operations", () => {
	beforeEach(async function () {
		await addTestData();
	});

	afterEach(async function () {
		await clearTestData();
	});

	it("should have a mostPopular method", () => {
		expect(dashboardQueries.mostPopular).toBeDefined();
	});

	it("mostPopular method should return top 3 products contained in most orders", async () => {
		const top3 = await dashboardQueries.mostPopular(3);

		expect(top3.length).toEqual(3);

		const top3Ids = top3.map((product) => product.id);
		expect(top3Ids).toEqual([3, 2, 1]);

		checkProductProperties(top3[0], initProductsTestData[2]);
		checkProductProperties(top3[1], initProductsTestData[1]);
		checkProductProperties(top3[2], initProductsTestData[0]);
	});

	it("mostPopular method should return top 5 products contained in most orders", async () => {
		const order1 = await orderStore.create(1);
		await orderStore.addProduct(<number>order1.id, 8, 10000); //added large quantity but popularity is not changed

		const top5 = await dashboardQueries.mostPopular(5);

		expect(top5.length).toEqual(5);

		const top5Ids = top5.map((product) => product.id);
		expect(top5Ids).toEqual([3, 2, 1, 4, 5]);

		checkProductProperties(top5[0], initProductsTestData[2]);
		checkProductProperties(top5[1], initProductsTestData[1]);
		checkProductProperties(top5[2], initProductsTestData[0]);
		checkProductProperties(top5[3], initProductsTestData[3]);
		checkProductProperties(top5[4], initProductsTestData[4]);
	});

	it("mostPopular method should use active orders in calculation too", async () => {
		//two active orders, product 5 is in orders 2(completed)+2(active) times
		const order1 = await orderStore.create(1);
		await orderStore.addProduct(<number>order1.id, 5, 1);

		const order2 = await orderStore.create(2);
		await orderStore.addProduct(<number>order2.id, 5, 1);

		const top3 = await dashboardQueries.mostPopular(3);
		const top3Ids = top3.map((product) => product.id);
		expect(top3Ids).toEqual([3, 2, 5]);
	});

	async function addTestData(): Promise<void> {
		for await (const user of initUsersTestData) {
			await userStore.create(user);
		}

		for await (const product of initProductsTestData) {
			await productStore.create(product);
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

	async function clearTestData() {
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

	function checkProductProperties(product1: Product, product2: Product) {
		expect(product1.name).toEqual(product2.name);
		expect(product1.price).toEqual(product2.price);
		expect(product1.category).toEqual(product2.category);
	}

	const initUsersTestData: User[] = [
		{
			firstname: "User1",
			lastname: "User1",
			username: "user1",
			password: "u1_password",
		},
		{
			firstname: "User2",
			lastname: "User2",
			username: "user2",
			password: "u2_password",
		},
	];

	const initProductsTestData: Product[] = [
		{
			name: "Bread",
			price: 2.0,
			category: ProductCategory.Food,
		},
		{
			name: "Milk",
			price: 1.0,
			category: ProductCategory.Food,
		},
		{
			name: "Chocolate",
			price: 3.0,
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
		{
			name: "Samsung Galaxy S20",
			price: 1500.0,
			category: ProductCategory.Electronics,
		},
		{
			name: "Pen",
			price: 1.2,
			category: ProductCategory.Other,
		},
		{
			name: "Glue",
			price: 1.5,
			category: ProductCategory.Other,
		},
	];

	const initOrderTestData: Order[] = [
		{
			userId: 1,
			isCompleted: true,
			products: [
				{
					productId: 1,
					quanity: 1,
				},
				{
					productId: 2,
					quanity: 1,
				},
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
					quanity: 1,
				},
				{
					productId: 3,
					quanity: 1,
				},
				{
					productId: 4,
					quanity: 1,
				},
			],
		},
		{
			userId: 2,
			isCompleted: true,
			products: [
				{
					productId: 1,
					quanity: 1,
				},
				{
					productId: 2,
					quanity: 1,
				},
				{
					productId: 3,
					quanity: 1,
				},
				{
					productId: 5,
					quanity: 1,
				},
				{
					productId: 6,
					quanity: 1,
				},
			],
		},
		{
			userId: 2,
			isCompleted: true,
			products: [
				{
					productId: 2,
					quanity: 1,
				},
				{
					productId: 3,
					quanity: 1,
				},
				{
					productId: 4,
					quanity: 1,
				},
				{
					productId: 5,
					quanity: 1,
				},
				{
					productId: 7,
					quanity: 1,
				},
			],
		},
		{
			userId: 2,
			isCompleted: true,
			products: [
				{
					productId: 2,
					quanity: 1,
				},
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
					productId: 2,
					quanity: 1,
				},
				{
					productId: 3,
					quanity: 1,
				},
				{
					productId: 8,
					quanity: 1,
				},
			],
		},
	];
});
