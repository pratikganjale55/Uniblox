import { Request, Response } from "express";

import { checkout } from "../services/checkout.service";

export const placeOrder = (
  req: Request,
  res: Response
) => {
  try {
    const { userId, couponCode } = req.body;

    const order = checkout(
      userId,
      couponCode
    );

    res.json({
      success: true,
      order
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};