// Product reviews for the product page.
//
// These are DEMO DATA. There is no review backend: the names, dates and text
// below were written for this portfolio build and do not come from customers.
// See `.scratch/product-descriptions/spec.md` ("Reviews tab") before changing
// anything here.
//
// The pool is deliberately garment-agnostic — fit, sizing, delivery, quality,
// returns — because the same text is shown against a puffer jacket and a
// floral dress. Do not add a line about sleeves, fabric or colour.
//
// `REVIEW_RATING` and `REVIEW_COUNT` are the decorative summary shown beside
// the product title and in the tab label. They intentionally do not match the
// three reviews listed; that is a settled decision, not a bug.

/** The fabricated review pool. Three of these are shown per product. */
export const REVIEW_POOL = [
  {
    id: "r1",
    name: "Aisha R.",
    rating: 5,
    date: "3 October 2026",
    text: "Ordered my usual size and it fits exactly as expected. Arrived three days earlier than the estimate.",
  },
  {
    id: "r2",
    name: "Daniel M.",
    rating: 4,
    date: "28 September 2026",
    text: "Good quality for the price and it looks like the photos. I sized up for a looser fit and I'm glad I did.",
  },
  {
    id: "r3",
    name: "Priya S.",
    rating: 5,
    date: "19 September 2026",
    text: "Second order from here and the stitching has held up through several washes. No shrinking so far.",
  },
  {
    id: "r4",
    name: "Tom H.",
    rating: 3,
    date: "11 September 2026",
    text: "Fits well, but the delivery took longer than the estimate. Support answered when I chased it.",
  },
  {
    id: "r5",
    name: "Grace O.",
    rating: 4,
    date: "2 September 2026",
    text: "Better made than I expected at this price. Would order again.",
  },
  {
    id: "r6",
    name: "Marcus L.",
    rating: 5,
    date: "24 August 2026",
    text: "Ordered two sizes to compare and returned the one that didn't fit. The return was straightforward and the refund took four days.",
  },
  {
    id: "r7",
    name: "Elena K.",
    rating: 4,
    date: "15 August 2026",
    text: "True to the size chart. The finish on the seams is tidy, which I didn't expect at this price point.",
  },
  {
    id: "r8",
    name: "Sam T.",
    rating: 5,
    date: "6 August 2026",
    text: "Came well packed and exactly as pictured. Ordered a second one in another size for my brother.",
  },
  {
    id: "r9",
    name: "Nadia B.",
    rating: 4,
    date: "21 July 2026",
    text: "Arrived a day later than the estimate, but the fit was right when it came.",
  },
  {
    id: "r10",
    name: "Chris W.",
    rating: 3,
    date: "9 July 2026",
    text: "Decent for everyday wear. The sizing runs slightly small, so check the chart before ordering.",
  },
];

/** The decorative star rating shown beside the product title. */
export const REVIEW_RATING = 4;

/**
 * The decorative number of reviews shown beside the stars and in the tab
 * label. Fixed on purpose: every product claims the same total.
 */
export const REVIEW_COUNT = 122;

/** How many reviews a product page lists. */
const REVIEWS_SHOWN = 3;

/** A small, stable string hash so each product always gets the same reviews. */
function hash(text) {
  let value = 0;
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(value);
}

/**
 * A deterministic shuffle of the pool. Seeding it with the product's hash
 * spreads products across the pool's 120 possible triples instead of giving
 * every page one of ten rotations.
 */
function shuffled(seed) {
  const order = REVIEW_POOL.map((_, index) => index);
  let state = seed >>> 0;

  for (let index = order.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }

  return order;
}

/**
 * The three reviews shown for a product. Deterministic: the same product id
 * always returns the same three, and different ids generally return different
 * sets, so two product pages do not look identical.
 */
export function reviewsFor(productId) {
  if (!productId || REVIEW_POOL.length === 0) return [];

  return shuffled(hash(String(productId)))
    .slice(0, REVIEWS_SHOWN)
    .map((index) => REVIEW_POOL[index]);
}
