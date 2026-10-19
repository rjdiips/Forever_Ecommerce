import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AdminAuthContext = createContext(null);

// The admin's auth holder: the token that identifies a logged-in admin. Pages
// read it with `useAdminAuth` instead of receiving it as a prop, and it is
// persisted so a reload stays signed in.
export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

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
