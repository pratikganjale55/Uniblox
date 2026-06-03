import { v4 as uuid } from "uuid";

import {
    carts,
    orders,
    coupons
} from "../data/store";
import { generateCoupon } from "./admin.service";

export const checkout = (
    userId: string,
    couponCode?: string
) => {
    const cart = [...carts]
        .reverse()
        .find(c => c.userId === userId);

    if (!cart) {
        throw new Error("Cart not found");
    }
    if (cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    let total = 0;

    cart.items.forEach((item: any) => {
        total += item.price * item.quantity;
    });

    let discount = 0;

    if (couponCode) {
        const coupon = coupons.find(
            c =>
                c.code === couponCode &&
                !c.isUsed
        );

        if (!coupon) {
            throw new Error("Invalid coupon");
        }

        discount = (total * coupon.percentage) / 100;

        coupon.isUsed = true;
    }

    const finalAmount = total - discount;

    const order = {
        orderId: uuid(),
        userId,
        items: cart.items,
        totalAmount: total,
        discountAmount: discount,
        finalAmount
    };

    orders.push(order);
    console.log("Order placed:", order);
    generateCoupon();
    cart.items = [];

    return order;
};