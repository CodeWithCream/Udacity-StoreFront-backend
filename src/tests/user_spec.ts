import supertest from "supertest";
import { User, UserStore } from "../models/user";
import app from "../server";

const request = supertest(app);

describe("Test user API calls", () => {
	const ok = 200;
	const internalServerError = 500;
	const badRequest = 400;
	const notFound = 404;

	it("GET /users request should call UserStore", async () => {
		spyOn(UserStore.prototype, "index");
		await request.get("/users");
		expect(UserStore.prototype.index).toHaveBeenCalled();
	});

	it("GET /users request should return result from UserStore", async () => {
		const usersToReturn: User[] = [
			{
				id: 1,
				firstname: "Andrea",
				lastname: "Knez Karacic",
				username: "aknez",
				password: "a_password",
			},
			{
				id: 2,
				firstname: "Ivan",
				lastname: "Karacic",
				username: "ikaracic",
				password: "i_password",
			},
		];
		spyOn(UserStore.prototype, "index").and.returnValue(
			Promise.resolve(usersToReturn)
		);

		const result = await request.get("/users");
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(usersToReturn);
	});

	it("GET /users request should return InternalServerError if UserStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(UserStore.prototype, "index").and.throwError(errorToThrow);

		const result = await request.get("/users");
		expect(result.status).toEqual(internalServerError);
	});

	it("GET /users/:id request should call UserStore", async () => {
		spyOn(UserStore.prototype, "show");
		const userId = 1;
		await request.get(`/users/${userId}`);
		expect(UserStore.prototype.show).toHaveBeenCalledWith(userId);
	});

	it("GET /users/:id request should return result from UserStore", async () => {
		const userId = 1;
		const userToReturn: User = {
			id: userId,
			firstname: "Andrea",
			lastname: "Knez Karacic",
			username: "aknez",
			password: "a_password",
		};
		spyOn(UserStore.prototype, "show").and.returnValue(
			Promise.resolve(userToReturn)
		);

		const result = await request.get(`/users/${userId}`);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(userToReturn);
	});

	it("GET /users/:id request should return InternalServerError if UserStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(UserStore.prototype, "show").and.throwError(errorToThrow);

		const result = await request.get(`/users/1`);
		expect(result.status).toEqual(internalServerError);
	});

	it("GET /users/:id request should return NotFound if UserStore throws NotFoundError", async () => {
		//TODO
	});

	it("PUSH /users request should call UserStore", async () => {
		spyOn(UserStore.prototype, "createN");
		await request.post("/users").send([]);
		expect(UserStore.prototype.createN).toHaveBeenCalled();
	});

	it("PUSH /users hould return result from UserStore", async () => {
		const usersToCreate: User[] = [
			{
				firstname: "Andrea",
				lastname: "Knez Karacic",
				username: "aknez",
				password: "a_password",
			},
			{
				firstname: "Ivan",
				lastname: "Karacic",
				username: "ikaracic",
				password: "i_password",
			},
		];

		const usersToReturn = usersToCreate.map((user, index) => {
			const newUser = JSON.parse(JSON.stringify(user));
			newUser.id = index + 1;
			return newUser;
		});

		spyOn(UserStore.prototype, "createN").and.returnValue(
			Promise.resolve(usersToReturn)
		);

		const result = await request.post("/users").send(usersToCreate);
		expect(result.status).toEqual(ok);
		expect(result.body).toEqual(usersToReturn);
	});

	it("POST /users request should return InternalServerError if UserStore throws Error", async () => {
		const errorToThrow = new Error("error message");
		spyOn(UserStore.prototype, "createN").and.throwError(errorToThrow);

		const result = await request.post("/users").send([]);
		expect(result.status).toEqual(internalServerError);
	});

	it("POST /users request should return BadRequest if UserStore throws ArgumentError", async () => {
		//TODO
	});
});
