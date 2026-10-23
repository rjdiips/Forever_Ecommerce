import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatProductPrice } from "@forever/shared";
import { useCatalogue } from "../catalogue/CatalogueContext";
import CollectionSidebar from "../Components/CollectionSidebar";
import ProductSkeleton from "../Components/ProductSkeleton";
import SearchBar from "../Components/SearchBar";

const SORT_OPTIONS = [
  { value: "relevant", label: "Relevant" },
  { value: "low-high", label: "Price: low to high" },
  { value: "high-low", label: "Price: high to low" },
];

const ProductPlate = ({ product }) => (
  <Link to={`/product/${product._id}`} className="group block">
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img
        src={product.image?.[0]}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
      />
    </div>

    <div className="mt-3.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-[0.2em] text-gray-400">
          {product.category} / {product.subCategory}
        </p>
        <p className="mt-1.5 text-[14px] leading-snug text-gray-800">
          {product.name}
        </p>
      </div>
      <p className="shrink-0 text-[13px] font-medium">
        {formatProductPrice(product.price)}
      </p>
    </div>

    <span className="mt-2.5 inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-gray-400 transition-colors group-hover:text-[#111]">
      View piece
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </span>
  </Link>
);

const EmptyState = ({ onClear }) => (
  <div className="mt-12 border-y border-gray-200 py-16 text-center">
    <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
      Forever / Nothing here
    </p>
    <p className="editorial-display mt-3 text-2xl text-[#111]">
      No pieces match those filters.
    </p>
    <button
      type="button"
      onClick={onClear}
      className="mt-6 border-b border-[#111] pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
    >
      Reset view
    </button>
  </div>
);

const Collection = () => {
  const { products, loading, error, search, showSearch, setSearch, setShowSearch } =
    useCatalogue();
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const location = useLocation();

  const toggleCategory = (value) => {
    setCategory((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

  const toggleSubCategory = (value) => {
    setSubCategory((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  const resetView = () => {
    clearFilters();
    setSearch("");
  };

  // The grid is derived, not copied into state by effects, so a filter or sort
  // change paints once and the catalogue's display order stays the default.
  const filteredProducts = useMemo(() => {
    let list = products.slice();
    const query = showSearch ? search.trim().toLowerCase() : "";

    if (query) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }
    if (category.length > 0) {
      list = list.filter((item) => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      list = list.filter((item) => subCategory.includes(item.subCategory));
    }
    if (sortType === "low-high") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, search, showSearch, category, subCategory, sortType]);

  // The Navbar can hand the page an open search field.
  useEffect(() => {
    if (location.state?.openSearch) {
      setShowSearch(true);
    }
  }, [location.state, setShowSearch]);

  const hasFilters = category.length + subCategory.length > 0;

  return (
    <section className="pt-6 sm:pt-10">
      <div className="flex items-center justify-between border-t border-[#111] pt-4">
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
          Forever / Collection
        </p>
        <p className="text-[9px] uppercase tracking-[0.24em] text-gray-500 tabular-nums">
          {loading
            ? "Loading pieces"
            : `${filteredProducts.length} ${
                filteredProducts.length === 1 ? "piece" : "pieces"
              }`}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        <CollectionSidebar
          category={category}
          subCategory={subCategory}
          toggleCategory={toggleCategory}
          toggleSubCategory={toggleSubCategory}
          clearFilters={clearFilters}
          activeFilterCount={category.length + subCategory.length}
        />

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] uppercase tracking-[0.24em] text-gray-500 tabular-nums">
              {loading ? "Loading pieces" : `${filteredProducts.length} on view`}
              {hasFilters && (
                <span className="ml-2 text-[#b8838e]">/ filtered</span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <SearchBar resultCount={filteredProducts.length} />

              <label htmlFor="collection-sort" className="sr-only">
                Sort products
              </label>
              <select
                id="collection-sort"
                value={sortType}
                onChange={(event) => setSortType(event.target.value)}
                className="h-9 border border-gray-300 bg-white px-3 text-[10px] uppercase tracking-[0.14em] text-gray-600 focus:border-[#111] focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-12 border-y border-gray-200 py-16 text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
                Forever / Offline
              </p>
              <p className="editorial-display mt-3 text-2xl text-[#111]">
                The collection is unavailable right now.
              </p>
            </div>
          ) : loading ? (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:gap-x-5">
              {Array.from({ length: 9 }, (_, index) => (
                <ProductSkeleton
                  key={index}
                  imageClassName="aspect-[3/4]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState onClear={resetView} />
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:gap-x-5">
              {filteredProducts.map((product) => (
                <ProductPlate key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Collection;
