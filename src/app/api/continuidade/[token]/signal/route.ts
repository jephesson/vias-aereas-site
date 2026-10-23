import { NextResponse } from "next/server";
import { publicStatus, pushSignal, signalsAfter, touchClient, touchOperator, type Role, type SignalType } from "@/lib/continuidadeSession";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

const TYPES = new Set<SignalType>([
  "offer",
  "answer",
  "ice",
  "screen-started",
  "screen-stopped",
  "camera-started",
  "camera-stopped",
  "end-session",
]);

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function statusFor(error: string) {
  if (error === "missing") return 404;
  if (error === "forbidden") return 401;
  if (error === "busy") return 409;
  return 410;
}

async function open(request: Request, token: string) {
  const secret = request.headers.get("x-continuidade-secret") ?? "";
  const clientId = request.headers.get("x-continuidade-client") ?? "";
  const role = request.headers.get("x-continuidade-role");
  if (role === "operator") return touchOperator(token, secret);
  if (role === "client" && clientId) return touchClient(token, clientId);
  return { error: "forbidden" as const };
}

export async function GET(request: Request, context: Context) {
  const { token } = await context.params;
  const result = await open(request, token);
  if ("error" in result) return jsonError(result.error, statusFor(result.error));
  const role = request.headers.get("x-continuidade-role") as Role;
  const after = Number(new URL(request.url).searchParams.get("after") ?? "0");
  const signals = signalsAfter(result.session, Number.isFinite(after) ? after : 0, role);
  return NextResponse.json({
    ok: true,
    cursor: result.session.seq,
    signals,
    status: publicStatus(result.session),
  });
}

export async function POST(request: Request, context: Context) {
  const { token } = await context.params;
  const result = await open(request, token);
  if ("error" in result) return jsonError(result.error, statusFor(result.error));

  let type: SignalType | "" = "";
  let data: unknown;
  try {
    const body = (await request.json()) as { type?: string; data?: unknown };
    if (body.type && TYPES.has(body.type as SignalType)) type = body.type as SignalType;
    data = body.data;
  } catch {
    type = "";
  }
  if (!type) return jsonError("invalid", 400);

  const role = request.headers.get("x-continuidade-role") as Role;
  if (role === "client" && (type === "screen-started" || type === "screen-stopped")) return jsonError("forbidden", 401);
  if (role === "operator" && (type === "camera-started" || type === "camera-stopped")) return jsonError("forbidden", 401);

  pushSignal(result.session, role, type, data);
  return NextResponse.json({ ok: true, cursor: result.session.seq, status: publicStatus(result.session) });
}
