import express, { Request, Response } from "express";
import { OrderStore } from "../models/order";
import { AuthMiddleware } from "./middlewares/verify_auth_token";

const store = new OrderStore();
const authMiddleware = new AuthMiddleware();

const currentOrderByUser = async (req: Request, res: Response) => {
	const userId: number = parseInt(req.params.id);
	try {
		const orders = await store.showByUser(userId, false);
		res.json(orders != undefined ? orders[0] : undefined);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const userOrders = async (req: Request, res: Response) => {
	const userId: number = parseInt(req.params.id);
	const completedQueryString = req.query.completed;
	const isCompleted =
		completedQueryString !== undefined
			? JSON.parse(<string>completedQueryString)
			: undefined;

	try {
		const products = await store.showByUser(userId, isCompleted);
		res.json(products);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const orderRoutes = (app: express.Application) => {
	app.get("/users/:id/currentOrder", currentOrderByUser);
	app.get("/users/:id/orders", authMiddleware.verifyAuthToken, userOrders);
};

export default orderRoutes;
