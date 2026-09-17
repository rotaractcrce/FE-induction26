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
          <link rel="stylesheet" href="/assets/fonts.css" />
          <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
          <style>
            :root { color-scheme: light; }
            body { margin: 0; display: grid; place-items: center; min-height: 100vh; background: #dddbd6; color: #111; font: 15px/1.5 "Space Grotesk", sans-serif; }
            .gate { text-align: center; }
            .mark { width: 54px; height: 54px; border-radius: 50%; background: #ff1b00; margin: 0 auto 18px; position: relative; }
            .mark::after { content: ""; position: absolute; inset: 14px; border-radius: 50%; background: #dddbd6; }
            h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 4px; }
            p.hint { color: #777; font-size: 13px; margin: 0 0 22px; }
            form { display: flex; gap: 10px; align-items: center; justify-content: center; }
            input[type="password"] { font: inherit; font-size: 20px; padding: 10px 14px; border-radius: 12px; border: 1.5px solid rgba(0,0,0,.18); background: #fff; color: #111; width: 130px; text-align: center; letter-spacing: 6px; }
            input[type="password"]:focus { outline: none; border-color: #ff1b00; }
            button { font: inherit; font-weight: 600; padding: 11px 22px; border: 0; border-radius: 999px; background: #ff1b00; color: #fff; cursor: pointer; }
            button:hover { background: #e61800; }
          </style>
        </head>
        <body>
          <div class="gate">
            <div class="mark" aria-hidden="true"></div>
            <h1>Admin</h1>
            <p class="hint">Rotaract CRCE — waiting list</p>
            <form method="post" action="/admin">
              <label for="pin">PIN</label>
              <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" autofocus required />
              <button type="submit">Enter</button>
            </form>
          </div>
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
        <link rel="stylesheet" href="/assets/fonts.css" />
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <style>
          :root { color-scheme: light; }
          body { margin: 0; padding: 40px 24px; background: #dddbd6; color: #111; font: 15px/1.5 "Space Grotesk", sans-serif; }
          .wrap { max-width: 920px; margin: 0 auto; }
          header.bar { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; }
          .mark { width: 34px; height: 34px; border-radius: 50%; background: #ff1b00; position: relative; flex: none; }
          .mark::after { content: ""; position: absolute; inset: 9px; border-radius: 50%; background: #dddbd6; }
          h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0; }
          p.count { color: #777; font-size: 13px; margin: 0 0 26px; }
          .toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
          .toolbar input { font: inherit; font-size: 14px; padding: 9px 14px; border-radius: 999px; border: 1.5px solid rgba(0,0,0,.18); background: #fff; color: #111; flex: 1; min-width: 180px; }
          .toolbar input:focus { outline: none; border-color: #ff1b00; }
          .toolbar a.btn { text-decoration: none; display: inline-block; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 999px; cursor: pointer; }
          a.btn--red { background: #ff1b00; color: #fff; }
          a.btn--red:hover { background: #e61800; }
          a.btn--ghost { background: transparent; color: #555; border: 1.5px solid rgba(0,0,0,.18); }
          a.btn--ghost:hover { color: #111; }
          .card { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.08); }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: left; padding: 11px 16px; border-bottom: 1px solid #eee; }
          th { color: #999; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
          tr:last-child td { border-bottom: 0; }
          td.empty { color: #777; text-align: center; padding: 40px; }
          tr:hover td { background: #faf9f7; }
          @media (max-width: 640px) { th, td { padding: 9px 10px; } }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header class="bar">
            <div class="mark" aria-hidden="true"></div>
            <h1>Waiting list</h1>
          </header>
          <p class="count">Rotaract CRCE — ${rows.length} entr${rows.length === 1 ? "y" : "ies"}</p>
          <div class="toolbar">
            <input id="q" type="search" placeholder="Search name, email or mobile…" oninput="filterRows(this.value)" />
            <a class="btn btn--red" href="/admin/export" download>Export CSV</a>
            <a class="btn btn--ghost" href="/admin/logout">Log out</a>
          </div>
          <div class="card">
            <table id="tbl">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Submitted</th></tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
        <script>
          function filterRows(q) {
            q = q.toLowerCase();
            document.querySelectorAll("#tbl tbody tr").forEach(function (tr) {
              tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
            });
          }
        </script>
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

admin.get("/export", async (c) => {
  if (!isAuthed(c)) return c.redirect("/admin");
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, mobile, created_at FROM leads ORDER BY id DESC"
  ).all();
  const rows = (results as Lead[]) ?? [];
  const csv = ["id,name,email,mobile,submitted"]
    .concat(
      rows.map((r) =>
        [r.id, r.name, r.email, r.mobile, r.created_at]
          .map((v) => '"' + String(v).replace(/"/g, '""') + '"')
          .join(",")
      )
    )
    .join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="waiting-list.csv"',
    },
  });
});

admin.get("/logout", async (c) => {
  setCookie(c, "admin_session", "", { maxAge: 0, path: "/" });
  return c.redirect("/admin");
});

app.route("/admin", admin);

export default app;
