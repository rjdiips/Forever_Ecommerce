import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

// The admin's auth holder: the token that identifies a logged-in admin. Pages
// read it with `useAdminAuth` instead of receiving it as a prop, and it is
// persisted so a reload stays signed in.
export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  // One response interceptor for the whole admin app. A 401 means the admin
  // Session token was rejected (most often because it expired), so clearing it
  // is enough: the conditional render in App shows the login screen. Bad
  // credentials are a 400 and deliberately do not clear anything.
  //
  // The effect returns an eject so a remount (including StrictMode's double
  // invoke in development) cannot leave a second interceptor behind.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setToken("");
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
