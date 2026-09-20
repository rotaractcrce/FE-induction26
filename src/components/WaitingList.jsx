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
   autofocus-first-input, shake on error) - restyled to the site cream/red. */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[A-Za-z\s.'-]+$/;

function validName(v) {
  const t = v.trim();
  // Name must be at least 2 chars, max 120, letters/spaces/symbols only, NO digits
  return t.length >= 2 && t.length <= 120 && NAME_RE.test(t) && !/\d/.test(t);
}

function validEmail(v) {
  const t = v.trim();
  return EMAIL_RE.test(t);
}

function validMobile(v) {
  const digits = v.replace(/\D/g, "");
  return digits.length === 10;
}

function sanitizeMobile(v) {
  // Only digits, maximum 10 digits
  return v.replace(/\D/g, "").slice(0, 10);
}

export default function WaitingList({ onClose }) {
  const [viewState, setViewState] = useState("register"); // 'register' | 'done'
  const [values, setValues] = useState({ name: "", email: "", mobile: "", updates: true });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [closing, setClosing] = useState(false);
  const firstInput = useRef(null);
  const shakeTimer = useRef(null);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  }

  useEffect(() => {
    if (viewState === "register") {
      const t = setTimeout(() => firstInput.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [viewState]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closing]);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "mobile") {
      v = sanitizeMobile(v);
    }
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function shake() {
    clearTimeout(shakeTimer.current);
    setShaking(false);
    setTimeout(() => {
      setShaking(true);
      shakeTimer.current = setTimeout(() => {
        setShaking(false);
      }, 500);
    }, 10);
  }

  async function submit(e) {
    e?.preventDefault();
    if (sending) return;

    const next = {};
    if (!validName(values.name)) {
      next.name = values.name.trim().length === 0
        ? "Enter your name."
        : /\d/.test(values.name)
          ? "Numbers not allowed in name."
          : "Enter a valid name.";
    }
    if (!validEmail(values.email)) {
      next.email = "Enter a valid email.";
    }
    if (!validMobile(values.mobile)) {
      next.mobile = "Enter a 10-digit mobile number.";
    }
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
        setErrors(data.errors ?? { name: data.error ?? "Submission failed." });
        shake();
      } else {
        setViewState("done");
        if (window.RCHaptics) window.RCHaptics.pulse(2);
      }
    } catch {
      setErrors({ name: "Network error — please try again." });
      shake();
    } finally {
      setSending(false);
    }
  }

  const headerTitle =
    viewState === "register"
      ? "Count me in"
      : viewState === "done"
        ? "You're on the list"
        : "";

  const isHeaderVisible = viewState !== "default";

  return (
    <>
      <div
        className={`landing-card-overlay ${viewState !== "default" ? "blur" : ""} ${closing ? "closing" : ""}`}
        onClick={handleClose}
      />

      <div
        className="landing-card-index"
        role="dialog"
        aria-modal="true"
        aria-label="Join the waiting list"
      >
        <div className={`landing-card-container landing-card-container--${viewState} ${closing ? "closing" : ""}`}>
          <header className={`landing-card-header ${isHeaderVisible ? "visible" : ""}`}>
            <button
              type="button"
              className="header-action visible"
              onClick={handleClose}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="header-main">{headerTitle}</div>
            <button
              type="button"
              className={`header-action ${viewState === "register" ? "visible" : ""}`}
              onClick={submit}
              aria-label="Confirm submit"
              disabled={sending}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#00a04a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </header>

          <div
            className={`landing-card ${shaking ? "shake" : ""}`}
            onAnimationEnd={(e) => {
              if (e.animationName === "shake") setShaking(false);
            }}
          >
            {viewState === "register" ? (
              <div className="landing-card-content landing-card-content--register">
                <form onSubmit={submit} noValidate>
                  <input
                    ref={firstInput}
                    className={errors.name ? "input-error" : ""}
                    placeholder="Type your name..."
                    value={values.name}
                    onChange={set("name")}
                    autoComplete="name"
                    enterKeyHint="next"
                  />
                  {errors.name && <p className="wl-error">{errors.name}</p>}

                  <input
                    className={errors.email ? "input-error" : ""}
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
                    className={errors.mobile ? "input-error" : ""}
                    placeholder="Type your mobile number..."
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={values.mobile}
                    onChange={set("mobile")}
                    autoComplete="tel"
                    enterKeyHint="done"
                  />
                  {errors.mobile && <p className="wl-error">{errors.mobile}</p>}

                  <input type="submit" className="hidden" />
                </form>
              </div>
            ) : viewState === "done" ? (
              <div className="landing-card-content landing-card-content--success">
                <svg className="wl-done-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <div className="landing-card-title">You&rsquo;re on the list!</div>
                <div className="info-paragraph">
                  We&rsquo;ll notify <strong>{values.email}</strong> when induction slots open.
                </div>
                <div className="landing-card-actions" style={{ width: "100%" }}>
                  <button type="button" className="button primary" onClick={handleClose}>
                    <div>Done</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="landing-card-content landing-card-content--default">
                <div className="action-left">
                  <SoundWave />
                </div>
                <div className="landing-card-title">Rotaract CRCE</div>
                <div className="landing-card-actions">
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setViewState("register")}
                  >
                    <div>Count me in</div>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ position: "relative", right: "-5px" }}
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
