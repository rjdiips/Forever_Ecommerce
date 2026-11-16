// A labelled form control in the editorial system: the label is the 10px
// functional caps used for spec terms and filter headings, and the input's only
// decoration is its hairline. The label is always visible, so a filled form is
// still readable once the placeholders are gone.
const Field = ({ label, id, hint = null, className = "", ...input }) => (
  <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
    <label
      htmlFor={id}
      className="text-[10px] uppercase tracking-[0.2em] text-gray-500"
    >
      {label}
    </label>
    <input
      id={id}
      {...input}
      className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#111] outline-none transition-colors placeholder:text-gray-400 focus:border-[#111] focus:ring-1 focus:ring-[#111]"
    />
    {hint ? <p className="text-[11px] text-gray-500">{hint}</p> : null}
  </div>
);

export default Field;
