import express from "express";
import path from "path";
import { PORT } from "./config";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(paymentRoutes);

app.use(express.static(path.resolve("src/public")));

app.listen(PORT);

console.log(`Server running on port ${PORT}`);
