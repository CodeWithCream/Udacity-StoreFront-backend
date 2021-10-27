import express, { Request, Response } from "express";
import { ProductStore } from "../models/product";
import { AuthMiddleware } from "./middlewares/verify_auth_token";

const store = new ProductStore();
const authMiddleware = new AuthMiddleware();

const index = async (_req: Request, res: Response) => {
	try {
		const products = await store.index();
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
		/*switch (true) {
            case e instanceof NotFoundError:
              return res.status(404).send((error as Error).message);
            default:
              return res.status(500).send((error as Error).message);
          }*/
		return res.status(500).send((error as Error).message);
	}
};

const create = async (req: Request, res: Response) => {
	const productToCreate = req.body.product;

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
