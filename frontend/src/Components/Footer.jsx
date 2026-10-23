import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const FOOTER_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Delivery", to: "/contact" },
  { label: "Privacy policy", to: "/contact" },
];

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-16 border-t border-gray-200 pb-6 pt-10 sm:mt-24 sm:pt-12">
      <div className="grid gap-10 sm:grid-cols-[minmax(0,2.4fr)_1fr_1fr] sm:gap-12">
        <div>
          <img src={assets.logo} alt="Forever" className="w-32" />
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Shop with Forever and experience the convenience of online shopping
            like never before.
          </p>
        </div>

        <div>
          <p className="editorial-display-strong text-[11px] tracking-[0.12em] text-[#b8838e]">
            Company
          </p>
          <ul className="mt-5 flex flex-col gap-2.5 text-[13px] font-medium text-gray-700">
            {FOOTER_LINKS.map((link) => (
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
        </div>

        <div>
          <p className="editorial-display-strong text-[11px] tracking-[0.12em] text-[#b8838e]">
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

      <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-gray-500">
          © {new Date().getFullYear()} Forever — All rights reserved
        </p>
        <button
          type="button"
          onClick={scrollToTop}
          className="group inline-flex w-fit items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-gray-600 transition-colors hover:text-[#111]"
        >
          Back to top
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
          >
            ↑
          </span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
