Decision: In-Memory Store Over a Database
Context: The application needs to persist carts, orders, and coupons across API calls during a session.
Options Considered:

Option A: Use a database (PostgreSQL / MongoDB) for persistent storage
Option B: Use plain in-memory arrays (carts[], orders[], coupons[]) in a shared module

Choice: In-memory store (Option B)
Why: The problem statement explicitly says "in-memory store is fine (no database needed)". Using a database would add setup complexity (connection strings, ORM, migrations) without any benefit for this exercise. The in-memory approach keeps the focus on business logic. The store is isolated in src/data/store.ts, so swapping it for a real database later only requires changing that one file — services and controllers stay untouched.

Decision: TypeScript Over Plain JavaScript
Context: Need to choose a language for the Express backend.
Options Considered:

Option A: Plain JavaScript — faster to set up, no compilation step
Option B: TypeScript — type safety, interfaces, better IDE support

Choice: TypeScript (Option B)
Why: The codebase has well-defined data shapes (Cart, Order, Coupon, CartItem) that benefit directly from TypeScript interfaces. Type errors are caught at compile time instead of at runtime — for example, passing a string where a number is expected in price calculations would silently corrupt order totals in JS. The upfront cost (tsconfig, ts-jest) is small compared to the safety gained across the entire codebase.

Decision: Coupon Code Generated Automatically at Checkout vs. Admin-Only
Context: The problem statement says "every nth order gets a coupon code." There are two ways to trigger this: automatically during checkout, or only when an admin manually calls the generate API.
Options Considered:

Option A: Auto-generate at checkout — every time an order is placed, check if it is the nth order and generate a coupon automatically
Option B: Admin-triggered only — the coupon is only created when the admin explicitly calls POST /admin/generate-coupon

Choice: Both (Option A as the primary trigger, Option B as a manual override)
Why: Auto-generation at checkout ensures no nth order is ever missed — it does not rely on an admin remembering to call the API. The admin endpoint still exists as specified, and it runs the same condition check, so it is safe to call at any time without creating duplicate coupons out of turn. This satisfies both the "reward system works automatically" intent and the "admin API to generate a coupon" requirement.

Decision: Single-Use Coupons
Context: Need to decide whether a generated coupon can be applied to multiple orders or just one.
Options Considered:

Option A: Multi-use — a coupon code can be applied by any number of customers any number of times
Option B: Single-use — once a coupon is applied at checkout, it is marked isUsed: true and rejected on any future use

Choice: Single-use (Option B)
Why: The problem describes a reward system where a coupon is earned by a specific nth order event. Allowing unlimited reuse would break the intent — one coupon code could be shared publicly and used by everyone. Marking isUsed: true immediately after a successful checkout ensures the code can only be redeemed once. The trade-off is that if a checkout fails after marking the coupon used, the coupon is lost — but this is an acceptable risk for an in-memory demo without transaction support.

Decision: Layered Architecture — Controllers / Services / Routes
Context: Need to organize the codebase in a way that separates HTTP handling from business logic.
Options Considered:

Option A: Fat controllers — put all logic (validation, calculation, store access) directly inside Express route handlers
Option B: Layered architecture — routes define endpoints, controllers handle HTTP request/response, services contain all business logic and store access

Choice: Layered architecture (Option B)
Why: Keeping business logic in services (cart.service.ts, checkout.service.ts, admin.service.ts) means it can be unit tested directly without spinning up an HTTP server. Tests call checkout(userId, couponCode) directly — no need for HTTP mocking. Controllers stay thin (parse request, call service, return response) which makes them easy to read and change. This separation also means the discount logic is in one place — if the nth-order rule changes, only admin.service.ts needs to be updated.

Decision: Discount Percentage and nth Order Configured via Constants
Context: The discount system requires two magic numbers — which order triggers a coupon (every nth) and what percentage discount to give.
Options Considered:

Option A: Hard-code the values inline wherever they are used (orders.length % 3, percentage: 10)
Option B: Centralise in a config file (src/config/constants.ts) and import where needed

Choice: Config file (Option B)
Why: Hard-coding 3 and 10 in multiple places means a business requirement change (e.g. "make it every 5th order with 15% off") requires finding and updating every occurrence — easy to miss one and create inconsistency. With DISCOUNT_CONFIG in one file, changing the values once propagates everywhere. It also makes the intent clear — a reader can immediately see these are intentional configuration values, not arbitrary numbers.