import { useCatalogue } from "../catalogue/CatalogueContext";
import HomeProductRail, { ViewAllCard } from "./HomeProductRail";
import HomeSectionHeading from "./HomeSectionHeading";
import { ProductGridSkeleton } from "./ProductSkeleton";

const LATEST_LIMIT = 10;

const LatestCollection = () => {
  const { products, loading, error } = useCatalogue();

  // The catalogue is in the admin-set display order, and a newly added Product
  // lands at the end of it, so the rail is the last slice: the newest arrivals,
  // still in the order the admin set. Reordering them in the admin reorders
  // this rail too.
  const latestProducts = products.slice(-LATEST_LIMIT).slice(0, -1);

  return (
    <section className="pb-16 sm:pb-24" aria-busy={loading}>
      <HomeSectionHeading label="Just in" title="Latest Collections">
        Discover our latest edit that blends style and comfort. Explore the
        trends we have picked for this collection, curated just for you.
      </HomeSectionHeading>

      {error ? (
        <p className="mt-10 text-center text-sm text-gray-500">
          Products are unavailable right now.
        </p>
      ) : loading ? (
        <ProductGridSkeleton
          count={LATEST_LIMIT}
          className="mt-10 gap-x-4 gap-y-10"
        />
      ) : products.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">
          Products are unavailable right now.
        </p>
      ) : (
        <HomeProductRail
          products={latestProducts}
          delayStep={50}
          endSlot={<ViewAllCard />}
        />
      )}
    </section>
  );
};

export default LatestCollection;
