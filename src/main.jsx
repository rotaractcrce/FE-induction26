import "ios-vibrator-pro-max";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./components/WaitingList.css";
import { haptic, installHaptics } from "./lib/haptics";

const root = document.getElementById("root");
const cleanupHaptics = installHaptics(root);
window.__ouroHaptic = haptic;

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupHaptics();
    delete window.__ouroHaptic;
  });
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
