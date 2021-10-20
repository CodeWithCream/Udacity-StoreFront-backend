import { User, UserStore } from "../user";
import Client from "../../database";

const store = new UserStore();

describe("Test user model", () => {
	beforeEach(async function () {
		await addTestData();
	});

	it("should have an index method", () => {
		expect(store.index).toBeDefined();
	});

	it("index method should return a list of users", async () => {
		const createdUsers = await store.index();
		let i = 0;
		createdUsers.forEach((user) => {
			expect(user.id).toBeDefined();
			expect(user.password).toBeUndefined();
			expect(user.passwordDigest).toBeDefined();
			checkUserProperties(user, testData[i++]);
		});
	});

	it("should have a show method", () => {
		expect(store.show).toBeDefined();
	});

	it("show method should return the correct user", async () => {
		const user = await store.show(1);
		checkUserProperties(testData[0], user);
	});

	it("show method should throw error when user not exists", async () => {
		const userId = 10;
		await expectAsync(store.show(userId)).toBeRejectedWith(
			new Error(
				`Could not find user with id ${userId}. Error: User doesn't exist.`
			)
		);
	});

	it("should have a create method", () => {
		expect(store.create).toBeDefined();
	});

	it("create method should add an user", async () => {
		const userToCreate = {
			firstname: "User",
			lastname: "New Uer",
			username: "nuser",
			password: "n_password",
		};

		const createdUser = await store.create(userToCreate);

		checkUserProperties(userToCreate, createdUser);
	});

	it("create method should throw an error when password undefined", async () => {
		const userToCreate = {
			firstname: "User",
			lastname: "New User",
			username: "nuser",
			password: undefined,
		};

		await expectAsync(store.create(userToCreate)).toBeRejectedWith(
			new Error(
				`Could not add new user ${userToCreate.username}. Error: Password must be defined to create a new user.`
			)
		);

		const users = await store.index();
		expect(users.length).toEqual(testData.length); //no new users added
	});

	it("create method should throw an error when username not unique", async () => {
		const userToCreate = {
			firstname: "User",
			lastname: "New User",
			username: "aknez",
			password: "n_password",
		};

		await expectAsync(store.create(userToCreate)).toBeRejectedWith(
			new Error(
				`Could not add new user ${userToCreate.username}. error: duplicate key value violates unique constraint "users_username_key"`
			)
		);

		const users = await store.index();
		expect(users.length).toEqual(testData.length); //no new users added
	});

	it("should have a delete method", () => {
		expect(store.delete).toBeDefined();
	});

	it("delete method should remove the user", async () => {
		const deletedUser = await store.delete(1);
		checkUserProperties(deletedUser, testData[0]);

		const users = await store.index();

		expect(users.length).toEqual(testData.length - 1);
		let i = 1;
		users.forEach((user) => {
			expect(user.id).toBeDefined();
			expect(user.password).toBeUndefined();
			expect(user.passwordDigest).toBeDefined();
			checkUserProperties(user, testData[i++]);
		});
	});

	it("delete method should execute successfully when user doesn't exist", async () => {
		const deletedUser = await store.delete(10);
		expect(deletedUser).toBeUndefined();
	});

	afterEach(async function () {
		await clearTestData();
	});
});

const testData: Array<User> = [
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
	{
		firstname: "Viktor",
		lastname: "Karacic",
		username: "vkaracic",
		password: "v_password",
	},
	{
		firstname: "Hana",
		lastname: "Karacic",
		username: "hkaracic",
		password: "h_password",
	},
	{
		firstname: "Damian",
		lastname: "Karacic",
		username: "dkaracic",
		password: "d_password",
	},
];

async function addTestData(): Promise<void> {
	for await (const user of testData) {
		await store.create(user);
	}
}

async function clearTestData(): Promise<void> {
	try {
		const sql =
			"DELETE FROM users; ALTER SEQUENCE users_id_seq RESTART WITH 1;";
		const conn = await Client.connect();
		await conn.query(sql);
		conn.release();
	} catch (error) {
		throw new Error(`Could not delete test data. Error: ${error}`);
	}
}
function checkUserProperties(user1: User, user2: User) {
	expect(user1.firstname).toEqual(user2.firstname);
	expect(user1.lastname).toEqual(user2.lastname);
	expect(user1.username).toEqual(user2.username);
}
