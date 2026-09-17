import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./components/LeadForm.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
