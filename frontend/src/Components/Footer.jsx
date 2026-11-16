import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

// Every link here has to land on a page that exists: Delivery and Privacy
// policy used to point at /contact, which is worse than not offering them.
const LINK_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Collection", to: "/collection" },
      { label: "Custom Tee", to: "/tshirt-generator" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your bag", to: "/cart" },
      { label: "Your orders", to: "/orders" },
      { label: "Sign in", to: "/login" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 pb-6 pt-10 sm:mt-24 sm:pt-12">
      <div className="grid gap-10 sm:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] sm:gap-12">
        <div>
          <img src={assets.logo} alt="Forever" className="w-32" />
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Shop with Forever and experience the convenience of online shopping
            like never before.
          </p>
        </div>

        {LINK_COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <p className="editorial-display-strong text-[11px] tracking-[0.12em] text-[#a85580]">
              {column.heading}
            </p>
            <ul className="mt-5 flex flex-col gap-2.5 text-[13px] font-medium text-gray-700">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group/link relative inline-block transition-colors hover:text-[#111]"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#111] transition-[width] duration-300 group-hover/link:w-full"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="editorial-display-strong text-[11px] tracking-[0.12em] text-[#a85580]">
            Get in touch
          </p>
          <ul className="mt-5 flex flex-col gap-2.5 text-[13px] font-medium text-gray-700">
            <li>
              <a
                href="tel:+1234567890"
                className="transition-colors hover:text-[#111]"
              >
                +123 456 7890
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@forevryou.com"
                className="transition-colors hover:text-[#111]"
              >
                contact@forevryou.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-12 border-t border-gray-200 pt-5 text-[9px] font-medium uppercase tracking-[0.24em] text-gray-500">
        © {new Date().getFullYear()} Forever — All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
