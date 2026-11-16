const VARIANTS = {
  solid: "bg-[#111] text-white hover:bg-gray-800",
  outline: "border border-[#111] text-[#111] hover:bg-[#111] hover:text-white",
};

// The site's action button: square, condensed caps, wide tracking. It defaults
// to type="button" so it can sit inside a form without submitting it; a submit
// button says so.
const Button = ({
  variant = "solid",
  type = "button",
  className = "",
  children,
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.26em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
