import { useEffect, useRef, useState } from "react";
import "./WaitingList.css";

function SoundWave() {
  return (
    <div className="wl-soundwave" aria-hidden="true">
      <span /><span /><span /><span /><span /><span /><span />
    </div>
  );
}

/* Wishlist signup card. Adapted from the original WaitingList widget:
   two-state card (teaser -> form), header check/close, entry animation —
   restyled to Ouro's cream/red palette and wired to /api/leads. */
export default function WaitingList({ onClose }) {
  const [viewState, setViewState] = useState("default"); // 'default' | 'register' | 'done'
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (viewState === "register") firstInput.current?.focus();
  }, [viewState]);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e) {
    e?.preventDefault();
    if (sending) return;
    setSending(true);
    setErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { name: data.error ?? "Something went wrong." });
      } else {
        setViewState("done");
      }
    } catch {
      setErrors({ name: "Network error — please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="wl-overlay" onClick={onClose} />

      <div
        className={`wl-card ${!mounted ? "wl-entry-hidden" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Join the waiting list"
      >
        {viewState === "done" ? (
          <div className="wl-body">
            <div className="wl-done">
              <svg className="wl-done-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <h3 className="wl-title">You&rsquo;re on the list.</h3>
              <p className="wl-copy">
                We&rsquo;ll reach out to <strong>{values.email}</strong> when early access opens.
              </p>
              <button type="button" className="wl-cta" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : viewState === "default" ? (
          <div className="wl-body">
            <div className="wl-teaser">
              <SoundWave />
              <h3 className="wl-title">Nota</h3>
              <p className="wl-copy">
                An OS-native app for reviewing video footage, logging moments, and finding what matters.
              </p>
              <button type="button" className="wl-cta" onClick={() => setViewState("register")}>
                <span>Join the waiting list</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="wl-body">
            <header className="wl-header">
              <button type="button" className="wl-header-action" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <span className="wl-header-label">Join waiting list</span>
              <button type="button" className="wl-header-action wl-header-action--ok" onClick={submit} aria-label="Submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </header>
            <form className="wl-form" onSubmit={submit}>
              <input
                ref={firstInput}
                className="wl-input"
                placeholder="Type your name..."
                value={values.name}
                onChange={set("name")}
                autoComplete="name"
              />
              {errors.name && <p className="wl-error">{errors.name}</p>}
              <input
                className="wl-input"
                placeholder="Type your email..."
                type="email"
                value={values.email}
                onChange={set("email")}
                autoComplete="email"
              />
              {errors.email && <p className="wl-error">{errors.email}</p>}
              <input
                className="wl-input"
                placeholder="Mobile number..."
                type="tel"
                value={values.mobile}
                onChange={set("mobile")}
                autoComplete="tel"
              />
              {errors.mobile && <p className="wl-error">{errors.mobile}</p>}
              <button type="submit" className="wl-cta" disabled={sending}>
                <span>{sending ? "Sending…" : "Request access"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
