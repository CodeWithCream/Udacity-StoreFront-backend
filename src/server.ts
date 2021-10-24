import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import userRoutes from "./handlers/user";
import orderRoutes from "./handlers/order";
import dashboardRoutes from "./handlers/dashboard";
import productRoutes from "./handlers/product";

const app: express.Application = express();
const port = 3001;
const address = `0.0.0.0:${port}`;

app.use(bodyParser.json());

app.get("/", function (req: Request, res: Response) {
	res.send("Hello World!");
});

userRoutes(app);
productRoutes(app);
orderRoutes(app);
dashboardRoutes(app);

app.listen(port, function () {
	console.log(`starting app on: ${address}`);
});

export default app;
