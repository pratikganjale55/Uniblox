export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface Coupon {
  code: string;
  percentage: number;
  isUsed: boolean;
}

export interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
}