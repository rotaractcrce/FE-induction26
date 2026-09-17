import { useState } from "react";

export default function LeadForm({ onClose }) {
  const [values, setValues] = useState({ name: "", email: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
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
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setErrors({ name: "Network error — please try again." });
      setStatus("idle");
    }
  }

  const field = (key, props) => (
    <>
      <input
        className="lead-form__input"
        value={values[key]}
        onChange={set(key)}
        disabled={status === "sending"}
        {...props}
      />
      {errors[key] && <p className="lead-form__error">{errors[key]}</p>}
    </>
  );

  return (
    <div className="lead-form" role="dialog" aria-modal="true" aria-label="Request early access">
      <div className="lead-form__backdrop" onClick={onClose} />
      <div className="lead-form__card">
        <button type="button" className="lead-form__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {status === "done" ? (
          <div className="lead-form__done">
            <h3 className="lead-form__title">You&rsquo;re on the list.</h3>
            <p className="lead-form__copy">
              Thanks — we&rsquo;ll reach out to <strong>{values.email}</strong> when early access opens.
            </p>
            <button type="button" className="lead-form__submit" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="lead-form__body" onSubmit={submit}>
            <h3 className="lead-form__title">Request early access</h3>
            <p className="lead-form__copy">Nota — an OS-native app for reviewing video footage.</p>
            {field("name", { placeholder: "Name", type: "text", required: true, autoComplete: "name" })}
            {field("email", { placeholder: "Email", type: "email", required: true, autoComplete: "email" })}
            {field("mobile", { placeholder: "Mobile number", type: "tel", autoComplete: "tel" })}
            <button type="submit" className="lead-form__submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Request access"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
