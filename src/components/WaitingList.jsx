import { useEffect, useRef, useState } from "react";
import "./WaitingList.css";

function SoundWave() {
  return (
    <div className="wl-soundwave" aria-hidden="true">
      <span /><span /><span /><span /><span /><span /><span />
    </div>
  );
}

/* Waiting-list bottom sheet. Sizes/motion mirror the original
   desktop.fm landing-card (55px rows, 20px radii, 16px type, header bar,
   autofocus-first-input, shake on error) - restyled to Ouro cream/red. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;

function validName(v) {
  const t = v.trim();
  return t.length >= 2 && t.length <= 120 && NAME_RE.test(t);
}

function validEmail(v) {
  return EMAIL_RE.test(v.trim());
}

function validMobile(v) {
  const digits = v.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function sanitizeMobile(v) {
  return v.replace(/[^\d+\s().-]/g, "");
}

export default function WaitingList({ onClose }) {
  const [viewState, setViewState] = useState("default"); // 'default' | 'register' | 'done'
  const [values, setValues] = useState({ name: "", email: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [shaking, setShaking] = useState(false);
  const firstInput = useRef(null);
  const shakeRaf = useRef(null);

  /* autofocus first input whenever the form view appears (opens keyboard) */
  useEffect(() => {
    if (viewState === "register") {
      const t = requestAnimationFrame(() => firstInput.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [viewState]);

  /* lock background scroll while open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => () => cancelAnimationFrame(shakeRaf.current), []);

  const set = (k) => (e) => {
    const v = k === "mobile" ? sanitizeMobile(e.target.value) : e.target.value;
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function shake() {
    cancelAnimationFrame(shakeRaf.current);
    setShaking(false);
    shakeRaf.current = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShaking(true)),
    );
  }

  async function submit(e) {
    e?.preventDefault();
    if (sending) return;

    const next = {};
    if (!validName(values.name))
      next.name = "Please enter your name (letters only).";
    if (!validEmail(values.email))
      next.email = "Please enter a valid email address.";
    if (!validMobile(values.mobile))
      next.mobile = "Enter a valid mobile number (7–15 digits).";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      shake();
      return;
    }

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
        shake();
      } else {
        setViewState("done");
      }
    } catch {
      setErrors({ name: "Network error — please try again." });
      shake();
    } finally {
      setSending(false);
    }
  }

  const headerLabel =
    viewState === "done"
      ? "You're on the list"
      : viewState === "register"
        ? "Join waiting list"
        : "Join the waiting list";

  return (
    <>
      <div className="wl-overlay" onClick={onClose} />

      <div
        className="wl-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Join the waiting list"
      >
        <div className="wl-card">
          <div className="wl-topbar wl-topbar--on" aria-hidden={viewState === "register" ? undefined : true}>
            <button
              type="button"
              className="wl-topbar-action"
              onClick={viewState === "default" ? () => setViewState("register") : onClose}
              aria-label={viewState === "default" ? "Continue" : "Close"}
            >
              {viewState === "default" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              )}
            </button>
            <span className="wl-topbar-main">{headerLabel}</span>
            {viewState === "register" ? (
              <button
                type="button"
                className="wl-topbar-action wl-topbar-action--primary"
                onClick={submit}
                aria-label="Submit"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            ) : (
              <span className="wl-topbar-spacer" aria-hidden="true" />
            )}
          </div>

          <div
            className={`wl-body${shaking ? " wl-shake" : ""}`}
            onAnimationEnd={(e) => {
              if (e.animationName === "wl-shake") setShaking(false);
            }}
          >
            {viewState === "done" ? (
              <div className="wl-done">
                <svg className="wl-done-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <h3 className="wl-title">You&rsquo;re on the list.</h3>
                <p className="wl-copy">
                  We&rsquo;ll reach out to <strong>{values.email}</strong> when early access opens.
                </p>
                <button type="button" className="wl-btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            ) : viewState === "default" ? (
              <div className="wl-teaser">
                <SoundWave />
                <h3 className="wl-title">Rotaract CRCE</h3>
                <p className="wl-copy">
                  Service, leadership and community — join the waiting list for the upcoming recruitment cycle.
                </p>
                <button type="button" className="wl-btn-primary" onClick={() => setViewState("register")}>
                  <span>Join the waiting list</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            ) : (
              <form className="wl-form" onSubmit={submit} noValidate>
                <input
                  ref={firstInput}
                  className="wl-input"
                  placeholder="Type your name..."
                  value={values.name}
                  onChange={set("name")}
                  autoComplete="name"
                  enterKeyHint="next"
                />
                {errors.name && <p className="wl-error">{errors.name}</p>}
                <input
                  className="wl-input"
                  placeholder="Type your email..."
                  type="email"
                  inputMode="email"
                  value={values.email}
                  onChange={set("email")}
                  autoComplete="email"
                  enterKeyHint="next"
                />
                {errors.email && <p className="wl-error">{errors.email}</p>}
                <input
                  className="wl-input"
                  placeholder="Type your mobile number..."
                  type="tel"
                  inputMode="tel"
                  value={values.mobile}
                  onChange={set("mobile")}
                  autoComplete="tel"
                  enterKeyHint="done"
                />
                {errors.mobile && <p className="wl-error">{errors.mobile}</p>}
                <button type="submit" className="wl-btn-primary" disabled={sending}>
                  <span>{sending ? "Sending…" : "Request access"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
