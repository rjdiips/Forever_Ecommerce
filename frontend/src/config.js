import { requireApiBaseUrl } from "@forever/shared";

// The one reader of the frontend environment. Components ask this module for
// the API base URL instead of touching import.meta.env themselves. Validating
// here stops the app at startup when the variable is missing.
export const BACKEND_URL = requireApiBaseUrl(import.meta.env.VITE_BACKEND_URL);
