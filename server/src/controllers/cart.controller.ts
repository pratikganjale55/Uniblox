import { Request, Response } from "express";
import { addToCart, getCartByUserId } from "../services/cart.service";


// add item to cart
export const addItem = (req: Request, res: Response) => {
    const { userId, item } = req.body;

    if (!userId || !item) {
        return res.status(400).json({ message: "userId or item is missing" });
    }

    const cart = addToCart(userId, item);

    res.json({
        success: true,
        cart
    });
}

// fetch cart for a user
export const fetchCart = (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "userId is missing" });
    }

    const cart = getCartByUserId(userId as string);
    res.json({
        success: true,
        cart
    });

}