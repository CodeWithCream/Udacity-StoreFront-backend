import express, { Request, response, Response } from "express";
import { User, UserStore } from "../models/user";

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
		res.json(createdUsers);
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

const userRoutes = (app: express.Application) => {
	app.get("/users", index);
	app.get("/users/:id", show);
	app.post("/users", createN);
};

export default userRoutes;
