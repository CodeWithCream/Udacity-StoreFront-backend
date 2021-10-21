import { Product, ProductStore } from "../product";
import Client from "../../database";
import { ProductCategory } from "../product_category";

const store = new ProductStore();

describe("Test product model", () => {
	describe("Test basic operations", () => {
		beforeEach(async function () {
			await addTestData();
		});

		afterEach(async function () {
			await clearTestData();
		});

		it("should have an index method", () => {
			expect(store.index).toBeDefined();
		});

		it("index method should return a list of products", async () => {
			const products = await store.index();
			let i = 0;
			products.forEach((product) => {
				expect(product.id).toBeDefined();
				checkProductProperties(product, initTestData[i++]);
			});
		});

		it("should have a show method", () => {
			expect(store.show).toBeDefined();
		});

		it("show method should return the correct product", async () => {
			const product = await store.show(1);
			checkProductProperties(initTestData[0], product);
		});

		it("show method should throw error when product not exists", async () => {
			const productId = 10;
			await expectAsync(store.show(productId)).toBeRejectedWith(
				new Error(
					`Could not find product with id ${productId}. Error: Product doesn't exist.`
				)
			);
		});

		it("should have a create method", () => {
			expect(store.create).toBeDefined();
		});

		it("create method should add a product", async () => {
			const productToCreate = {
				name: "New product",
				price: 150.2,
				category: ProductCategory.Other,
			};

			const createdProduct = await store.create(productToCreate);

			checkProductProperties(productToCreate, createdProduct);
		});

		it("create method should throw an error when name not unique", async () => {
			const productToCreate = {
				name: "Bread",
				price: 15.2,
				category: ProductCategory.Other,
			};

			await expectAsync(store.create(productToCreate)).toBeRejectedWith(
				new Error(
					`Could not create new product ${productToCreate.name}. error: duplicate key value violates unique constraint "products_name_key"`
				)
			);

			const products = await store.index();
			expect(products.length).toEqual(initTestData.length); //no new products added
		});

		it("should have a delete method", () => {
			expect(store.delete).toBeDefined();
		});

		it("delete method should remove the product", async () => {
			const deletedProduct = await store.delete(1);
			checkProductProperties(deletedProduct, initTestData[0]);

			const products = await store.index();

			expect(products.length).toEqual(initTestData.length - 1);
			let i = 1;
			products.forEach((product) =>
				checkProductProperties(product, initTestData[i++])
			);
		});

		it("delete method should execute successfully when product doesn't exist", async () => {
			const deletedProduct = await store.delete(10);
			expect(deletedProduct).toBeUndefined();
		});

		const initTestData: Product[] = [
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

		async function addTestData(): Promise<void> {
			for await (const product of initTestData) {
				await store.create(product);
			}
		}

		async function clearTestData(): Promise<void> {
			try {
				const sql =
					"DELETE FROM products; ALTER SEQUENCE products_id_seq RESTART WITH 1;";
				const conn = await Client.connect();
				await conn.query(sql);
				conn.release();
			} catch (error) {
				throw new Error(`Could not delete test data. Error: ${error}`);
			}
		}

		function checkProductProperties(product1: Product, product2: Product) {
			expect(product1.name).toEqual(product2.name);
			expect(product1.price).toEqual(product2.price);
			expect(product1.category).toEqual(product2.category);
		}
	});
});
