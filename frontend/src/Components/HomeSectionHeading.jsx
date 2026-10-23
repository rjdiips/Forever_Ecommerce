import { Reveal } from "./Reveal";

export const SectionLabel = ({ children }) => (
  <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
    {children}
  </p>
);

const HomeSectionHeading = ({ label, title, children }) => (
  <Reveal className="mx-auto max-w-xl text-center">
    <SectionLabel>{label}</SectionLabel>
    <h2 className="editorial-display mt-4 text-3xl text-[#111] sm:text-4xl">
      {title}
    </h2>
    <p className="mt-4 text-sm leading-relaxed text-gray-600">{children}</p>
    <span className="mx-auto mt-7 block h-px w-16 bg-gray-300" />
  </Reveal>
);

export default HomeSectionHeading;
