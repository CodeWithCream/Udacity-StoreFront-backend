import Client from "../database";

export type User = {
	id: number;
	firstname: string;
	lastename: string;
	password_digest: string;
};
