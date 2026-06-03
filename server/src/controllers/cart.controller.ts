import { Request, Response } from "express";
import { addToCart, getCartByUserId } from "../services/cart.service";


// add item to cart
export const addItem = (req: Request, res: Response) => {
    const { userId, item } = req.body;

    if (!userId || !item) {
        return res.status(400).json({ message: "userId or item is missing" });
    }
    if (!item.productId || !item.name || item.price == null || item.quantity == null) {

        return res.status(400).json({ message: "item must have productId, name, price, quantity" });

    }

    if (item.price < 0 || item.quantity <= 0) {

        return res.status(400).json({ message: "price must be >= 0 and quantity must be > 0" });

    }

    const cart = addToCart(userId, item);
    console.log("Cart data:", cart);
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