import { Hono } from "hono";
import { html } from "hono/html";
import { setCookie, getCookie } from "hono/cookie";

type Env = {
  Bindings: {
    DB: D1Database;
    ASSETS: Fetcher;
    ADMIN_PIN: string;
    ADMIN_SESSION_SECRET: string;
  };
};

const app = new Hono<Env>();

/* ---------------- validation helpers ---------------- */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[A-Za-z\s.'-]+$/;

type Lead = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  created_at: string;
};

function cleanMobile(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

function cleanText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().replace(/\s+/g, " ");
  return v.length > 0 && v.length <= max ? v : null;
}

/* ---------------- lead collection API ---------------- */

app.post("/api/leads", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254);
  const mobile = cleanMobile(body.mobile);

  const errors: Record<string, string> = {};
  if (!name || !NAME_RE.test(name) || /\d/.test(name)) {
    errors.name = "Numbers not allowed in name. Please enter a valid name.";
  }
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!mobile) {
    errors.mobile = "Please enter a valid 10-digit mobile number.";
  }

  if (Object.keys(errors).length > 0)
    return c.json({ ok: false, errors }, 400);

  await c.env.DB.prepare(
    "INSERT INTO leads (name, email, mobile) VALUES (?1, ?2, ?3)"
  )
    .bind(name, email!.toLowerCase(), mobile)
    .run();

  return c.json({ ok: true }, 201);
});

/* ---------------- admin dashboard ---------------- */

const admin = new Hono<Env>();

// Session cookie: HMAC-SHA256 keyed by a server-only secret, so the token
// can't be forged offline even though the scheme is public. PIN rotation or
// secret rotation invalidates all existing sessions.
async function tokenFor(c: { env: { ADMIN_SESSION_SECRET: string } }): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("admin-session-v1|" + c.env.ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("ok"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isAuthed(c: any): Promise<boolean> {
  return (getCookie(c, "admin_session") ?? "") === (await tokenFor(c));
}

admin.get("/", async (c) => {
  if (!(await isAuthed(c))) {
    return c.html(html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>Admin PIN | Rotaract CRCE</title>
          <link rel="stylesheet" href="/assets/fonts.css" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <style>
            :root { color-scheme: light; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              padding: 20px 16px;
              background: #dddbd6;
              color: #111;
              font: 15px/1.5 "Space Grotesk", sans-serif;
            }
            .card-gate {
              width: 100%;
              max-width: 380px;
              background: #faf8f5;
              border-radius: 24px;
              padding: 40px 28px;
              text-align: center;
              box-shadow: 0 16px 40px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
              border: 1px solid rgba(0,0,0,.06);
            }
            .rc-gear {
              width: 58px;
              height: 58px;
              margin: 0 auto 16px;
              background-color: #ff1b00;
              -webkit-mask: url(/assets/rc-logo-mark.png) no-repeat center / contain;
              mask: url(/assets/rc-logo-mark.png) no-repeat center / contain;
            }
            .badge {
              display: inline-block;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #ff1b00;
              background: rgba(255,27,0,.09);
              padding: 4px 10px;
              border-radius: 999px;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin: 0 0 6px;
              color: #111;
            }
            p.hint {
              color: #666;
              font-size: 13px;
              margin: 0 0 26px;
            }
            .pin-inputs {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin: 0 0 14px;
            }
            .pin-box {
              width: 54px;
              height: 64px;
              border-radius: 14px;
              border: 2px solid rgba(0,0,0,.14);
              background: #fff;
              color: #111;
              font-family: inherit;
              font-size: 26px;
              font-weight: 700;
              text-align: center;
              transition: border-color .15s, box-shadow .15s, transform .15s;
              -webkit-appearance: none;
            }
            .pin-box:focus {
              outline: none;
              border-color: #ff1b00;
              box-shadow: 0 0 0 4px rgba(255,27,0,.15);
              transform: translateY(-2px);
            }
            .pin-box.filled {
              border-color: rgba(0,0,0,.35);
              background: #fff;
            }
            .pin-inputs.shake {
              animation: pinShake 0.45s ease-in-out;
            }
            @keyframes pinShake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-8px); }
              40%, 80% { transform: translateX(8px); }
            }
            .pin-msg {
              min-height: 22px;
              font-size: 13px;
              font-weight: 600;
              color: #ff1b00;
              margin-bottom: 16px;
            }
            .btn-submit {
              width: 100%;
              height: 48px;
              font: inherit;
              font-weight: 600;
              font-size: 15px;
              border: 0;
              border-radius: 999px;
              background: #ff1b00;
              color: #fff;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: background .15s, transform .1s, opacity .15s;
            }
            .btn-submit:hover:not(:disabled) {
              background: #e61800;
              transform: translateY(-1px);
            }
            .btn-submit:active:not(:disabled) {
              transform: translateY(0);
            }
            .btn-submit:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
            .btn-spinner {
              display: none;
              width: 16px;
              height: 16px;
              border: 2px solid rgba(255,255,255,.4);
              border-top-color: #fff;
              border-radius: 50%;
              animation: spin .6s linear infinite;
            }
            .btn-submit.loading .btn-spinner { display: inline-block; }
            .btn-submit.loading .btn-text { opacity: 0.8; }
            @keyframes spin { to { transform: rotate(360deg); } }
            @media (max-width: 380px) {
              .card-gate { padding: 32px 18px; }
              .pin-inputs { gap: 8px; }
              .pin-box { width: 46px; height: 56px; font-size: 22px; border-radius: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="card-gate">
            <div class="rc-gear" aria-hidden="true"></div>
            <span class="badge">Rotaract CRCE</span>
            <h1>Admin PIN</h1>
            <p class="hint">Enter 4-digit code to access waiting list</p>
            <form id="pin-form" method="post" action="/admin">
              <div class="pin-inputs" id="pin-inputs">
                <input class="pin-box" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="one-time-code" autofocus required />
                <input class="pin-box" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" required />
                <input class="pin-box" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" required />
                <input class="pin-box" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" required />
              </div>
              <input type="hidden" id="pin" name="pin" />
              <div class="pin-msg" id="pin-msg"></div>
              <button type="submit" id="submit-btn" class="btn-submit">
                <span class="btn-text">Unlock Dashboard</span>
                <span class="btn-spinner" aria-hidden="true"></span>
              </button>
            </form>
          </div>
          <script>
            (function() {
              const boxes = Array.from(document.querySelectorAll('.pin-box'));
              const hidden = document.getElementById('pin');
              const form = document.getElementById('pin-form');
              const pinGroup = document.getElementById('pin-inputs');
              const pinMsg = document.getElementById('pin-msg');
              const submitBtn = document.getElementById('submit-btn');

              function updateHidden() {
                hidden.value = boxes.map(b => b.value).join('');
              }

              boxes.forEach((box, i) => {
                box.addEventListener('input', (e) => {
                  const val = e.target.value.replace(/\\D/g, '');
                  box.value = val ? val.slice(-1) : '';
                  if (box.value) {
                    box.classList.add('filled');
                    if (i < boxes.length - 1) {
                      boxes[i + 1].focus();
                    }
                  } else {
                    box.classList.remove('filled');
                  }
                  updateHidden();
                  pinMsg.textContent = '';
                  if (hidden.value.length === 4) {
                    submitPin();
                  }
                });

                box.addEventListener('keydown', (e) => {
                  if (e.key === 'Backspace') {
                    if (!box.value && i > 0) {
                      boxes[i - 1].focus();
                      boxes[i - 1].value = '';
                      boxes[i - 1].classList.remove('filled');
                      updateHidden();
                    } else {
                      box.value = '';
                      box.classList.remove('filled');
                      updateHidden();
                    }
                  } else if (e.key === 'ArrowLeft' && i > 0) {
                    boxes[i - 1].focus();
                  } else if (e.key === 'ArrowRight' && i < boxes.length - 1) {
                    boxes[i + 1].focus();
                  }
                });

                box.addEventListener('paste', (e) => {
                  e.preventDefault();
                  const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                  const digits = paste.replace(/\\D/g, '').slice(0, 4);
                  if (!digits) return;
                  for (let j = 0; j < 4; j++) {
                    boxes[j].value = digits[j] || '';
                    if (boxes[j].value) boxes[j].classList.add('filled');
                    else boxes[j].classList.remove('filled');
                  }
                  updateHidden();
                  if (digits.length === 4) {
                    boxes[3].focus();
                    submitPin();
                  } else if (digits.length > 0) {
                    boxes[Math.min(digits.length, 3)].focus();
                  }
                });
              });

              async function submitPin() {
                updateHidden();
                if (hidden.value.length !== 4) {
                  pinMsg.textContent = 'Please enter all 4 digits';
                  return;
                }
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                pinMsg.textContent = '';
                try {
                  const res = await fetch('/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ pin: hidden.value })
                  });
                  if (res.ok || res.redirected) {
                    window.location.href = '/admin';
                    return;
                  }
                  const errText = await res.text();
                  pinGroup.classList.add('shake');
                  pinMsg.textContent = errText || 'Incorrect PIN';
                  setTimeout(() => {
                    pinGroup.classList.remove('shake');
                    boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
                    updateHidden();
                    boxes[0].focus();
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                  }, 450);
                } catch (err) {
                  pinMsg.textContent = 'Connection error. Try again.';
                  submitBtn.disabled = false;
                  submitBtn.classList.remove('loading');
                }
              }

              form.addEventListener('submit', (e) => {
                e.preventDefault();
                submitPin();
              });
            })();
          </script>
        </body>
      </html>`);
  }

  // capped read: dashboard shows the latest 1000
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, mobile, created_at FROM leads ORDER BY id DESC LIMIT 1000"
  ).all();

  const rows = (results as Lead[]) ?? [];

  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

  const tableRows =
    rows.length === 0
      ? html`<div id="empty-state" class="empty-state">No leads yet.</div>`
      : rows.map(
          (r) => html`
            <div id="lead-row-${r.id}" class="lead-row">
              <div class="col-id"><span class="id-badge">#${r.id}</span></div>
              <div class="col-name"><strong class="name-text">${esc(r.name)}</strong></div>
              <div class="col-email">
                <a class="info-link" href="mailto:${esc(r.email)}" title="${esc(r.email)}">
                  <svg class="cell-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span class="truncate">${esc(r.email)}</span>
                </a>
              </div>
              <div class="col-mobile">
                <a class="info-link" href="tel:${esc(r.mobile)}" title="${esc(r.mobile)}">
                  <svg class="cell-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span class="truncate">${esc(r.mobile)}</span>
                </a>
              </div>
              <div class="col-date">
                <svg class="cell-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${esc(r.created_at)}</span>
              </div>
              <div class="col-action">
                <button type="button" class="btn-del" onclick="deleteLead(${r.id}, '${esc(r.name)}', this)" aria-label="Delete ${esc(r.name)}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          `
        );

  return c.html(html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Waiting List | Rotaract CRCE Admin</title>
        <link rel="stylesheet" href="/assets/fonts.css" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <style>
          :root { color-scheme: light; }
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }
          body {
            min-height: 100vh;
            background: #dddbd6;
            color: #111;
            font: 15px/1.5 "Space Grotesk", sans-serif;
            -webkit-text-size-adjust: 100%;
          }
          .wrap {
            max-width: 960px;
            width: 100%;
            margin: 0 auto;
            padding: 32px 20px 48px;
            box-sizing: border-box;
          }
          header.bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 20px;
            width: 100%;
            box-sizing: border-box;
          }
          .bar__brand {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }
          .rc-gear {
            width: 38px;
            height: 38px;
            background-color: #ff1b00;
            flex: none;
            -webkit-mask: url(/assets/rc-logo-mark.png) no-repeat center / contain;
            mask: url(/assets/rc-logo-mark.png) no-repeat center / contain;
          }
          .brand-text {
            min-width: 0;
          }
          .brand-text h1 {
            font-size: 21px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.2;
            white-space: nowrap;
          }
          .brand-text p.count {
            color: #666;
            font-size: 13px;
            margin: 2px 0 0;
            white-space: nowrap;
          }
          .bar__actions {
            flex: none;
          }
          .btn {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 999px;
            cursor: pointer;
            border: 1.5px solid rgba(0,0,0,.15);
            background: #faf8f5;
            color: #333;
            transition: all .15s ease;
            white-space: nowrap;
          }
          .btn:hover {
            color: #ff1b00;
            border-color: #ff1b00;
            background: #fff;
          }
          .toolbar {
            margin-bottom: 16px;
            width: 100%;
            box-sizing: border-box;
          }
          .search-input {
            width: 100%;
            font: inherit;
            font-size: 14px;
            padding: 12px 18px;
            border-radius: 999px;
            border: 1.5px solid rgba(0,0,0,.14);
            background: #fff;
            color: #111;
            box-shadow: 0 2px 8px rgba(0,0,0,.03);
            transition: border-color .15s, box-shadow .15s;
            box-sizing: border-box;
          }
          .search-input:focus {
            outline: none;
            border-color: #ff1b00;
            box-shadow: 0 0 0 4px rgba(255,27,0,.12);
          }
          .card {
            width: 100%;
            max-width: 100%;
            background: #fff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,.07);
            border: 1px solid rgba(0,0,0,.05);
            box-sizing: border-box;
          }
          .leads-head {
            display: grid;
            grid-template-columns: 50px minmax(130px, 1.3fr) minmax(180px, 1.6fr) minmax(120px, 1.1fr) 140px 85px;
            gap: 12px;
            padding: 12px 16px;
            background: #faf8f5;
            border-bottom: 1px solid #eee;
            color: #888;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: .06em;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
          }
          .leads-body {
            width: 100%;
            box-sizing: border-box;
          }
          .lead-row {
            display: grid;
            grid-template-columns: 50px minmax(130px, 1.3fr) minmax(180px, 1.6fr) minmax(120px, 1.1fr) 140px 85px;
            gap: 12px;
            padding: 12px 16px;
            align-items: center;
            border-bottom: 1px solid #eee;
            background: #fff;
            transition: background .12s, opacity .2s, transform .2s;
            width: 100%;
            box-sizing: border-box;
          }
          .lead-row:last-child {
            border-bottom: 0;
          }
          .lead-row:hover {
            background: #faf9f7;
          }
          .col-id, .col-name, .col-email, .col-mobile, .col-date, .col-action {
            min-width: 0;
            box-sizing: border-box;
          }
          .col-id {
            color: #888;
            font-size: 13px;
            font-variant-numeric: tabular-nums;
          }
          .id-badge {
            font-weight: 600;
            font-size: 12px;
          }
          .name-text {
            color: #111;
            font-weight: 600;
            font-size: 14.5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }
          .info-link {
            color: inherit;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            max-width: 100%;
            min-width: 0;
            transition: color .12s;
          }
          .info-link:hover {
            color: #ff1b00;
            text-decoration: underline;
          }
          .truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
          }
          .cell-icon {
            flex: none;
            color: #888;
          }
          .col-date {
            color: #777;
            font-size: 13px;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .col-action {
            text-align: right;
          }
          .btn-del {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,27,0,.2);
            background: rgba(255,27,0,.04);
            color: #d61800;
            cursor: pointer;
            transition: all .15s ease;
          }
          .btn-del:hover {
            background: #ff1b00;
            color: #fff;
            border-color: #ff1b00;
            transform: scale(1.02);
          }
          .btn-del:active { transform: scale(0.98); }
          .btn-del:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }
          .empty-state {
            color: #777;
            text-align: center;
            padding: 48px 16px;
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
          }

          /* Mobile layout: clean stacked card per lead, strictly vertical scroll only */
          @media (max-width: 768px) {
            .wrap {
              padding: 16px 12px 36px;
            }
            .card {
              border-radius: 16px;
            }
            .leads-head {
              display: none;
            }
            .lead-row {
              display: grid;
              grid-template-columns: auto 1fr auto;
              grid-template-areas:
                "id name action"
                "email email email"
                "mobile mobile mobile"
                "date date date";
              gap: 8px 10px;
              padding: 14px 14px;
              border-bottom: 1px solid #eee;
              width: 100%;
              box-sizing: border-box;
            }
            .col-id {
              grid-area: id;
              width: auto;
            }
            .id-badge {
              font-size: 11px;
              font-weight: 700;
              color: #666;
              background: rgba(0,0,0,.06);
              padding: 2px 7px;
              border-radius: 6px;
            }
            .col-name {
              grid-area: name;
              min-width: 0;
            }
            .name-text {
              font-size: 15.5px;
            }
            .col-action {
              grid-area: action;
              width: auto;
              text-align: right;
            }
            .col-email {
              grid-area: email;
              min-width: 0;
            }
            .col-email .info-link {
              font-size: 13.5px;
              width: 100%;
            }
            .col-email .truncate {
              word-break: break-all;
              white-space: normal;
            }
            .col-mobile {
              grid-area: mobile;
              min-width: 0;
            }
            .col-mobile .info-link {
              font-size: 13.5px;
            }
            .col-date {
              grid-area: date;
              min-width: 0;
              font-size: 12px;
              color: #888;
              margin-top: 2px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header class="bar">
            <div class="bar__brand">
              <div class="rc-gear" aria-hidden="true"></div>
              <div class="brand-text">
                <h1>Waiting list</h1>
                <p class="count" id="lead-count">Rotaract CRCE — <span id="count-num">${rows.length}</span> entr${rows.length === 1 ? "y" : "ies"}</p>
              </div>
            </div>
            <div class="bar__actions">
              <a class="btn" href="/admin/logout" aria-label="Log out of admin">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Log out</span>
              </a>
            </div>
          </header>

          <div class="toolbar">
            <input id="q" class="search-input" type="search" placeholder="Search name, email, mobile…" oninput="filterRows(this.value)" autocomplete="off" />
          </div>

          <div class="card">
            <div class="leads-head" aria-hidden="true">
              <div class="col-id">#</div>
              <div class="col-name">Name</div>
              <div class="col-email">Email</div>
              <div class="col-mobile">Mobile</div>
              <div class="col-date">Submitted</div>
              <div class="col-action">Action</div>
            </div>
            <div class="leads-body" id="leads-body">
              ${tableRows}
            </div>
          </div>
        </div>

        <script>
          function filterRows(q) {
            const query = q.toLowerCase().trim();
            const rows = document.querySelectorAll(".lead-row");
            let visibleCount = 0;
            rows.forEach(function (row) {
              const text = row.innerText.toLowerCase();
              const match = !query || text.includes(query);
              row.style.display = match ? "" : "none";
              if (match) visibleCount++;
            });
            const emptyEl = document.getElementById("search-empty-msg");
            if (visibleCount === 0 && rows.length > 0) {
              if (!emptyEl) {
                const el = document.createElement("div");
                el.id = "search-empty-msg";
                el.className = "empty-state";
                el.textContent = "No matching entries found.";
                document.getElementById("leads-body").appendChild(el);
              }
            } else if (emptyEl) {
              emptyEl.remove();
            }
          }

          async function deleteLead(id, name, btn) {
            if (!confirm("Are you sure you want to delete lead #" + id + " (" + name + ")?")) {
              return;
            }
            btn.disabled = true;
            btn.textContent = "Deleting…";
            try {
              const res = await fetch("/admin/delete/" + id, { method: "POST" });
              const data = await res.json();
              if (data.ok) {
                const row = document.getElementById("lead-row-" + id);
                if (row) {
                  row.style.opacity = "0";
                  row.style.transform = "scale(0.97)";
                  setTimeout(function() {
                    row.remove();
                    updateTotalCount();
                  }, 200);
                }
              } else {
                alert(data.error || "Failed to delete lead.");
                btn.disabled = false;
                btn.textContent = "Delete";
              }
            } catch (err) {
              alert("Network error while deleting.");
              btn.disabled = false;
              btn.textContent = "Delete";
            }
          }

          function updateTotalCount() {
            const remaining = document.querySelectorAll(".lead-row").length;
            const countNum = document.getElementById("count-num");
            if (countNum) countNum.textContent = remaining;
            const countText = document.getElementById("lead-count");
            if (countText) {
              countText.innerHTML = 'Rotaract CRCE — <span id="count-num">' + remaining + '</span> entr' + (remaining === 1 ? "y" : "ies");
            }
            if (remaining === 0) {
              const body = document.getElementById("leads-body");
              body.innerHTML = '<div id="empty-state" class="empty-state">No leads yet.</div>';
            }
          }
        </script>
      </body>
    </html>`);
});

admin.post("/delete/:id", async (c) => {
  if (!(await isAuthed(c))) {
    return c.json({ ok: false, error: "Unauthorized" }, 401);
  }
  const idStr = c.req.param("id");
  const id = Number(idStr);
  if (!idStr || isNaN(id) || id <= 0) {
    return c.json({ ok: false, error: "Invalid ID" }, 400);
  }
  await c.env.DB.prepare("DELETE FROM leads WHERE id = ?1")
    .bind(id)
    .run();
  return c.json({ ok: true });
});

admin.post("/", async (c) => {
  const body = await c.req.parseBody();
  const pin = String((body as Record<string, unknown>).pin ?? "");
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const now = Math.floor(Date.now() / 1000);

  // brute-force throttle: 5 free tries, then linear lockout (30s per fail over, capped 10m)
  const row = await c.env.DB.prepare(
    "SELECT fails, locked_until FROM auth_throttle WHERE ip = ?1"
  )
    .bind(ip)
    .first<{ fails: number; locked_until: number }>();
  if (row && row.locked_until > now) {
    return c.text(
      "Too many attempts. Try again in " + (row.locked_until - now) + "s.",
      429
    );
  }

  if (pin !== c.env.ADMIN_PIN) {
    const fails = (row?.fails ?? 0) + 1;
    const over = fails - 5;
    const lockFor = over <= 0 ? 0 : Math.min(600, 30 * over); // tries 1-5: no lock, then 30s, 60s… capped 10m
    await c.env.DB.prepare(
      `INSERT INTO auth_throttle (ip, fails, locked_until)
       VALUES (?1, ?2, ?3)
       ON CONFLICT (ip) DO UPDATE SET fails = ?2, locked_until = ?3`
    )
      .bind(ip, fails, now + lockFor)
      .run();
    return c.text("Wrong PIN", 401);
  }

  // correct PIN: clear own row + purge stale ones (bounded table, no cron)
  await c.env.DB.prepare("DELETE FROM auth_throttle WHERE ip = ?1")
    .bind(ip)
    .run();
  await c.env.DB.prepare("DELETE FROM auth_throttle WHERE locked_until < ?1")
    .bind(now - 86400)
    .run();

  setCookie(c, "admin_session", await tokenFor(c), {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return c.redirect("/admin");
});

admin.get("/logout", async (c) => {
  setCookie(c, "admin_session", "", { maxAge: 0, path: "/" });
  return c.redirect("/admin");
});

app.route("/admin", admin);

/* ---------------- /1 route handler ---------------- */
app.get("/1", async (c) => {
  return c.env.ASSETS.fetch(new Request(new URL("/", c.req.url), c.req.raw));
});
app.get("/1/*", async (c) => {
  return c.env.ASSETS.fetch(new Request(new URL("/", c.req.url), c.req.raw));
});

export default app;

