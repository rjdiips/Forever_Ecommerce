import { assets } from "../assets/assets";
import NewsLetterBox from "../Components/NewsLetterBox";
import PageHeading from "../Components/PageHeading";

const DETAILS = [
  {
    label: "Our store",
    lines: ["7298 King Lodge", "North Elton, Illinois 78154"],
  },
  { label: "Telephone", lines: ["+1 800 123 1234"], href: "tel:+18001231234" },
  {
    label: "Email",
    lines: ["admin@forever.com"],
    href: "mailto:admin@forever.com",
  },
];

// Careers copy for the contact page. Placeholder: swap the roles and the
// application note for the real ones before launch.
const CAREERS = [
  {
    label: "Open roles",
    text: "Nothing open at the moment. Every role we add appears here first, so it is worth checking back.",
  },
  {
    label: "How to apply",
    text: "Write to the address above with a short note about what you make and one piece of work you are proud of. There is no form to fill in.",
  },
  {
    label: "Where we work",
    text: "Our studio in North Elton, Illinois — the same address your order is packed and sent from.",
  },
];

const Contact = () => {
  return (
    <div className="border-t pt-10">
      <PageHeading
        label="Forever / Client care"
        title="Contact us"
        note="Store, phone and email"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <img
          src={assets.contact_img}
          alt="The Forever store"
          className="aspect-[4/3] w-full bg-gray-100 object-cover"
        />

        {/* The store details are one card, the same plate the Cart and the
            product panel use, so the column reads as a block rather than as
            text trailing off beside a taller photograph. */}
        <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:p-6">
          <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-3">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
              Get in touch
            </h2>
            <p className="text-[9px] uppercase tracking-[0.22em] text-[#a85580]">
              Forever / Store
            </p>
          </div>

          <dl className="mt-2 flex flex-col">
            {DETAILS.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-gray-200 py-4 last:border-b-0"
              >
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  {detail.label}
                </dt>
                <dd className="text-right text-sm leading-relaxed text-[#111]">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="border-b border-current pb-0.5 transition-opacity hover:opacity-60"
                    >
                      {detail.lines.join(" ")}
                    </a>
                  ) : (
                    detail.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-16" aria-label="Careers at Forever">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#111] pb-3">
          <h2 className="editorial-display text-2xl text-[#111]">
            Careers at Forever
          </h2>
          <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400">
            Forever / Openings
          </p>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-600">
          Forever is a small studio. The people who sketch a piece, cut the
          pattern and pack the order work in the same room, and most of what we
          sell is finished where it was drawn. We hire slowly, for people who
          care about the details of a garment — a hem, a seam, a size that
          actually fits.
        </p>

        <dl className="mt-8 grid gap-x-12 gap-y-7 border-t border-gray-200 pt-7 sm:grid-cols-3">
          {CAREERS.map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#a85580]">
                {item.label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">
                {item.text}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <NewsLetterBox />
    </div>
  );
};

export default Contact;
