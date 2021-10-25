import express, { Request, Response } from "express";
import { DashboardQueries } from "../services/dashboard";

const dashboard = new DashboardQueries();

const popularProducts = async (req: Request, res: Response) => {
	const count: number = parseInt(req.query.count as string);
	try {
		const products = await dashboard.mostPopular(count);
		res.json(products);
	} catch (error) {
		console.log(error);
		res.status(500).send((error as Error).message);
	}
};

const dashboardRoutes = (app: express.Application) => {
	app.get("/popular-products", popularProducts);
};

export default dashboardRoutes;
