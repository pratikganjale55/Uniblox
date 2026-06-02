
import { carts } from "../data/store";
import { CartItem } from "../models/types";


export const addToCart = (userId: string, item: CartItem) => {
    let cart = carts.find((c) => c.userId === userId);
    if (!cart) {
        cart = {
            userId,
            items: []
        }
        carts.push(cart);
    }

    const existingItem = cart.items.find(
        (i: CartItem) => i.productId === item.productId
    );
    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.items.push(item);
    }

    return cart;
}

export const getCartByUserId =( userId: string) => {
    return carts.find((c) => c.userId === userId) ;
}