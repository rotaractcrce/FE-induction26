import { useEffect, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import TopHeader from "./components/TopHeader";
import Stage from "./components/Stage";
import Continuation from "./components/Continuation";
import Awwwards from "./components/Awwwards";
import LeadForm from "./components/WaitingList";

/* The original site's enhancement scripts expect the full DOM to exist and
   enhance it imperatively. We render the identical markup in React, then load
   them in the original order after mount. */
const SCRIPTS = [
  "/assets/second-lullaby.js",
  "/assets/hero-intro.js",
  "/assets/ouro-site-bootstrap.js",
  "/assets/vendor/flubber.min.js",
  "/assets/hcard-atlas-morph.js",
  "/assets/hcard-nota-morph.js",
  "/assets/overture-ripple.js",
  "/assets/mobile-top-nav.js",
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
    let cancelled = false;
    (async () => {
      for (const src of SCRIPTS) {
        if (cancelled) return;
        try {
          await loadScript(src);
        } catch (err) {
          console.error(err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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
