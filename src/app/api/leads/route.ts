import { NextResponse } from "next/server";

const VIA_AEREAS_LEAD_ENDPOINT = process.env.VIAS_AEREAS_LEAD_ENDPOINT;

export async function POST(req: Request) {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!VIA_AEREAS_LEAD_ENDPOINT) {
    return NextResponse.json({ ok: true, forwarded: false }, { status: 202 });
  }

  try {
    const upstream = await fetch(VIA_AEREAS_LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ ok: true, forwarded: false }, { status: 202 });
    }

    return NextResponse.json({ ok: true, forwarded: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true, forwarded: false }, { status: 202 });
  }
}
