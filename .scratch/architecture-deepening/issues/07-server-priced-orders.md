# 07: Server-priced order intake

**Spec:** Candidate 2 — order intake

**What to build:** Placing an order — cash on delivery or Stripe — prices the cart on the server from the product catalogue, ignoring any client-sent amount, and rejects unknown products or sizes. Stripe reports success only after payment is confirmed and the order belongs to the caller.

**Blocked by:** 03, 04, 05, 06

**Status:** resolved

- [x] One order-intake function takes address, items, payment method and origin, and returns an order id plus an optional payment URL
- [x] The server re-prices every line from the catalogue and rejects an unknown product or size
- [x] A client-sent amount or price is ignored; totals use the shared delivery fee
- [x] The cash-on-delivery and Stripe routes are thin transport adapters over that function
- [x] Stripe verification requires a paid status and that the order belongs to the signed-in user
- [x] Authenticated requests expose the user id on the request rather than through the body, so ownership checks and logs are trustworthy
- [x] The dormant Razorpay route and its dependency are removed
- [x] Order pricing and validation are unit tested

## Comments

**2026-10-19 — implemented (candidate 2, order intake).**

**The seam.** `backend/lib/orderPricing.js` is pure: `priceOrder(items, products)` takes the Cart lines and the catalogue Products, and returns `{ items, subtotal, deliveryFee, amount }` in integer cents. It rejects an empty order, an unknown Product, an unknown size, a bad quantity, a Design on a Product that is not the base, a Design that is not an http(s) URL, and the Custom Tee base without a Design. Any client `price`/`amount`/`total` is ignored because the function never reads it.

`backend/lib/orderIntake.js` is the one order-intake function, `createOrder({ userId, address, items, paymentMethod, origin }) → { orderId, sessionUrl? }`. It loads the named Products, prices through `priceOrder`, saves the Order with `pricingVersion: ORDER_PRICING.CENTS`, and clears the Cart on COD. For Stripe it builds the Checkout line items from the same server-side cents, adds the shared `DELIVERY_FEE`, puts the order id in the session `metadata`, and puts `session_id={CHECKOUT_SESSION_ID}` on the success URL. If the session cannot be created the unpaid Order is deleted rather than left as an orphan.

`verifyOrderPayment({ userId, orderId, sessionId, cancelled })` finds the caller's Order first (404 otherwise), requires a Stripe Order, retrieves the session, requires `metadata.orderId` to match, requires `payment_status === "paid"`, then marks the Order paid and clears the Cart. The `success` query flag alone is never trusted.

**Routes.** `placeOrderCOD` and `placeOrderStripe` pass `req.userId` and a constant payment method; the Razorpay route and handler are gone. `verifyStripePayment` maps the redirect flag to `cancelled` at the controller edge. `userAuth` now sets `req.userId`; `orderController` and `cartController` read it instead of `req.body.userId`.

**Money.** Orders store `amount` and item `price` in integer cents. `pricingVersion` distinguishes them from legacy dollar Orders; `shared/src/order.js` exposes `ORDER_PRICING`, `orderAmountCents` and `orderItemPriceCents`, and both the shop Orders page and the admin Orders page render through `formatMoney`. The shop checkout sends intent only and reads `sessionUrl`; Verify posts `sessionId`.

**Removed.** `razorpay` from `backend/package.json` and the lockfile, the `/api/order/razorpay` route and handler, the `razorpay_logo` import/export and the PNG, and Razorpay from the README's payment list.

**Tests.** 12 `priceOrder` units in `backend/lib/orderPricing.test.js` and 3 order-money units in `shared/src/order.test.js`. Full run green: shared 18, frontend 37, backend 36. Lint 0 errors (warnings unchanged), both production builds resolve.

**Deliberate notes:**

- The pure pricing seam is the tested boundary (agreed with the maintainer). The DB/Stripe orchestration in `orderIntake.js` stays thin and untested.
- `success=false` never deletes an Order: the cancel redirect is the shopper's word. A paid Order is reported as successful; an unpaid one is left unpaid for the admin. Only a confirmed paid session marks it paid.
- Stripe errors carry `statusCode`, not `status`; a 4xx from Stripe is translated to a 400 so a bad/expired session id is not reported as a 500.
- A missing `origin` on the Stripe route is a 400; Stripe needs absolute redirect URLs.
- The design URL is validated as http(s) only. Cloudinary is the only uploader today; binding the check to the Cloudinary host would couple the pricing rule to one provider.
- Legacy Orders are read through the shared helper rather than backfilled. A backfill migration can remove `pricingVersion` later.
