import { TOAST_META } from "./toastMeta";

const Icon = ({ type }) => {
  if (type === "error") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3.25v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="12.1" r="0.85" fill="currentColor" />
      </svg>
    );
  }

  if (type === "info" || type === "warning") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 7.1v5.15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="4" r="0.85" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m3.4 8.35 2.95 2.9 6.25-6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ForeverToast = ({ type = "info", title, message, closeToast }) => {
  const meta = TOAST_META[type] ?? TOAST_META.info;
  const dismiss = () => closeToast?.();

  return (
    <article
      className="relative w-full border bg-white shadow-[7px_7px_0_rgba(17,17,17,0.06)]"
      style={{ borderColor: "#111" }}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-2.5">
        <p className="text-[9px] uppercase tracking-[0.28em] text-gray-400">
          Forever / {meta.label}
        </p>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={dismiss}
          className="shrink-0 text-gray-400 transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex gap-4 px-5 pb-5 pt-4">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: meta.accent, color: meta.accent }}
        >
          <Icon type={type} />
        </span>

        <div className="min-w-0">
          <p className="prata-regular text-[21px] leading-[1.15] text-[#111]">
            {title || meta.defaultTitle}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
            {message || meta.fallbackMessage}
          </p>
          <button
            type="button"
            onClick={dismiss}
            style={{ borderColor: "#111" }}
            className="mt-3 border-b pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            Dismiss <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ForeverToast;
