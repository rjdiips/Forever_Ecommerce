import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "../toast/toast";
import {
  SESSION_EXPIRED_TOAST_ID,
  isLoginPage,
  isRejectedSession,
  sessionRejectionMessage,
} from "./sessionExpiry";

const AuthContext = createContext(null);

// Persisted across reloads so the "session expired" toast is shown at most once
// per expired session. Cleared when the user logs in again.
export const SESSION_EXPIRED_NOTIFIED_KEY = "forever_session_expired_notified";

// The storefront's auth: the token that identifies a logged-in user, read from
// localStorage so a reload stays signed in. Nothing else belongs here — the
// catalogue owns products and search, config owns the API base URL, and pages
// navigate through the router.
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // Auth owns the token's storage in both directions: callers only ever set the
  // token, and a reload or logout follows from it.
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Keep the latest navigate without re-registering the interceptor when the
  // router gives us a new callback.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // One response interceptor for the whole storefront. A 401 means the Session
  // token is no longer accepted, so clear it and return to login with a reason.
  // Bad credentials are a 400 by design and never reach this branch.
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isRejectedSession(error)) {
          const alreadyNotified =
            localStorage.getItem(SESSION_EXPIRED_NOTIFIED_KEY) === "true";

          setToken("");
          // The storage effect also removes it; doing it here stops a reload
          // during the redirect from restoring the rejected token.
          localStorage.removeItem("token");

          // Only toast once per expired session. The flag survives reloads so
          // the user isn't greeted with the same error on every refresh. It is
          // cleared when the user successfully logs in again.
          if (!alreadyNotified) {
            localStorage.setItem(SESSION_EXPIRED_NOTIFIED_KEY, "true");
            toast.error(sessionRejectionMessage(error), {
              title: "Please sign in again.",
              toastId: SESSION_EXPIRED_TOAST_ID,
            });
          }

          // Already on login: this is the destination, so redirecting would
          // only remount the page.
          if (!isLoginPage(window.location.pathname)) {
            navigateRef.current("/login", { replace: true });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  const value = useMemo(() => ({ token, setToken }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return auth;
};
