import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "../toast/toast";
import { BACKEND_URL } from "../config";
import { fireConfetti } from "../lib/confetti";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./HomeSectionHeading";

const NewsLetterBox = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/subscribe`, {
        email,
      });
      fireConfetti(formRef.current);
      toast.success(response.data.message, {
        title: "You're on the list.",
      });
      setEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Subscription failed. Please try again.";
      toast.error(errorMessage);
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 text-center">
      <Reveal>
        <SectionLabel>Join the list</SectionLabel>
        <h2 className="editorial-display mt-4 text-3xl text-[#111] sm:text-4xl">
          Subscribe now &amp; get 20% off
        </h2>
        <p className="mt-3 text-sm text-gray-500">
          Be the first to know about new arrivals, sales &amp; promos.
        </p>

        <div className="mx-auto mt-8 w-full max-w-md">
          <form
            ref={formRef}
            onSubmit={onSubmitHandler}
            className="group/form relative flex items-center gap-4 pb-3"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="group/link flex shrink-0 items-center gap-2 border-b border-[#111] pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60 disabled:opacity-50"
            >
              {loading ? "Subscribing…" : "Subscribe"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-300"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gray-900 transition-transform duration-500 group-focus-within/form:scale-x-100"
            />
          </form>
        </div>
      </Reveal>
    </section>
  );
};

export default NewsLetterBox;
