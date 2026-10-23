import { NextResponse } from "next/server";
import { createSession } from "@/lib/continuidadeSession";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let clientName = "";
  try {
    const body = (await request.json()) as { clientName?: string };
    clientName = typeof body.clientName === "string" ? body.clientName : "";
  } catch {
    clientName = "";
  }

  const session = createSession(clientName);
  return NextResponse.json({
    ok: true,
    token: session.token,
    operatorSecret: session.operatorSecret,
    clientName: session.clientName,
    expiresAt: session.expiresAt,
    path: `/continuidade/${session.token}`,
  });
}
