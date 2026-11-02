// One line of feedback at the control that caused it (ADR-0008). Toasts are
// kept for failures with no control to point at, so anything the customer can
// read, fix, or verify on this screen renders here instead.
const TONES = {
  error: { role: "alert", color: "#8f4a56" },
  success: { role: "status", color: "#111" },
};

const InlineNotice = ({
  tone = "error",
  action = null,
  id,
  className = "",
  children,
}) => {
  const { role, color } = TONES[tone] ?? TONES.error;

  return (
    <p
      id={id}
      role={role}
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] leading-relaxed ${className}`}
      style={{ color }}
    >
      <span>{children}</span>
      {action}
    </p>
  );
};

export default InlineNotice;
