import Client from "../database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export type User = {
	id?: number;
	firstname: string;
	lastname: string;
	username: string;
	password?: string;
	passwordDigest?: string;
};

export class UserStore {
	private defaultSaltRounds = "10";

	async index(): Promise<User[]> {
		try {
			const conn = await Client.connect();
			try {
				const sql = "SELECT * FROM users";
				const result = await conn.query(sql);
				const users = this.mapRowsToUsers(result.rows);

				return users;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not get users. ${error}`);
		}
	}

	async show(id: number): Promise<User> {
		try {
			const conn = await Client.connect();
			try {
				const sql = "SELECT * FROM users WHERE id=($1)";
				const result = await conn.query(sql, [id]);

				if (result.rows.length === 0) {
					throw new Error("User doesn't exist.");
				}

				const user = this.mapRowsToUsers(result.rows)[0];
				return user;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not find user with id ${id}. ${error}`);
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

			try {
				const sql =
					"INSERT INTO users(first_name, last_name, username, password_digest) VALUES ($1,$2,$3,$4) RETURNING *";

				const salt_rounds =
					process.env.salt_rounds ?? this.defaultSaltRounds;
				const hash = bcrypt.hashSync(
					user.password + process.env.pepper,
					parseInt(salt_rounds)
				);

				const result = await conn.query(sql, [
					user.firstname,
					user.lastname,
					user.username,
					hash,
				]);

				const createdUser = this.mapRowsToUsers(result.rows)[0];
				return createdUser;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(
				`Could not add new user ${user.username}. ${error}`
			);
		}
	}

	async createN(users: User[]): Promise<User[]> {
		try {
			const conn = await Client.connect();
			const createdUsers = new Array<User>();

			try {
				await conn.query("BEGIN");
				const sql =
					"INSERT INTO users(first_name, last_name, username, password_digest) VALUES ($1,$2,$3,$4) RETURNING *";

				for await (const user of users) {
					if (user.password === undefined) {
						throw new Error(
							`Could not add new user ${user.username}. Password must be defined to create a new user.`
						);
					}

					const salt_rounds =
						process.env.salt_rounds ?? this.defaultSaltRounds;
					const hash = bcrypt.hashSync(
						user.password + process.env.pepper,
						parseInt(salt_rounds)
					);

					const result = await conn.query(sql, [
						user.firstname,
						user.lastname,
						user.username,
						hash,
					]);

					const createdUser = this.mapRowsToUsers(result.rows)[0];

					createdUsers.push(createdUser);
				}

				await conn.query("COMMIT");

				return createdUsers;
			} catch (error) {
				await conn.query("ROLLBACK");
				throw error;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not create users. ${error}`);
		}
	}

	async delete(id: number): Promise<User> {
		try {
			const conn = await Client.connect();

			try {
				const sql = "DELETE FROM users WHERE id=($1) RETURNING *";
				const result = await conn.query(sql, [id]);
				const deletedUser = this.mapRowsToUsers(result.rows)[0];

				return deletedUser;
			} finally {
				conn.release();
			}
		} catch (error) {
			throw new Error(`Could not delete user with id = ${id}. ${error}`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private mapRowsToUsers(rows: any[]): User[] {
		const users = new Array<User>();
		rows.forEach((row) =>
			users.push({
				id: row.id,
				firstname: row.first_name,
				lastname: row.last_name,
				username: row.username,
				passwordDigest: row.password_digest,
				password: row.password,
			})
		);
		return users;
	}
}
