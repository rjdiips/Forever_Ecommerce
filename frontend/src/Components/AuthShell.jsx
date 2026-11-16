// Sign in, sign up and password reset share one frame: the editorial heading on
// the left, the form in the bordered plate on the right. Nothing here is a
// full-page heading, because the plate is what the customer came for.
const AuthShell = ({ label, title, description, children }) => (
  <section className="border-t pt-10 sm:pt-14">
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
          {label}
        </p>
        <h1 className="editorial-display mt-4 text-3xl leading-[1.05] text-[#111] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
          {description}
        </p>
        <span
          aria-hidden="true"
          className="mt-8 hidden h-px w-16 bg-gray-300 lg:block"
        />
      </div>

      <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:p-8">
        {children}
      </div>
    </div>
  </section>
);

export default AuthShell;
