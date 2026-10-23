import { useCallback, useEffect, useRef, useState } from "react";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { assets } from "../assets/assets";

// Must match the exit animation in index.css, so the field unmounts only after
// its closing frame has played.
const EXIT_MS = 140;

// A compact search field for the collection toolbar. It stays out of the way
// until the Navbar's search icon opens it, and reports how many Products the
// current query leaves in the grid.
const SearchBar = ({ resultCount = 0 }) => {
  // Search state belongs to the Catalogue module, not to auth.
  const { search, setSearch, showSearch, setShowSearch } = useCatalogue();

  const [closing, setClosing] = useState(false);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => setShowSearch(false), EXIT_MS);
  }, [setShowSearch]);

  // Opening puts the caret in the field, so the customer can type without
  // clicking. It also restarts the entrance animation.
  useEffect(() => {
    if (!showSearch) return;
    setClosing(false);
    inputRef.current?.focus();
  }, [showSearch]);

  // Escape closes the field. The listener exists only while it is open.
  useEffect(() => {
    if (!showSearch) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch, close]);

  const clearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  if (!showSearch) return null;

  const query = search.trim();

  return (
    <div
      role="search"
      className={`group relative flex h-9 w-full items-center gap-2 sm:w-64 ${
        closing ? "search-field-exit" : "search-field-enter"
      }`}
    >
      <img
        src={assets.search_icon}
        alt=""
        className="h-3.5 w-3.5 shrink-0 opacity-50"
      />

      <input
        ref={inputRef}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
        aria-label="Search products by name"
        autoComplete="off"
        spellCheck="false"
        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />

      {query && (
        <span
          aria-live="polite"
          title={`${resultCount} matching product${
            resultCount === 1 ? "" : "s"
          }`}
          className="shrink-0 text-[10px] uppercase tracking-[0.14em] tabular-nums text-gray-400"
        >
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
      )}

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
        >
          Clear
        </button>
      )}

      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-gray-300" />

      <button
        type="button"
        onClick={close}
        aria-label="Close search"
        className="shrink-0 text-gray-400 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
      >
        <img src={assets.cross_icon} alt="" className="h-2.5 w-2.5 opacity-60" />
      </button>

      {/* The underline is the field's only chrome. It fills in black while the
          field has focus, in keeping with the site's editorial rules. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gray-300"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-gray-800 transition-transform duration-300 ease-out group-focus-within:scale-x-100"
      />
    </div>
  );
};

export default SearchBar;
