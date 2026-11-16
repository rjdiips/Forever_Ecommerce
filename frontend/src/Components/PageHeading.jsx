// The one page header on the storefront: a pink eyebrow, an Oswald headline,
// and the black rule that closes it. Every page below the Home hero opens with
// this, so a title sits at the same height no matter where the customer lands.
const PageHeading = ({ label, title, note = null }) => (
  <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-[#111] pb-4">
    <div>
      <p className="text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
        {label}
      </p>
      <h1 className="editorial-display mt-3 text-3xl leading-none text-[#111] sm:text-4xl">
        {title}
      </h1>
    </div>
    {note ? (
      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 tabular-nums">
        {note}
      </p>
    ) : null}
  </header>
);

export default PageHeading;
