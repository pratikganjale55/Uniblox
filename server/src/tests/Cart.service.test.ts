import { addToCart, getCartByUserId } from "../services/cart.service";
import { carts } from "../data/store";

beforeEach(() => {
    carts.length = 0;
});

describe("addToCart", () => {

    it("creates a new cart when user has no cart yet", () => {
        const item = { productId: "p1", name: "Shoes", price: 500, quantity: 1 };

        const cart = addToCart("user1", item);

        expect(cart.userId).toBe("user1");
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0]).toEqual(item);
    });

    it("adds a new item to an existing cart", () => {
        const item1 = { productId: "p1", name: "Shoes", price: 500, quantity: 1 };
        const item2 = { productId: "p2", name: "Bag", price: 300, quantity: 2 };

        addToCart("user1", item1);
        const cart = addToCart("user1", item2);

        expect(cart.items).toHaveLength(2);
    });

    it("merges quantity when same productId is added again", () => {
        const item = { productId: "p1", name: "Shoes", price: 500, quantity: 1 };

        addToCart("user1", item);
        const cart = addToCart("user1", { ...item, quantity: 3 });

        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].quantity).toBe(4);
    });

    it("keeps separate carts for different users", () => {
        addToCart("user1", { productId: "p1", name: "Shoes", price: 500, quantity: 1 });
        addToCart("user2", { productId: "p2", name: "Bag", price: 300, quantity: 1 });

        expect(carts).toHaveLength(2);
        expect(carts[0].userId).toBe("user1");
        expect(carts[1].userId).toBe("user2");
    });
});

describe("getCartByUserId", () => {

    it("returns the cart for an existing user", () => {
        addToCart("user1", { productId: "p1", name: "Shoes", price: 500, quantity: 1 });

        const cart = getCartByUserId("user1");

        expect(cart).toBeDefined();
        expect(cart?.userId).toBe("user1");
    });

    it("returns undefined for a user with no cart", () => {
        const cart = getCartByUserId("ghost_user");

        expect(cart).toBeUndefined();
    });
});