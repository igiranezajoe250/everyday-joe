import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  org: string;
  topic: string;
  message: string;
  email: string;
}

const FIELDS: (keyof ContactPayload)[] = ["name", "org", "topic", "message", "email"];

async function appendToSheet(row: string[]) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!raw || !spreadsheetId) {
    console.log("[contact] Google Sheets not configured, skipping sheet append");
    return;
  }

  const cleaned = raw.replace(/^'|'$/g, "");
  const creds = JSON.parse(cleaned);

  const privateKey = creds.private_key.replace(/\\n/g, "\n");

  const header = { alg: "RS256" as const, typ: "JWT" as const };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const { createSign } = await import("crypto");

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${encode(header)}.${encode(claimSet)}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(privateKey, "base64url");
  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[contact] Google token exchange failed:", tokenRes.status);
    return;
  }
  const { access_token } = await tokenRes.json();

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const sheetRes = await fetch(appendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!sheetRes.ok) {
    console.error("[contact] Sheets append failed:", sheetRes.status, await sheetRes.text());
  }
}

export async function POST(request: Request) {
  try {
    const body: ContactPayload = await request.json();

    for (const field of FIELDS) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const row = [timestamp, body.name, body.org, body.topic, body.message, body.email];

    await appendToSheet(row);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] POST error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
