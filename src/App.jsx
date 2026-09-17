import { useEffect, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import TopHeader from "./components/TopHeader";
import Stage from "./components/Stage";
import Continuation from "./components/Continuation";
import Awwwards from "./components/Awwwards";
import LeadForm from "./components/WaitingList";

/* The original site's enhancement scripts expect the full DOM to exist and
   enhance it imperatively. All surviving scripts are order-independent
   (hero-intro guards every cross-dependency), so they load in parallel. */
const SCRIPTS = [
  "/assets/hero-intro.js",
  "/assets/site-bootstrap.js",
  "/assets/second-lullaby.js",
  "/assets/red-lullaby.js",
  "/assets/custom-cursor.js",
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(el);
  });
}

export default function App() {
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    Promise.allSettled(
      SCRIPTS.map((src) =>
        loadScript(src).catch((err) => {
          console.error(err);
        }),
      ),
    );
  }, []);

  return (
    <>
      <CustomCursor />
      <TopHeader />
      <Stage />
      <Continuation onRequestAccess={() => setLeadOpen(true)} />
      <Awwwards />
      {leadOpen && <LeadForm onClose={() => setLeadOpen(false)} />}
    </>
  );
}
