import { Router } from "express";

import {
  createCoupon,
  analytics
} from "../controllers/admin.controller";

const router = Router();

router.post("/generate-coupon", createCoupon);

router.get("/stats", analytics);

export default router;