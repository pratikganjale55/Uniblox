# E-Commerce Store API

A backend REST API for an e-commerce store with cart management, checkout, and a discount/coupon reward system. Built with Node.js, TypeScript, and Express. Uses an in-memory store — no database required.

---

## Features

- Add items to a user's cart
- Checkout with optional coupon code for a discount
- Automatic coupon generation every nth order
- Admin APIs for coupon management and store analytics
- Unit tested core business logic

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express v5 |
| Testing | Jest + ts-jest |
| ID Generation | uuid v9 |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── constants.ts        # Discount config (nthOrder, percentage)
│   ├── controllers/
│   │   ├── cart.controller.ts
│   │   ├── checkout.controller.ts
│   │   └── admin.controller.ts
│   ├── data/
│   │   └── store.ts            # In-memory store (carts, orders, coupons)
│   ├── models/
│   │   └── types.ts            # TypeScript interfaces
│   ├── routes/
│   │   ├── cart.routes.ts
│   │   ├── checkout.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── cart.service.ts
│   │   ├── checkout.service.ts
│   │   └── admin.service.ts
│   ├── tests/
│   │   ├── cart.service.test.ts
│   │   ├── checkout.service.test.ts
│   │   └── admin.service.test.ts
│   └── app.ts
├── server.ts                   # Entry point
├── package.json
├── tsconfig.json
├── DECISIONS.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Server starts at `http://localhost:5000`


### Run tests

```bash
npm test
```

---

## Discount System

- Every **3rd order** automatically generates a coupon code (configurable in `src/config/constants.ts`)
- The coupon gives **10% off** the order total
- Coupon codes follow the pattern `DISCOUNT{orderNumber}` — e.g. `DISCOUNT3`, `DISCOUNT6`
- Each coupon is **single-use** — once applied it cannot be reused
- The admin can also manually trigger coupon generation via the API

To change the nth order or discount percentage, edit `src/config/constants.ts`:

```typescript
export const DISCOUNT_CONFIG = {
  nthOrder: 3,      // generate a coupon every 3rd order
  percentage: 10    // 10% discount
};
```

---

## API Reference

### Cart

#### Add item to cart
```
POST /cart/add
```

**Request body:**
```json
{
  "userId": "user1",
  "item": {
    "productId": "p1",
    "name": "Shoes",
    "price": 500,
    "quantity": 2
  }
}
```

**Response `200`:**
```json
{
  "success": true,
  "cart": {
    "userId": "user1",
    "items": [
      { "productId": "p1", "name": "Shoes", "price": 500, "quantity": 2 }
    ]
  }
}
```

---

#### Get cart
```
GET /cart/:userId
```

**Response `200`:**
```json
{
  "success": true,
  "cart": {
    "userId": "user1",
    "items": [
      { "productId": "p1", "name": "Shoes", "price": 500, "quantity": 2 }
    ]
  }
}
```

---

### Checkout

#### Place an order
```
POST /checkout
```

**Request body:**
```json
{
  "userId": "user1",
  "couponCode": "DISCOUNT3"
}
```
> `couponCode` is optional. Omit it for a checkout without a discount.

**Response `200`:**
```json
{
  "success": true,
  "order": {
    "orderId": "f47ac10b-...",
    "userId": "user1",
    "items": [...],
    "totalAmount": 1000,
    "discountAmount": 100,
    "finalAmount": 900
  }
}
```

**Error responses:**

| Status | Message |
|--------|---------|
| `400` | `Cart not found` |
| `400` | `Cart is empty` |
| `400` | `Invalid coupon` |

---

### Admin

#### Generate a coupon (if condition is met)
```
POST /admin/generate-coupon
```

Checks whether the current order count satisfies the nth-order condition and generates a coupon if so. Safe to call anytime — returns `null` if the condition is not met.

**Response `200` — coupon generated:**
```json
{
  "success": true,
  "coupon": {
    "code": "DISCOUNT3",
    "percentage": 10,
    "isUsed": false
  }
}
```

**Response `200` — condition not met:**
```json
{
  "success": false,
  "message": "Coupon generation condition not met"
}
```

---

#### Get store statistics
```
GET /admin/stats
```

**Response `200`:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 6,
    "revenue": 5400,
    "discountCodes": [
            {
                "code": "DISCOUNT3",
                "percentage": 10,
                "isUsed": true
            },
            {
                "code": "DISCOUNT6",
                "percentage": 10,
                "isUsed": false
            }
    ],
    "totalDiscount": 200,
    "totalCoupons": 2,
    "itemCount": 14
  }
}
```

| Field | Description |
|-------|-------------|
| `totalOrders` | Number of completed orders |
| `revenue` | Sum of all `finalAmount` values (after discounts) |
| `discountCodes` | Total coupons codes active and inactive |
| `totalDiscount` | Total discount amount given across all orders |
| `totalCoupons` | Number of coupon codes generated |
| `itemCount` | Total quantity of items purchased |

---

## Running Tests

Tests are in `src/tests/` and cover all core business logic services directly — no HTTP layer involved.

```bash
npm test
```

Expected output:
```
PASS  src/tests/cart.service.test.ts
PASS  src/tests/checkout.service.test.ts
PASS  src/tests/admin.service.test.ts

Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
```

### Test coverage by file

| File | What's tested |
|------|--------------|
| `cart.service.test.ts` | New cart creation, item merging, multi-user carts |
| `checkout.service.test.ts` | Error cases, discount math, coupon marking, nth-order trigger |
| `admin.service.test.ts` | Coupon generation conditions, stats aggregation |