import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminAuthContext = createContext(null);

const ADMIN_SESSION_EXPIRED_MESSAGE =
  "Admin session expired, please log in again";
// Reusing the id stops a burst of 401s from stacking identical toasts.
const ADMIN_SESSION_EXPIRED_TOAST_ID = "admin-session-expired";

// The admin's auth holder: the token that identifies a logged-in admin. Pages
// read it with `useAdminAuth` instead of receiving it as a prop, and it is
// persisted so a reload stays signed in.
export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  // One response interceptor for the whole admin app. A 401 means the admin
  // Session token was rejected (most often because it expired), so clear it and
  // say why: the conditional render in App then shows the login screen. The
  // API distinguishes expiry from a malformed token, so keep its wording when
  // present. Bad credentials are a 400 and deliberately do not clear or toast.
  //
  // The effect returns an eject so a remount (including StrictMode's double
  // invoke in development) cannot leave a second interceptor behind.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setToken("");
          toast.error(
            error.response?.data?.message || ADMIN_SESSION_EXPIRED_MESSAGE,
            { toastId: ADMIN_SESSION_EXPIRED_TOAST_ID }
          );
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [setToken]);

  const value = useMemo(() => ({ token, setToken }), [token]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const auth = useContext(AdminAuthContext);
  if (!auth) {
    throw new Error("useAdminAuth must be used inside an AdminAuthProvider");
  }
  return auth;
};
