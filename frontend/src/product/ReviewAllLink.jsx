// The reviews index is not built yet, so this is a control rather than a link
// to a route. It borrows the related rail's "View all" treatment: 9px caps and
// a hairline that draws out on hover, so the two sections speak the same way.
const ReviewAllLink = ({ className = "" }) => (
  <button
    type="button"
    className={`group/all flex flex-col items-start gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#111] ${className}`}
  >
    View all
    <span
      aria-hidden="true"
      className="h-px w-8 bg-[#111] transition-[width] duration-500 group-hover/all:w-14"
    />
  </button>
);

export default ReviewAllLink;
