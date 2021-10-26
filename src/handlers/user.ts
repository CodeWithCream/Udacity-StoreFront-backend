import express, { Request, response, Response } from "express";
import { User, UserStore } from "../models/user";
import jwt from "jsonwebtoken";

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
	try {
		const users = await store.index();
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).send((error as Error).message);
	}
};

const show = async (req: Request, res: Response) => {
	const userId: number = parseInt(req.params.id);
	try {
		const user = await store.show(userId);
		res.json(user);
	} catch (error) {
		console.log(error);
		/*switch (true) {
            case e instanceof NotFoundError:
              return res.status(404).send((error as Error).message);
            default:
              return res.status(500).send((error as Error).message);
          }*/
		return res.status(500).send((error as Error).message);
	}
};

const createN = async (req: Request, res: Response) => {
	const usersToCreate: User[] = req.body.users;

	try {
		const createdUsers = await store.createN(usersToCreate);
		const userTokens = createdUsers.map((user) => {
			return jwt.sign({ user: user }, process.env.TOKEN_SECRET as string);
		});
		res.json(userTokens);
	} catch (error) {
		console.log(error);
		/*switch (true) {
            case e instanceof NotFoundError:
              return res.status(404).send((error as Error).message);
            default:
              return res.status(500).send((error as Error).message);
          }*/
		return res.status(500).send((error as Error).message);
	}
};

const authenticate = async (req: Request, res: Response) => {
	const loginData = {
		username: req.body.username,
		password: req.body.password,
	};

	try {
		const user = await store.authenticate(
			loginData.username,
			loginData.password
		);
		if (user == null) {
			res.status(401);
		}
		const token = jwt.sign(
			{ user: user },
			process.env.TOKEN_SECRET as string
		);
		res.json(token);
	} catch (error) {
		res.status(401).json((error as Error).message);
	}
};

const userRoutes = (app: express.Application) => {
	app.get("/users", index);
	app.get("/users/:id", show);
	app.post("/users", createN);
	app.post("/users/authenticate", authenticate);
};

export default userRoutes;
