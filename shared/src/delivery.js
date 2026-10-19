/**
 * What the shop charges to deliver an order, in integer cents.
 *
 * This is the one definition: the Cart shows it and the API adds it to every
 * Order, so the two can never drift apart.
 *
 * @type {import("./money.js").Cents}
 */
export const DELIVERY_FEE = 1000;
