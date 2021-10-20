import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const {
	DATABASE_HOST,
	DATABASE_NAME,
	DATABASE_USER,
	DATABASE_PASSWORD,
	TEST_DATABASE_HOST,
	TEST_DATABASE_NAME,
	TEST_DATABASE_USER,
	TEST_DATABASE_PASSWORD,
	ENV,
} = process.env;

let client: Pool;

if (ENV === "test") {
	client = new Pool({
		host: DATABASE_HOST,
		database: DATABASE_NAME,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
	});
} else {
	/*dev*/
	client = new Pool({
		host: TEST_DATABASE_HOST,
		database: TEST_DATABASE_NAME,
		user: TEST_DATABASE_USER,
		password: TEST_DATABASE_PASSWORD,
	});
}

export default client;
