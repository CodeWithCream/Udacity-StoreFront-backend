import supertest from "supertest";
import { Order, OrderStore } from "../../models/order";
import app from "../../server";

const request = supertest(app);

describe("Test order API calls", () => {
	const ok = 200;
	const internalServerError = 500;

	it("GET /users/:id/currentOrder request should call OrderStore", async () => {
		const userId = 1;
		spyOn(OrderStore.prototype, "showByUser");
		await request.get(`/users/${userId}/currentOrder`);
		expect(OrderStore.prototype.showByUser).toHaveBeenCalledWith(
			userId,
			false
		);
	});

	it("GET /users/:id/currentOrder request should return result from OrderStore", async () => {
		const userId = 1;
		const orderToReturn: Order = {
			id: 2,
			userId: userId,
			isCompleted: false,
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
		};
		const ordersToReturn: Order[] = [orderToReturn];
		spyOn(OrderStore.prototype, "showByUser").and.returnValue(
			Promise.resolve(ordersToReturn)
		);

		const result = await request.get(`/users/${userId}/currentOrder`);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(orderToReturn);
	});

	it("GET /users/:id/currentOrder request should return InternalServerError if OrderStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(OrderStore.prototype, "showByUser").and.throwError(errorToThrow);

		const result = await request.get("/users/1/currentOrder");
		expect(result.status).toEqual(internalServerError);
	});

	it("GET /users/:id/orders request should call OrderStore", async () => {
		const userId = 1;
		spyOn(OrderStore.prototype, "showByUser");
		await request.get(`/users/${userId}/orders`);
		expect(OrderStore.prototype.showByUser).toHaveBeenCalledWith(
			userId,
			undefined
		);
	});

	it("GET /users/:id/orders?completed=true request should call OrderStore", async () => {
		const userId = 1;
		const completed = true;
		spyOn(OrderStore.prototype, "showByUser");
		await request.get(`/users/${userId}/orders?completed=${completed}`);
		expect(OrderStore.prototype.showByUser).toHaveBeenCalledWith(
			userId,
			completed
		);
	});

	it("GET /users/:id/orders?completed=false request should call OrderStore", async () => {
		const userId = 1;
		const completed = false;
		spyOn(OrderStore.prototype, "showByUser");
		await request.get(`/users/${userId}/orders?completed=${completed}`);
		expect(OrderStore.prototype.showByUser).toHaveBeenCalledWith(
			userId,
			completed
		);
	});

	it("GET /users/:id/orders request should return result from OrderStore", async () => {
		const userId = 1;
		const ordersToReturn: Order[] = [
			{
				id: 2,
				userId: userId,
				isCompleted: true,
				products: [
					{
						productId: 1,
						quanity: 2,
					},
				],
			},
			{
				id: 1,
				userId: userId,
				isCompleted: true,
				products: [],
			},
		];
		spyOn(OrderStore.prototype, "showByUser").and.returnValue(
			Promise.resolve(ordersToReturn)
		);

		const result = await request.get(`/users/${userId}/orders`);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(ordersToReturn);
	});

	it("GET /users/:id/orders request should return InternalServerError if OrderStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(OrderStore.prototype, "showByUser").and.throwError(errorToThrow);

		const result = await request.get("/users/1/orders");
		expect(result.status).toEqual(internalServerError);
	});
});
