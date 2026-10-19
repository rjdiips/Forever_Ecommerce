// The one reader of the frontend environment. Components ask this module for
// the API base URL instead of touching import.meta.env themselves.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
