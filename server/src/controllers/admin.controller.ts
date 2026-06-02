import { Request, Response } from "express";

import {
    generateCoupon,
    getStats
} from "../services/admin.service";
import { DISCOUNT_CONFIG } from "../config/constants";

export const createCoupon = (
    req: Request,
    res: Response
) => {

    const coupon = generateCoupon();

    if (!coupon) {
        return res.json({
            "success": false,
            "message": "Coupon not generated",
            "reason": `Coupon is generated only on every ${DISCOUNT_CONFIG.nthOrder}rd order`,
        });
    }

    res.json({
        success: true,
        coupon
    });
};

export const analytics = (
    req: Request,
    res: Response
) => {

    const stats = getStats();

    res.json({
        success: true,
        stats
    });
};