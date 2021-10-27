import express, { Request, Response } from "express";
import { Product, ProductStore } from "../models/product";
import { AuthMiddleware } from "./middlewares/verify_auth_token";

const store = new ProductStore();
const authMiddleware = new AuthMiddleware();

const index = async (req: Request, res: Response) => {
	const category: string = req.query.category as string;
	try {
		let products: Product[] = [];
		if (category === undefined) {
			//get all
			products = await store.index();
		} else {
			products = await store.productsByCategory(category);
		}
		res.json(products);
	} catch (error) {
		console.log(error);
		res.status(500).send((error as Error).message);
	}
};

const show = async (req: Request, res: Response) => {
	const productId: number = parseInt(req.params.id);
	try {
		const product = await store.show(productId);
		res.json(product);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const create = async (req: Request, res: Response) => {
	const productToCreate = req.body as Product;

	try {
		const createdProduct = await store.create(productToCreate);
		res.json(createdProduct);
	} catch (error) {
		console.log(error);
		return res.status(500).send((error as Error).message);
	}
};

const productRoutes = (app: express.Application) => {
	app.get("/products", index);
	app.get("/products/:id", show);
	app.post("/products", authMiddleware.verifyAuthToken, create);
};

export default productRoutes;
