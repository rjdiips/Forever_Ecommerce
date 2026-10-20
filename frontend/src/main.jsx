import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { CatalogueProvider } from "./catalogue/CatalogueContext.jsx";
import ScrollToTop from "./Components/ScrollToTop.jsx";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CatalogueProvider>
        <ScrollToTop />
        <App />
        {/* Analytics is proxied through /va so ad blockers don't match the
            _vercel/insights URL. Production only: dev has no rewrite. */}
        {import.meta.env.PROD && <Analytics scriptSrc="/va/script.js" />}
      </CatalogueProvider>
    </AuthProvider>
  </BrowserRouter>
);
