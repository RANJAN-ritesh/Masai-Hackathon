import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContextProvider.jsx";
import { ThemeContextProvider } from "./context/ThemeContextProvider.jsx";
import ScrollToTop from "./ScrollToTop.js";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* Disable StrictMode in production to prevent WebSocket connection storms */}
    {process.env.NODE_ENV === 'development' ? (
      <StrictMode>
        <AuthContextProvider>
          <ThemeContextProvider>
            <ScrollToTop />
            <App />
          </ThemeContextProvider>
        </AuthContextProvider>
      </StrictMode>
    ) : (
      <AuthContextProvider>
        <ThemeContextProvider>
          <ScrollToTop />
          <App />
        </ThemeContextProvider>
      </AuthContextProvider>
    )}
  </BrowserRouter>
);
