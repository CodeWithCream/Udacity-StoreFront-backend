import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthMiddleware {
	verifyAuthToken(req: Request, res: Response, next: NextFunction) {
		if (process.env.ENV === "test") {
			console.log("VERIFY FOR TEST");
			//in tests, skip verification
			//TODO: change tests using https://stackoverflow.com/a/41997328/713126 so verifyAuthToken can be spied on
			next();
		} else {
			try {
				const authorizationHeader = req.headers.authorization as string;
				const token = authorizationHeader.split(" ")[1];
				jwt.verify(token, process.env.TOKEN_SECRET as string);

				next();
			} catch (error) {
				console.log(error);
				res.status(401).send();
			}
		}
	}
}
