import { useState } from "react";
import { CATEGORIES, SUB_CATEGORIES } from "@forever/shared";

// The collection's refinement rail: category and type filters only. On mobile
// the whole panel collapses behind Refine so the products stay near the top.
const ROSE = "#b8838e";

const FacetRow = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="group flex w-full items-center justify-between border-b border-gray-100 py-2 text-left"
  >
    <span
      className={`text-[13px] transition-colors ${
        active
          ? "font-medium text-[#111]"
          : "text-gray-600 group-hover:text-[#111]"
      }`}
    >
      {label}
    </span>
    <span
      aria-hidden="true"
      className={`h-1.5 w-1.5 rounded-full transition-colors ${
        active
          ? "bg-[#b8838e]"
          : "border border-gray-300 group-hover:border-[#b8838e]"
      }`}
    />
  </button>
);

const FacetGroup = ({ label, values, selected, onToggle }) => (
  <div className="border-b border-gray-200 py-5">
    <div className="flex items-baseline justify-between">
      <p className="text-[9px] uppercase tracking-[0.24em] text-[#b8838e]">
        {label}
      </p>
      <span className="text-[9px] uppercase tracking-[0.18em] text-gray-400 tabular-nums">
        {selected.length === 0 ? "All" : selected.length}
      </span>
    </div>
    <div className="mt-2">
      {values.map((value) => (
        <FacetRow
          key={value}
          active={selected.includes(value)}
          label={value}
          onClick={() => onToggle(value)}
        />
      ))}
    </div>
  </div>
);

const CollectionSidebar = ({
  category,
  subCategory,
  toggleCategory,
  toggleSubCategory,
  clearFilters,
  activeFilterCount,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasFilters = activeFilterCount > 0;

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <h1 className="editorial-display text-4xl leading-[0.92] text-[#111] xl:text-5xl">
        The
        <br />
        Collection
        <span
          aria-hidden="true"
          className="ml-2 inline-block h-2 w-2 rounded-full align-baseline"
          style={{ backgroundColor: ROSE }}
        />
      </h1>

      <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
        An edited wardrobe, piece by piece. Narrow the collection below.
      </p>

      <div className="mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((previous) => !previous)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between border-y border-gray-200 py-3 text-left"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-700">
            Refine{hasFilters ? ` (${activeFilterCount})` : ""}
          </span>
          <span
            aria-hidden="true"
            className={`text-sm text-gray-500 transition-transform duration-300 ${
              filtersOpen ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>
      </div>

      <div
        className={`border-t border-[#111] ${
          filtersOpen ? "mt-4 block" : "hidden"
        } lg:mt-8 lg:block`}
      >
        <FacetGroup
          label="Category"
          values={CATEGORIES}
          selected={category}
          onToggle={toggleCategory}
        />
        <FacetGroup
          label="Type"
          values={SUB_CATEGORIES}
          selected={subCategory}
          onToggle={toggleSubCategory}
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 inline-flex border-b border-[#111] pb-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600 transition-colors hover:text-[#111]"
          >
            Clear all filters ({activeFilterCount})
          </button>
        )}
      </div>
    </aside>
  );
};

export default CollectionSidebar;
