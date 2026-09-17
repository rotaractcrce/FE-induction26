import { Hono } from "hono";
import { html } from "hono/html";
import { basicAuth } from "hono/basic-auth";

type Env = {
  Bindings: {
    DB: D1Database;
    ASSETS: Fetcher;
    ADMIN_USER: string;
    ADMIN_PASSWORD: string;
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
// env vars aren't available at module init, so build the middleware per-request
admin.use(async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_USER,
    password: c.env.ADMIN_PASSWORD,
  });
  return auth(c, next);
});

admin.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, mobile, created_at FROM leads ORDER BY id DESC"
  ).all();

  const rows = (results as Lead[]) ?? [];

  const esc = (s: unknown) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        `&#${ch.charCodeAt(0)};`
    );

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

app.route("/admin", admin);

export default app;
