// The one reader of the admin environment. Pages import the API base URL from
// here instead of touching VITE_BACKEND_URL themselves.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
