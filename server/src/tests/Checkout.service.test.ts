import { checkout } from "../services/checkout.service";
import { carts, orders, coupons } from "../data/store";

beforeEach(() => {
    carts.length = 0;
    orders.length = 0;
    coupons.length = 0;
});

const seedCart = (userId: string, price = 1000, quantity = 1) => {
    carts.push({
        userId,
        items: [{ productId: "p1", name: "Shoes", price, quantity }]
    });
};

describe("checkout - error cases", () => {

    it("throws if user has no cart", () => {
        expect(() => checkout("unknown_user")).toThrow("Cart not found");
    });

    it("throws if cart is empty", () => {
        carts.push({ userId: "user1", items: [] });

        expect(() => checkout("user1")).toThrow("Cart is empty");
    });

    it("throws if coupon code does not exist", () => {
        seedCart("user1");

        expect(() => checkout("user1", "FAKECODE")).toThrow("Invalid coupon");
    });

    it("throws if coupon has already been used", () => {
        seedCart("user1");
        coupons.push({ code: "USED10", percentage: 10, isUsed: true });

        expect(() => checkout("user1", "USED10")).toThrow("Invalid coupon");
    });
});

describe("checkout - successful order", () => {

    it("places an order and returns correct totals without coupon", () => {
        seedCart("user1", 500, 2); 

        const order = checkout("user1");

        expect(order.totalAmount).toBe(1000);
        expect(order.discountAmount).toBe(0);
        expect(order.finalAmount).toBe(1000);
        expect(order.userId).toBe("user1");
        expect(order.orderId).toBeDefined();
    });

    it("applies valid coupon and calculates discount correctly", () => {
        seedCart("user1", 1000, 1); 
        coupons.push({ code: "SAVE10", percentage: 10, isUsed: false });

        const order = checkout("user1", "SAVE10");

        expect(order.totalAmount).toBe(1000);
        expect(order.discountAmount).toBe(100);   
        expect(order.finalAmount).toBe(900);
    });

    it("marks coupon as used after checkout", () => {
        seedCart("user1", 1000, 1);
        coupons.push({ code: "SAVE10", percentage: 10, isUsed: false });

        checkout("user1", "SAVE10");

        const coupon = coupons.find(c => c.code === "SAVE10");
        expect(coupon?.isUsed).toBe(true);
    });

    it("clears the cart after successful checkout", () => {
        seedCart("user1");

        checkout("user1");

        const cart = carts.find(c => c.userId === "user1");
        expect(cart?.items).toHaveLength(0);
    });

    it("saves the order to the orders store", () => {
        seedCart("user1");

        checkout("user1");

        expect(orders).toHaveLength(1);
        expect(orders[0].userId).toBe("user1");
    });

    it("saves original items in order even after cart is cleared", () => {
        seedCart("user1", 500, 2);

        const order = checkout("user1");

        expect(order.items).toHaveLength(1);
        expect(order.items[0].quantity).toBe(2);
    });
});

describe("checkout - nth order coupon generation", () => {

    // Place n orders for different users to trigger the coupon
    const placeOrders = (count: number) => {
        for (let i = 0; i < count; i++) {
            const userId = `user${i}`;
            carts.push({
                userId,
                items: [{ productId: "p1", name: "Item", price: 100, quantity: 1 }]
            });
            checkout(userId);
        }
    };

    it("does NOT generate a coupon on non-nth orders", () => {
        placeOrders(1); 
        expect(coupons).toHaveLength(0);

        placeOrders(1);
        expect(coupons).toHaveLength(0);
    });

    it("generates a coupon automatically on every 3rd order", () => {
        placeOrders(3); 

        expect(coupons).toHaveLength(1);
        expect(coupons[0].code).toBe("DISCOUNT3");
        expect(coupons[0].percentage).toBe(10);
        expect(coupons[0].isUsed).toBe(false);
    });

    it("generates a second coupon on the 6th order", () => {
        placeOrders(6);

        expect(coupons).toHaveLength(2);
        expect(coupons[1].code).toBe("DISCOUNT6");
    });

    it("same coupon cannot be used twice", () => {
        placeOrders(3); // generates DISCOUNT3

        // First use — succeeds
        carts.push({
            userId: "buyer",
            items: [{ productId: "p1", name: "Item", price: 100, quantity: 1 }]
        });
        checkout("buyer", "DISCOUNT3");

        // Second use — must fail
        carts.push({
            userId: "buyer2",
            items: [{ productId: "p1", name: "Item", price: 100, quantity: 1 }]
        });
        expect(() => checkout("buyer2", "DISCOUNT3")).toThrow("Invalid coupon");
    });
});