import express from "express";
import cors from "cors";

import cartRoutes from "./routes/cart.routes";
import checkoutRoutes from "./routes/checkout.routes";
import adminRoutes from "./routes/admin.routes";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/admin", adminRoutes);

export default app;