import { requireApiBaseUrl } from "@forever/shared";

// The one reader of the admin environment. Pages import the API base URL from
// here instead of touching VITE_BACKEND_URL themselves. Validating here stops
// the app at startup when the variable is missing.
export const BACKEND_URL = requireApiBaseUrl(import.meta.env.VITE_BACKEND_URL);
