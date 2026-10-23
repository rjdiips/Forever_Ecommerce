// Mirrors ProductItem's shape so a rail keeps its height while the catalogue
// request and the Cloudinary images are in flight. The image box is square to
// match the product photos; the two text bars stand in for name and price.
const ProductSkeleton = () => (
  <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
    <div className="aspect-square w-full rounded bg-gray-200" />
    <div className="mt-3 h-3.5 w-4/5 rounded bg-gray-200" />
    <div className="mt-2 h-3.5 w-1/3 rounded bg-gray-200" />
  </div>
);

// The rail asks how many cards it will eventually show, so the placeholder
// occupies the same grid and the same height as the real products. The
// className lets the homepage rail mirror its wider vertical rhythm.
export const ProductGridSkeleton = ({ count, className = "" }) => (
  <div
    role="status"
    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 ${className}`}
  >
    {Array.from({ length: count }, (_, index) => (
      <ProductSkeleton key={index} />
    ))}
    <span className="sr-only">Loading products…</span>
  </div>
);

export default ProductSkeleton;
