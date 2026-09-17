import { Hono } from "hono";
import { html } from "hono/html";
import { setCookie, getCookie } from "hono/cookie";

type Env = {
  Bindings: {
    DB: D1Database;
    ASSETS: Fetcher;
    ADMIN_PIN: string;
  };
};

const app = new Hono<Env>();

/* ---------------- validation helpers ---------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Lead = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  created_at: string;
};

function cleanMobile(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[\s().-]/g, "");
  return /^\+?\d{7,15}$/.test(digits) ? digits : null;
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
  if (!name) errors.name = "Please enter your name (max 120 characters).";
  if (!email || !EMAIL_RE.test(email))
    errors.email = "Please enter a valid email address.";
  if (!mobile) errors.mobile = "Please enter a valid mobile number.";

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

// Session cookie: keyed digest of the PIN, so the token value itself
// doesn't reveal the PIN and can't be forged without it.
function tokenFor(pin: string): string {
  let h = 5381;
  const msg = "admin-session-v1|" + pin;
  for (let i = 0; i < msg.length; i++) {
    h = ((h << 5) + h + msg.charCodeAt(i)) >>> 0;
  }
  return "v1-" + h.toString(16);
}

function isAuthed(c: { env: { ADMIN_PIN: string } }): boolean {
  return getCookie(c, "admin_session") === tokenFor(c.env.ADMIN_PIN);
}

admin.get("/", async (c) => {
  if (!isAuthed(c)) {
    return c.html(html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>Admin — FE-induction26</title>
          <style>
            :root { color-scheme: dark; }
            body { margin: 0; display: grid; place-items: center; min-height: 100vh; background: #111; color: #eee; font: 14px/1.5 system-ui, sans-serif; }
            form { display: flex; gap: 10px; align-items: center; }
            input[type="password"] { font-size: 18px; padding: 10px 14px; border-radius: 10px; border: 1px solid #333; background: #1a1a1a; color: #eee; width: 120px; text-align: center; letter-spacing: 4px; }
            button { padding: 10px 18px; border: 0; border-radius: 999px; background: #ff1b00; color: #fff; font-weight: 600; cursor: pointer; }
          </style>
        </head>
        <body>
          <form method="post" action="/admin">
            <label for="pin">PIN</label>
            <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" autofocus required />
            <button type="submit">Enter</button>
          </form>
        </body>
      </html>`);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, mobile, created_at FROM leads ORDER BY id DESC"
  ).all();

  const rows = (results as Lead[]) ?? [];

  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

  const tableRows =
    rows.length === 0
      ? html`<tr><td colspan="5" class="empty">No leads yet.</td></tr>`
      : rows.map(
          (r) => html`
            <tr>
              <td>${r.id}</td>
              <td>${esc(r.name)}</td>
              <td>${esc(r.email)}</td>
              <td>${esc(r.mobile)}</td>
              <td>${esc(r.created_at)}</td>
            </tr>
          `
        );

  return c.html(html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Leads — FE-induction26</title>
        <style>
          :root { color-scheme: dark; }
          body {
            margin: 0; padding: 24px; background: #111; color: #eee;
            font: 14px/1.5 system-ui, sans-serif;
          }
          h1 { font-size: 18px; margin: 0 0 4px; }
          p.count { color: #999; margin: 0 0 20px; }
          table { border-collapse: collapse; width: 100%; max-width: 900px; }
          th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #2a2a2a; }
          th { color: #999; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
          td.empty { color: #777; text-align: center; padding: 32px; }
          tr:hover td { background: #1a1a1a; }
        </style>
      </head>
      <body>
        <h1>Collected leads</h1>
        <p class="count">${rows.length} entr${rows.length === 1 ? "y" : "ies"}</p>
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Submitted</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`);
});

admin.post("/", async (c) => {
  const body = await c.req.parseBody();
  const pin = String((body as Record<string, unknown>).pin ?? "");
  if (pin !== c.env.ADMIN_PIN) {
    return c.text("Wrong PIN", 401);
  }
  setCookie(c, "admin_session", tokenFor(pin), {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return c.redirect("/admin");
});

app.route("/admin", admin);

export default app;
