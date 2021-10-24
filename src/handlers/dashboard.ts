import express, { Request, Response } from "express";
import { DashboardQueries } from "../services/dashboard";

const dashboard = new DashboardQueries();

const popularProducts = async (_req: Request, res: Response) => {
	res.status(400);
	// try {
	// 	const products = await dashboard.popularProducts();
	// 	res.json(products);
	// } catch (error) {
	// 	console.log(error);
	// 	res.status(500).send((error as Error).message);
	// }
};

const dashboardRoutes = (app: express.Application) => {
	app.get("products/popular", popularProducts);
};

export default dashboardRoutes;
