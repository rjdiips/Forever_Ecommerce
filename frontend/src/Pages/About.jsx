import { assets } from "../assets/assets";
import NewsLetterBox from "../Components/NewsLetterBox";
import PageHeading from "../Components/PageHeading";

const PILLARS = [
  {
    title: "Quality assurance",
    text: "We take pride in offering only the highest quality products that meet our stringent standards for durability, performance, and value.",
  },
  {
    title: "Convenience",
    text: "Our user-friendly website and mobile app make it easy to browse, compare, and purchase products on the go.",
  },
  {
    title: "Exceptional customer service",
    text: "Our dedicated team is available around the clock to help with any query or concern you may have.",
  },
];

const About = () => {
  return (
    <div className="border-t pt-10">
      <PageHeading
        label="Forever / Studio"
        title="About Forever"
        note="Studio and mission"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <img
          src={assets.about_img}
          alt="The Forever studio"
          className="aspect-[4/3] w-full bg-gray-100 object-cover"
        />

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#111]">
            Our mission
          </p>

          <div className="mt-5 flex flex-col gap-5 text-sm leading-relaxed text-gray-600">
            <p>
              Forever was born out of a passion for innovation and a desire to
              change the way people shop online. Our journey began with a simple
              idea: a place where customers can easily discover, explore, and
              purchase a considered wardrobe from the comfort of their homes.
            </p>
            <p>
              Since our inception, we&rsquo;ve worked tirelessly to curate a
              selection of clothing that caters to every taste and preference.
              From tailored outerwear to everyday essentials, every piece is
              sourced from trusted makers.
            </p>
            <p>
              Our mission is to empower customers with choice, convenience, and
              confidence. We&rsquo;re dedicated to a seamless shopping
              experience that exceeds expectations, from browsing and ordering
              to delivery and beyond.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-16" aria-label="Why choose Forever">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#111] pb-3">
          <h2 className="editorial-display text-2xl text-[#111]">
            Why choose us
          </h2>
          <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400">
            Forever / Service
          </p>
        </div>

        <div className="grid gap-x-12 gap-y-8 py-8 sm:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <div key={pillar.title} className="border-t border-gray-200 pt-4">
              <p
                aria-hidden="true"
                className="editorial-display text-sm text-[#a85580] tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="editorial-display mt-2 text-[15px] text-[#111]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <NewsLetterBox />
    </div>
  );
};

export default About;
