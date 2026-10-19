import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

// Auth, the display currency and navigation. Products and search live in the
// Catalogue module in `frontend/src/catalogue/`; the API base URL in config.
export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const backendUrl = BACKEND_URL;
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const value = {
    currency,
    navigate,
    backendUrl,
    token,
    setToken,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
