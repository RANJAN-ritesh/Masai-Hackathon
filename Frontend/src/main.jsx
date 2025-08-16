import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContextProvider.jsx";
import ScrollToTop from "./ScrollToTop.js";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <AuthContextProvider>
        <ScrollToTop />
        <App />
      </AuthContextProvider>
    </StrictMode>
  </BrowserRouter>
);
