import { useEffect, useRef, useState } from "react";

// Fades and lifts its children once they enter the viewport. Reduced-motion
// users see everything immediately.
export const Reveal = ({
  delay = 0,
  distance = 18,
  duration = 700,
  className = "",
  children,
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// A rule that grows on hover, used for editorial links.
export const GrowingRule = ({ className = "" }) => (
  <span
    aria-hidden="true"
    className={`h-px w-8 bg-current transition-[width] duration-500 ease-out group-hover/link:w-14 ${className}`}
  />
);
