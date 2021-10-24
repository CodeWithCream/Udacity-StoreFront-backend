import express, { Request, Response } from "express";
import { OrderStore } from "../models/order";

const store = new OrderStore();

const currentOrderByUser = async (req: Request, res: Response) => {
	const userId: number = parseInt(req.params.id);

	try {
		const products = await store.showByUser(userId, false);
		res.json(products);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const userOrders = async (req: Request, res: Response) => {
	const userId: number = parseInt(req.params.id);
	const isCompleted: boolean = JSON.parse(req.params.completed);

	try {
		const products = await store.showByUser(userId, isCompleted);
		res.json(products);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const orderRoutes = (app: express.Application) => {
	app.get("users/:id/currentOrder", currentOrderByUser);
	app.get("users/:id/orders", userOrders);
};

export default orderRoutes;
