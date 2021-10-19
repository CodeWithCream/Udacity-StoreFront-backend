import Client from "../database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export type User = {
	id: number;
	firstname: string;
	lastname: string;
	username: string;
	password: string | undefined;
	password_digest: string;
};

export class UserStore {
	defaultSaltRounds = 10;
	async index(): Promise<User[]> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM users";

			const result = await conn.query(sql);

			conn.release();

			return result.rows;
		} catch (error) {
			throw new Error(`Could not get users. Error: ${error}`);
		}
	}

	async show(id: number): Promise<User> {
		try {
			const conn = await Client.connect();
			const sql = "SELECT * FROM users WHERE id=($1)";

			const result = await conn.query(sql, [id]);

			conn.release();

			return result.rows[0];
		} catch (error) {
			throw new Error(
				`Could not find user with id ${id}. Error: ${error}`
			);
		}
	}

	async create(user: User): Promise<User> {
		try {
			if (user.password === undefined) {
				throw new Error(
					`Password must be defined to create a new user.`
				);
			}

			const conn = await Client.connect();
			const sql =
				"INSERT INTO users(firstname, lastname, username, password_digest) VALUES ($1,$2,$3,$4) RETURNING *";

			const hash = bcrypt.hashSync(
				user.password + process.env.pepper,
				process.env.salt_rounds ?? this.defaultSaltRounds
			);

			const result = await conn.query(sql, [
				user.firstname,
				user.lastname,
				user.username,
				hash,
			]);

			const createdUser = result.rows[0];
			conn.release();

			return createdUser;
		} catch (error) {
			throw new Error(
				`Could not add new user ${user.username}. Error: ${error}`
			);
		}
	}

	async delete(id: string): Promise<User> {
		try {
			const sql = "DELETE FROM users WHERE id=($1)";
			const conn = await Client.connect();

			const result = await conn.query(sql, [id]);

			const deletedUser = result.rows[0];

			conn.release();

			return deletedUser;
		} catch (error) {
			throw new Error(
				`Could not delete user with id = ${id}. Error: ${error}`
			);
		}
	}
}
