import { Router } from "express";
import {
  addItem,
  fetchCart,
} from "../controllers/cart.controller";

const router = Router();

router.post("/add", addItem);

router.get("/:userId", fetchCart);

export default router;