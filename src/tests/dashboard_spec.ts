import supertest from "supertest";
import { DashboardQueries } from "../services/dashboard";
import app from "../server";
import { Product } from "../models/product";
import { ProductCategory } from "../models/product_category";

const request = supertest(app);

describe("Test dashboard API calls", () => {
	const ok = 200;
	const internalServerError = 500;

	it("GET /popular-products request should call DashboardQueries", async () => {
		spyOn(DashboardQueries.prototype, "mostPopular");
		const count = 3;
		await request.get(`/popular-products?count=${count}`);
		expect(DashboardQueries.prototype.mostPopular).toHaveBeenCalledWith(
			count
		);
	});

	it("GET /popular-products request should return result from DashboardQueries", async () => {
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
		spyOn(DashboardQueries.prototype, "mostPopular").and.returnValue(
			Promise.resolve(productsToReturn)
		);

		const result = await request.get("/popular-products?count=3");
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(productsToReturn);
	});

	it("GET /popular-products request should return InternalServerError if DashboardQueries throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(DashboardQueries.prototype, "mostPopular").and.throwError(
			errorToThrow
		);

		const result = await request.get("/popular-products?count=3");
		expect(result.status).toEqual(internalServerError);
	});
});
