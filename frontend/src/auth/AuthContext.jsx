import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

// The storefront's auth: the token that identifies a logged-in user, read from
// localStorage so a reload stays signed in. Nothing else belongs here — the
// catalogue owns products and search, config owns the API base URL, and pages
// navigate through the router.
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

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
