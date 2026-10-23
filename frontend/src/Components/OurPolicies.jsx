import { assets } from "../assets/assets";
import { Reveal } from "./Reveal";

const POLICIES = [
  {
    icon: assets.exchange_icon,
    label: "Forever / Exchanges",
    title: "Easy exchanges",
    detail: "Hassle-free exchanges on every order.",
  },
  {
    icon: assets.quality_icon,
    label: "Forever / Returns",
    title: "7-day returns",
    detail: "Seven days to change your mind.",
  },
  {
    icon: assets.support_img,
    label: "Forever / Support",
    title: "Customer support",
    detail: "Real people, available around the clock.",
  },
];

const OurPolicies = () => (
  <section className="border-y border-gray-200 py-12">
    <div className="grid gap-8 sm:grid-cols-3">
      {POLICIES.map((policy, index) => (
        <Reveal
          key={policy.title}
          delay={index * 80}
          className="flex items-start gap-4"
        >
          <img
            src={policy.icon}
            alt=""
            className="mt-1 w-8 shrink-0 opacity-80"
          />
          <div>
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#b8838e]">
              {policy.label}
            </p>
            <p className="editorial-display mt-1 text-[15px] text-[#111]">
              {policy.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">{policy.detail}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default OurPolicies;
