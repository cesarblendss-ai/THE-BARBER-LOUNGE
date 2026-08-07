import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BarberLoungeSite from "./BarberLoungeSite.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BarberLoungeSite />
  </StrictMode>
);
