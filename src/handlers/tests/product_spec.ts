import supertest from "supertest";
import { Product, ProductStore } from "../../models/product";
import { ProductCategory } from "../../models/product_category";
import app from "../../server";

const request = supertest(app);

describe("Test product API calls", () => {
	const ok = 200;
	const internalServerError = 500;

	it("GET /products request should call ProductStore", async () => {
		spyOn(ProductStore.prototype, "index");
		await request.get("/products");
		expect(ProductStore.prototype.index).toHaveBeenCalled();
	});

	it("GET /products request should return result from ProductStore", async () => {
		const productsToReturn: Product[] = [
			{
				name: "Prod1",
				price: 1,
				category: ProductCategory.Food,
			},
			{
				name: "Prod2",
				price: 2,
				category: ProductCategory.Books,
			},
		];
		spyOn(ProductStore.prototype, "index").and.returnValue(
			Promise.resolve(productsToReturn)
		);

		const result = await request.get("/products");
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(productsToReturn);
	});

	it("GET /products request should return InternalServerError if ProductStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(ProductStore.prototype, "index").and.throwError(errorToThrow);

		const result = await request.get("/products");
		expect(result.status).toEqual(internalServerError);
	});

	it("GET /products?category=food request should call ProductStore", async () => {
		spyOn(ProductStore.prototype, "productsByCategory");
		await request.get("/products?category=food");
		expect(ProductStore.prototype.productsByCategory).toHaveBeenCalled();
	});

	it("GET /products?category=food request should return result from ProductStore", async () => {
		const productsToReturn: Product[] = [
			{
				name: "Prod1",
				price: 1,
				category: ProductCategory.Food,
			},
			{
				name: "Prod2",
				price: 2,
				category: ProductCategory.Books,
			},
		];
		spyOn(ProductStore.prototype, "productsByCategory").and.returnValue(
			Promise.resolve(productsToReturn)
		);

		const result = await request.get("/products?category=food");
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(productsToReturn);
	});

	it("GET /products?category=food request should return InternalServerError if ProductStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(ProductStore.prototype, "productsByCategory").and.throwError(
			errorToThrow
		);

		const result = await request.get("/products?category=food");
		expect(result.status).toEqual(internalServerError);
	});

	it("GET /users/:id request should call ProductStore", async () => {
		spyOn(ProductStore.prototype, "show");
		const productId = 1;
		await request.get(`/products/${productId}`);
		expect(ProductStore.prototype.show).toHaveBeenCalledWith(productId);
	});

	it("GET /products/:id request should return result from ProductStore", async () => {
		const productId = 1;
		const productToReturn: Product = {
			id: productId,
			name: "Product",
			price: 5,
			category: ProductCategory.Other,
		};
		spyOn(ProductStore.prototype, "show").and.returnValue(
			Promise.resolve(productToReturn)
		);

		const result = await request.get(`/products/${productId}`);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(productToReturn);
	});

	it("GET /products/:id request should return InternalServerError if ProductStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(ProductStore.prototype, "show").and.throwError(errorToThrow);

		const result = await request.get("/products/1");
		expect(result.status).toEqual(internalServerError);
	});

	it("POST /products request should call ProductStore", async () => {
		spyOn(ProductStore.prototype, "create");
		await request.post("/products").send(productToCreate);
		expect(ProductStore.prototype.create).toHaveBeenCalled();
	});

	it("POST /products should return result from ProductStore", async () => {
		const productToReturn = JSON.parse(JSON.stringify(productToCreate));
		productToReturn.id = 1;

		spyOn(ProductStore.prototype, "create").and.returnValue(
			Promise.resolve(productToReturn)
		);

		const result = await request.post("/products").send(productToCreate);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(productToReturn);
	});

	it("POST /products request should return InternalServerError if ProductStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(ProductStore.prototype, "create").and.throwError(errorToThrow);

		const result = await request.post("/products").send(productToCreate);
		expect(result.status).toEqual(internalServerError);
	});

	const productToCreate: Product = {
		name: "prod1",
		price: 1,
		category: ProductCategory.Other,
	};
});
