import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const ROSE = "#b8838e";

const Hero = () => (
  <section
    className="grid bg-white shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:grid-cols-2"
    style={{ border: "1px solid #111" }}
  >
    <div className="flex min-w-0 items-center justify-center px-6 py-16 sm:py-20">
      <div className="min-w-0 max-w-sm">
        {/* The heading's longest word sets the hero's minimum width, so below
            ~384px it scales with the viewport instead of forcing the page wider
            (or breaking "Arrivals" mid-word). At 390px and up it is 48px. */}
        <h1 className="editorial-display break-words text-[min(3rem,12.5vw)] leading-[0.92] text-[#111] sm:text-6xl lg:text-7xl">
          <span className="block overflow-hidden">
            <span
              className="hero-mask block"
              style={{ animationDelay: "120ms" }}
            >
              Latest
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="hero-mask block"
              style={{ animationDelay: "220ms" }}
            >
              Arrivals
              <span
                aria-hidden="true"
                className="ml-2 inline-block h-2.5 w-2.5 rounded-full align-baseline sm:h-3 sm:w-3"
                style={{ backgroundColor: ROSE }}
              />
            </span>
          </span>
        </h1>

        <p className="mt-4 text-[9px] uppercase tracking-[0.32em] text-[#b8838e]">
          Forever / New season
        </p>

        <Link
          to="/collection"
          className="group/link hero-rise mt-9 inline-flex flex-col items-start gap-3"
          style={{ animationDelay: "380ms" }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.26em]">
            Shop now
          </span>
          <span className="h-px w-12 bg-[#414141] transition-[width] duration-500 group-hover/link:w-20" />
        </Link>
      </div>
    </div>

    <div className="group relative min-h-80 overflow-hidden bg-[#f3e3e1]">
      <img
        src={assets.hero_img}
        alt="Model wearing the latest arrivals"
        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
      />
    </div>
  </section>
);

export default Hero;
