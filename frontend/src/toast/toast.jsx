import { toast as toastify } from "react-toastify";
import ForeverToast from "./ForeverToast";
import { TOAST_LIFETIME, TOAST_META } from "./toastMeta";

const show = (type, message, options = {}) => {
  const meta = TOAST_META[type] ?? TOAST_META.info;
  const { title, style, ...toastOptions } = options ?? {};
  const text = typeof message === "string" ? message : "";

  const content = ({ closeToast }) => (
    <ForeverToast
      type={type}
      title={title}
      message={text}
      closeToast={closeToast}
    />
  );

  return toastify[type](content, {
    autoClose: TOAST_LIFETIME,
    icon: false,
    closeButton: false,
    closeOnClick: false,
    draggable: false,
    progressClassName: "forever-toast__progress",
    style: { ...style, "--forever-toast-accent": meta.accent },
    ...toastOptions,
  });
};

/**
 * The storefront's toast facade. It keeps the familiar
 * `toast.success(message, { toastId })` call shape while rendering the Forever
 * editorial card. Pass `title` to give a message its own headline.
 */
export const toast = {
  success: (message, options) => show("success", message, options),
  error: (message, options) => show("error", message, options),
  info: (message, options) => show("info", message, options),
  warning: (message, options) => show("warning", message, options),
};
