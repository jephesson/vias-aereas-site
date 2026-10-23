import { NextResponse } from "next/server";
import { endSession, publicStatus, readSession, renewSession, touchClient, touchOperator } from "@/lib/continuidadeSession";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(_request: Request, context: Context) {
  const { token } = await context.params;
  const session = readSession(token);
  if (!session) return jsonError("missing", 404);
  return NextResponse.json({ ok: true, ...publicStatus(session) });
}

export async function POST(request: Request, context: Context) {
  const { token } = await context.params;
  const secret = request.headers.get("x-continuidade-secret") ?? "";
  let action = "";
  try {
    const body = (await request.json()) as { action?: string };
    action = body.action ?? "";
  } catch {
    action = "";
  }

  if (action === "renew") {
    const result = renewSession(token, secret);
    if ("error" in result) {
      const status = result.error === "forbidden" ? 401 : result.error === "missing" ? 404 : 410;
      return jsonError(result.error, status);
    }
    return NextResponse.json({ ok: true, ...publicStatus(result.session) });
  }

  if (action === "end") {
    const clientId = request.headers.get("x-continuidade-client") ?? "";
    const asClient = clientId ? touchClient(token, clientId) : null;
    const asOperator = secret ? touchOperator(token, secret) : null;
    const actor = asOperator && !("error" in asOperator) ? "operator" : asClient && !("error" in asClient) ? "client" : null;
    if (!actor) return jsonError("forbidden", 401);
    const result = endSession(token, actor);
    if ("error" in result) return jsonError(result.error, 404);
    return NextResponse.json({ ok: true, ...publicStatus(result.session) });
  }

  return jsonError("invalid", 400);
}
