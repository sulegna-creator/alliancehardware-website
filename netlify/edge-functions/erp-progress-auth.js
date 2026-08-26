import { createHmac } from "node:crypto";

const COOKIE_NAME = "dawn_progress_session";
const SESSION_MESSAGE = "DAWN_ERP_PROGRESS_SESSION_V1";
const SESSION_MAX_AGE = 60 * 60 * 24;

export default async function handler(request, context) {
  const password = Deno.env.get("DAWN_PORTAL_PASSWORD");

  /*
   * Never fail open.
   */
  if (!password) {
    return new Response(
      "DAWN Progress Portal is not configured.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }

  const url = new URL(request.url);

  /*
   * Logout
   */
  if (
    request.method === "GET" &&
    url.searchParams.get("logout") === "1"
  ) {
    return new Response(
      `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>DAWN Progress Portal</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            background: #f4f7fb;
            color: #172033;
          }

          .box {
            width: min(420px, calc(100% - 32px));
            padding: 32px;
            background: #fff;
            border: 1px solid #e3e8ef;
            border-radius: 20px;
            box-shadow: 0 18px 45px rgba(8, 22, 50, .08);
            text-align: center;
          }

          h1 {
            margin: 0 0 10px;
            color: #081632;
            font-size: 24px;
          }

          p {
            margin: 0 0 20px;
            color: #687386;
            line-height: 1.6;
          }

          a {
            display: inline-block;
            padding: 11px 16px;
            border-radius: 10px;
            background: #1f6feb;
            color: #fff;
            text-decoration: none;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>DAWN Progress Portal</h1>
          <p>Your session has been logged out.</p>
          <a href="/pages/erp-progress.html">
            Return to Portal
          </a>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Set-Cookie":
            `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
        }
      }
    );
  }

  /*
   * Password login
   */
  if (request.method === "POST") {
    const form = await request.formData();
    const submittedPassword =
      String(form.get("password") || "");

    if (!submittedPassword) {
      return loginPage(
        "Please enter the portal password."
      );
    }

    if (submittedPassword !== password) {
      return loginPage(
        "Incorrect password. Please try again.",
        401
      );
    }

    const sessionToken =
      createSessionToken(password);

    return new Response(null, {
      status: 303,
      headers: {
        "Location": "/pages/erp-progress.html",
        "Cache-Control": "no-store",
        "Set-Cookie":
          `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`
      }
    });
  }

  /*
   * Existing session
   */
  const cookies = parseCookies(
    request.headers.get("cookie") || ""
  );

  const sessionToken =
    cookies[COOKIE_NAME];

  const expectedSessionToken =
    createSessionToken(password);

  if (
    sessionToken &&
    timingSafeEqual(
      sessionToken,
      expectedSessionToken
    )
  ) {
    return context.next();
  }

  /*
   * No valid session
   */
  return loginPage();
}


function createSessionToken(password) {
  return createHmac("sha256", password)
    .update(SESSION_MESSAGE)
    .digest("base64url");
}


function parseCookies(header) {
  const result = {};

  for (const part of header.split(";")) {
    const index = part.indexOf("=");

    if (index === -1) {
      continue;
    }

    const name =
      part.slice(0, index).trim();

    const value =
      part.slice(index + 1).trim();

    result[name] = value;
  }

  return result;
}


function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);
  }

  return result === 0;
}


function loginPage(message = "", status = 200) {
  const safeMessage =
    message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return new Response(
    `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      >

      <title>DAWN ERP Progress Portal</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-height: 100vh;

          display: grid;
          place-items: center;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;

          background:
            linear-gradient(
              180deg,
              #eef4fc 0,
              #f4f7fb 100%
            );

          color: #172033;
        }

        .card {
          width:
            min(
              440px,
              calc(100% - 32px)
            );

          padding: 34px;

          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 22px;

          box-shadow:
            0 18px 45px
            rgba(8, 22, 50, 0.09);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 25px;
        }

        .mark {
          width: 44px;
          height: 44px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          background: #081632;
          color: #fff;

          font-size: 13px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .brand-title {
          color: #081632;
          font-weight: 850;
          font-size: 14px;
        }

        .brand-subtitle {
          margin-top: 3px;
          color: #687386;
          font-size: 11px;
        }

        .eyebrow {
          margin-bottom: 10px;

          color: #1f6feb;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: .08em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0 0 10px;

          color: #081632;

          font-size: 29px;
          line-height: 1.1;

          letter-spacing: -.035em;
        }

        .description {
          margin: 0 0 25px;

          color: #687386;

          font-size: 13px;
          line-height: 1.7;
        }

        label {
          display: block;

          margin-bottom: 8px;

          color: #172033;

          font-size: 12px;
          font-weight: 800;
        }

        input {
          width: 100%;

          padding: 13px 14px;

          border:
            1px solid #d8dee8;

          border-radius: 11px;

          background: #fff;

          color: #172033;

          font: inherit;

          outline: none;
        }

        input:focus {
          border-color: #1f6feb;

          box-shadow:
            0 0 0 3px
            rgba(31, 111, 235, .10);
        }

        button {
          width: 100%;

          margin-top: 14px;

          padding: 13px 16px;

          border: 0;

          border-radius: 11px;

          background: #1f6feb;

          color: #fff;

          font-size: 13px;

          font-weight: 850;

          cursor: pointer;
        }

        button:hover {
          background: #1557b0;
        }

        .error {
          margin-bottom: 17px;

          padding: 11px 12px;

          border-radius: 10px;

          background: #fff1f1;

          color: #b42318;

          font-size: 12px;

          line-height: 1.5;
        }

        .footer {
          margin-top: 22px;

          color: #8a93a2;

          font-size: 10px;

          line-height: 1.6;

          text-align: center;
        }
      </style>
    </head>

    <body>

      <main class="card">

        <div class="brand">

          <div class="mark">
            AH
          </div>

          <div>
            <div class="brand-title">
              Alliance Hardware, Inc.
            </div>

            <div class="brand-subtitle">
              DAWN ERP Development Portal
            </div>
          </div>

        </div>

        <div class="eyebrow">
          Private Progress Portal
        </div>

        <h1>
          DAWN ERP Development Progress
        </h1>

        <p class="description">
          This portal provides a read-only view of the
          current DAWN ERP development roadmap.
        </p>

        ${
          safeMessage
            ? `<div class="error">${safeMessage}</div>`
            : ""
        }

        <form
          method="POST"
          action="/pages/erp-progress.html"
        >

          <label for="password">
            Portal Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            autofocus
          >

          <button type="submit">
            Enter Progress Portal
          </button>

        </form>

        <div class="footer">
          DAWN ERP • Alliance Hardware, Inc.
        </div>

      </main>

    </body>
    </html>
    `,
    {
      status,
      headers: {
        "Content-Type":
          "text/html; charset=utf-8",
        "Cache-Control":
          "no-store"
      }
    }
  );
}


export const config = {
  path: "/pages/erp-progress.html"
};