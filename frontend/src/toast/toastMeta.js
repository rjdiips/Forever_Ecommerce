export const TOAST_LIFETIME = 6500;

// Toasts are the shop's voice, not the customer's mistake (ADR-0008): only a
// failure with no control to point at, or a confirmation with nowhere else to
// be seen, reaches this file.
export const TOAST_META = {
  success: {
    label: "Confirmed",
    accent: "#b8838e",
    defaultTitle: "All set.",
    fallbackMessage: "Your changes have been saved.",
  },
  error: {
    label: "System",
    accent: "#8f4a56",
    defaultTitle: "Something went wrong on our side.",
    fallbackMessage: "Please try again in a moment.",
  },
};
