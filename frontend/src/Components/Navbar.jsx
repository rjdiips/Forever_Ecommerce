import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../auth/AuthContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Collection", to: "/collection" },
  { label: "Custom-Tee", to: "/tshirt-generator" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const { showSearch, setShowSearch } = useCatalogue();
  const { count, clear } = useCart();

  const logout = () => {
    setToken("");
    clear();
    navigate("/login");
  };

  const handleSearchClick = () => {
    if (location.pathname === "/collection") {
      // The icon toggles the field, so search can be dismissed without a
      // dedicated control taking up room in the toolbar.
      setShowSearch(!showSearch);
    } else {
      navigate("/collection", { state: { openSearch: true } });
    }
  };

  // Keep the page still while the mobile menu is open, and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const accountItems = token
    ? [
        { label: "Orders", onClick: () => navigate("/orders") },
        { label: "Logout", onClick: logout },
      ]
    : [
        { label: "Orders", onClick: () => navigate("/orders") },
        { label: "Sign in", onClick: () => navigate("/login") },
      ];

  const accountVisibility =
    "invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto";

  return (
    <header className="relative">
      <div className="flex items-center justify-between py-5 sm:py-6">
        <Link to="/" aria-label="Forever home">
          <img src={assets.logo} alt="Forever" className="w-32 lg:w-36" />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-4 lg:gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  style={{ backgroundColor: "transparent" }}
                  className="group flex flex-col items-center"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`editorial-display-strong text-[11px] tracking-[0.08em] transition-colors duration-300 ${
                          isActive
                            ? "text-[#111]"
                            : "text-gray-600 group-hover:text-[#111]"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-1 h-px bg-[#b8838e] transition-[width] duration-300 ease-out ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="Search"
            className="transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gray-700"
          >
            <img src={assets.search_icon} alt="" className="w-5" />
          </button>

          <div className="group relative">
            <button
              type="button"
              onClick={() => {
                if (!token) navigate("/login");
              }}
              aria-label="Account menu"
              className="transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gray-700"
            >
              <img src={assets.profile_icon} alt="" className="w-5" />
            </button>

            <div
              className={`absolute right-0 top-full z-50 w-52 pt-3 transition-[opacity,visibility] duration-200 ${accountVisibility}`}
            >
              <div
                className="bg-white shadow-[4px_4px_0_rgba(17,17,17,0.06)]"
                style={{ border: "1px solid #111" }}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b8838e]">
                    Forever / Account
                  </p>
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-[#b8838e]"
                  />
                </div>
                <div className="divide-y divide-gray-100">
                  {accountItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-600 transition-colors hover:bg-[#faf7f5] hover:text-[#111] focus-visible:bg-[#faf7f5] focus-visible:text-[#111] focus-visible:outline-none"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/cart"
            aria-label={
              count === 0
                ? "Cart, empty"
                : `Cart, ${count} item${count === 1 ? "" : "s"}`
            }
            className="relative transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gray-700"
          >
            <img src={assets.cart_icon} alt="" className="w-5 min-w-5" />
            {count > 0 && (
              <span className="absolute -bottom-1.5 -right-1.5 grid h-4 min-w-4 place-items-center bg-[#111] px-0.5 text-[8px] leading-none text-white tabular-nums">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gray-700 md:hidden"
          >
            <img src={assets.menu_icon} alt="" className="w-5" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          className="menu-in fixed inset-0 z-[120] overflow-y-auto bg-white md:hidden"
        >
          <div className="flex items-center justify-between px-4 py-5">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              aria-label="Forever home"
            >
              <img src={assets.logo} alt="Forever" className="w-32" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center border border-gray-200 transition-colors hover:border-gray-400"
            >
              <img src={assets.cross_icon} alt="" className="h-2.5 w-2.5" />
            </button>
          </div>

          <div className="border-y border-gray-200 px-4 py-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-[#b8838e]">
              Forever / Menu
            </p>
          </div>

          <nav aria-label="Mobile primary" className="px-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMenuOpen(false)}
                style={{ backgroundColor: "transparent" }}
                className="flex items-center justify-between border-b border-gray-200 py-4"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`editorial-display-strong text-2xl uppercase tracking-[-0.01em] ${
                        isActive ? "text-[#111]" : "text-gray-700"
                      }`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[#b8838e]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 pt-10">
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-[#b8838e]">
              Forever / Contact
            </p>
            <a
              href="tel:+1234567890"
              className="mt-3 block w-fit text-sm font-medium text-gray-700 hover:text-[#111]"
            >
              +123 456 7890
            </a>
            <a
              href="mailto:contact@forevryou.com"
              className="mt-1 block w-fit text-sm font-medium text-gray-700 hover:text-[#111]"
            >
              contact@forevryou.com
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
