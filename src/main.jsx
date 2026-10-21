import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@fontsource-variable/manrope/index.css";
import "@fontsource-variable/space-grotesk/index.css";
import "lenis/dist/lenis.css";
import "./styles/tokens.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
