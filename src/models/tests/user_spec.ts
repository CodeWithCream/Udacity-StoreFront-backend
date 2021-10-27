import Client from "../../database";
import { User, UserStore } from "../user";

const store = new UserStore();

describe("Test user model", () => {
	beforeEach(async function () {
		await addTestData();
	});

	afterEach(async function () {
		await clearTestData();
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
			checkUserProperties(user, initTestData[i++]);
		});
	});

	it("should have a show method", () => {
		expect(store.show).toBeDefined();
	});

	it("show method should return the correct user", async () => {
		const userId = 1;
		const user = await store.show(userId);
		checkUserProperties(initTestData[userId - 1], user);
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
			lastname: "New User",
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
		expect(users.length).toEqual(initTestData.length); //no new users added
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
		expect(users.length).toEqual(initTestData.length); //no new users added
	});

	it("should have a delete method", () => {
		expect(store.delete).toBeDefined();
	});

	it("delete method should remove the user", async () => {
		const userId = 1;
		const deletedUser = await store.delete(userId);
		checkUserProperties(deletedUser, initTestData[userId - 1]);

		const users = await store.index();

		expect(users.length).toEqual(initTestData.length - 1);
		let i = 1;
		users.forEach((user) => {
			expect(user.id).toBeDefined();
			expect(user.password).toBeUndefined();
			expect(user.passwordDigest).toBeDefined();
			checkUserProperties(user, initTestData[i++]);
		});
	});

	it("delete method should execute successfully when user doesn't exist", async () => {
		const userId = 10;
		const deletedUser = await store.delete(userId);
		expect(deletedUser).toBeUndefined();
	});

	it("should have a createN method", () => {
		expect(store.createN).toBeDefined();
	});

	it("createN method should add users", async () => {
		const createdUsers = await store.createN(newUsersData);

		let i = 0;
		createdUsers.forEach((user) => {
			expect(user.id).toBeDefined();
			expect(user.password).toBeUndefined();
			expect(user.passwordDigest).toBeDefined();
			checkUserProperties(user, newUsersData[i++]);
		});

		const users = await store.index();
		expect(users.length).toEqual(initTestData.length + newUsersData.length);
	});

	it("createN method should rollback if some user has error", async () => {
		const usersToCreate = JSON.parse(JSON.stringify(newUsersData)); //create copy of array

		usersToCreate[1].password = undefined;

		await expectAsync(store.createN(usersToCreate)).toBeRejectedWith(
			new Error(
				`Could not create users. Error: Could not add new user ${usersToCreate[1].username}. Password must be defined to create a new user.`
			)
		);

		const users = await store.index();
		expect(users.length).toEqual(initTestData.length); //no new users
	});

	it("should have a authenticate method", () => {
		expect(store.authenticate).toBeDefined();
	});

	it("authenticate method should check password", async () => {
		const userToAuthenticate = initTestData[0];
		const authenticatedUser = <User>(
			await store.authenticate(
				userToAuthenticate.username,
				userToAuthenticate.password as string
			)
		);

		expect(authenticatedUser.passwordDigest).toBeDefined();
		checkUserProperties(authenticatedUser, initTestData[0]);
	});

	it("authenticate method should return null if password don't match", async () => {
		const userToAuthenticate = initTestData[0];
		const authenticatedUser = <User>(
			await store.authenticate(userToAuthenticate.username, "wrongPass")
		);

		expect(authenticatedUser).toBeNull();
	});

	it("authenticate method should return null if user doesn't exist", async () => {
		const authenticatedUser = <User>(
			await store.authenticate(
				"wrongUsername",
				initTestData[0].password as string
			)
		);

		expect(authenticatedUser).toBeNull();
	});
	
	async function addTestData(): Promise<void> {
		for await (const user of initTestData) {
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

	const initTestData: Array<User> = [
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

	const newUsersData: Array<User> = [
		{
			firstname: "User1",
			lastname: "New User",
			username: "nuser1",
			password: "n_password1",
		},
		{
			firstname: "User2",
			lastname: "New User",
			username: "nuser2",
			password: "n_password2",
		},
		{
			firstname: "User3",
			lastname: "New User",
			username: "nuser3",
			password: "n_password3",
		},
	];
});
