import { coupons, orders } from "../data/store";
import { DISCOUNT_CONFIG } from "../config/constants";


const nthOrder = DISCOUNT_CONFIG.nthOrder;
const percentage = DISCOUNT_CONFIG.percentage;
export const generateCoupon = () => {


    if (orders.length > 0 &&
        orders.length % nthOrder === 0
    ) {

        const code =
            `DISCOUNT${orders.length}`;

        const coupon = {
            code,
            percentage,
            isUsed: false
        };

        coupons.push(coupon);

        return coupon;
    }

    return null;
};

export const getStats = () => {

    let revenue = 0;

    let totalDiscount = 0;

    let itemCount = 0;

    orders.forEach(order => {

        revenue += order.finalAmount;

        totalDiscount += order.discountAmount;

        order.items.forEach((item: any) => {
            itemCount += item.quantity;
        });
    });

    return {
        totalOrders: orders.length,
        revenue,
        totalDiscount,
        totalCoupons: coupons.length,
        itemCount
    };
};