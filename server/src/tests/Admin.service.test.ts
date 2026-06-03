import { generateCoupon, getStats } from "../services/admin.service";
import { carts, orders, coupons } from "../data/store";

beforeEach(() => {
    carts.length = 0;
    orders.length = 0;
    coupons.length = 0;
});

const seedOrders = (count: number, amount = 100) => {
    for (let i = 0; i < count; i++) {
        orders.push({
            orderId: `order${i + 1}`,
            userId: `user${i + 1}`,
            items: [{ productId: "p1", name: "Item", price: amount, quantity: 1 }],
            totalAmount: amount,
            discountAmount: 0,
            finalAmount: amount
        });
    }
};

describe("generateCoupon", () => {

    it("returns null when there are no orders", () => {
        const result = generateCoupon();
        expect(result).toBeNull();
    });

    it("returns null on non-nth orders (1st, 2nd)", () => {
        seedOrders(1);
        expect(generateCoupon()).toBeNull();

        seedOrders(1); 
        expect(generateCoupon()).toBeNull();
    });

    it("generates a coupon when orders.length is a multiple of nthOrder (3)", () => {
        seedOrders(3);

        const coupon = generateCoupon();

        expect(coupon).not.toBeNull();
        expect(coupon?.code).toBe("DISCOUNT3");
        expect(coupon?.percentage).toBe(10);
        expect(coupon?.isUsed).toBe(false);
    });

    it("adds the generated coupon to the coupons store", () => {
        seedOrders(3);
        generateCoupon();

        expect(coupons).toHaveLength(1);
        expect(coupons[0].code).toBe("DISCOUNT3");
    });

    it("generates again on 6th order", () => {
        seedOrders(6);
        generateCoupon();

        expect(coupons).toHaveLength(1);
        expect(coupons[0].code).toBe("DISCOUNT6");
    });

    it("does not generate a duplicate if called twice at the same order count", () => {
        seedOrders(3);
        generateCoupon();
        generateCoupon(); 

        expect(coupons).toHaveLength(2);
    });
});

describe("getStats", () => {

    it("returns zero stats when no orders exist", () => {
        const stats = getStats();

        expect(stats.totalOrders).toBe(0);
        expect(stats.revenue).toBe(0);
        expect(stats.totalDiscount).toBe(0);
        expect(stats.itemCount).toBe(0);
        expect(stats.totalCoupons).toBe(0);
    });

    it("counts total orders correctly", () => {
        seedOrders(3);

        const stats = getStats();

        expect(stats.totalOrders).toBe(3);
    });

    it("sums revenue from finalAmount (not totalAmount)", () => {
        orders.push({
            orderId: "o1",
            userId: "user1",
            items: [{ productId: "p1", name: "Item", price: 1000, quantity: 1 }],
            totalAmount: 1000,
            discountAmount: 100,
            finalAmount: 900
        });

        const stats = getStats();

        expect(stats.revenue).toBe(900);
    });

    it("sums total discounts given", () => {
        orders.push({
            orderId: "o1", userId: "u1",
            items: [], totalAmount: 1000, discountAmount: 100, finalAmount: 900
        });
        orders.push({
            orderId: "o2", userId: "u2",
            items: [], totalAmount: 500, discountAmount: 50, finalAmount: 450
        });

        const stats = getStats();

        expect(stats.totalDiscount).toBe(150);
    });

    it("counts total items purchased across all orders", () => {
        orders.push({
            orderId: "o1", userId: "u1",
            items: [
                { productId: "p1", name: "A", price: 100, quantity: 2 },
                { productId: "p2", name: "B", price: 200, quantity: 3 }
            ],
            totalAmount: 800, discountAmount: 0, finalAmount: 800
        });

        const stats = getStats();

        expect(stats.itemCount).toBe(5); // 2 + 3
    });

    it("reflects coupon count correctly", () => {
        coupons.push({ code: "DISCOUNT3", percentage: 10, isUsed: true });
        coupons.push({ code: "DISCOUNT6", percentage: 10, isUsed: false });

        const stats = getStats();

        expect(stats.totalCoupons).toBe(2);
    });
});