import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import CursorInteractionLayer from "./components/motion/CursorInteractionLayer.jsx";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/interactions.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CursorInteractionLayer />
    <App />
  </StrictMode>,
);
