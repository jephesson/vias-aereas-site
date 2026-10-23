const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SESSION_TTL_MS = 15 * 60 * 1000;
const PRESENCE_MS = 8_000;
const MAX_SIGNALS = 300;

export type Role = "operator" | "client";

export type SignalType =
  | "offer"
  | "answer"
  | "ice"
  | "screen-started"
  | "screen-stopped"
  | "camera-started"
  | "camera-stopped"
  | "end-session";

export type Signal = {
  i: number;
  from: Role;
  type: SignalType;
  data?: unknown;
  at: number;
};

type Session = {
  token: string;
  operatorSecret: string;
  clientName: string;
  createdAt: number;
  expiresAt: number;
  endedAt?: number;
  lastSeenOperator: number;
  lastSeenClient: number;
  clientId?: string;
  screenSharing: boolean;
  cameraOn: boolean;
  signals: Signal[];
  seq: number;
};

type Store = { sessions: Map<string, Session> };

function store(): Store {
  const root = globalThis as typeof globalThis & { __continuidade?: Store };
  if (!root.__continuidade) root.__continuidade = { sessions: new Map() };
  return root.__continuidade;
}

function randomFrom(length: number, alphabet: string) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function createSession(clientName: string) {
  const now = Date.now();
  const token = randomFrom(12, ALPHABET);
  const session: Session = {
    token,
    operatorSecret: randomFrom(32, ALPHABET),
    clientName: clientName.trim().slice(0, 80) || "Cliente",
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    lastSeenOperator: now,
    lastSeenClient: 0,
    screenSharing: false,
    cameraOn: false,
    signals: [],
    seq: 0,
  };
  const box = store();
  for (const [key, item] of box.sessions) {
    if (item.endedAt || item.expiresAt < now) box.sessions.delete(key);
  }
  box.sessions.set(token, session);
  return session;
}

export type SessionError = "missing" | "ended" | "expired" | "busy" | "forbidden";

function classify(session: Session | undefined, now = Date.now()): SessionError | null {
  if (!session) return "missing";
  if (session.endedAt) return "ended";
  if (session.expiresAt <= now) return "expired";
  return null;
}

export function publicStatus(session: Session, now = Date.now()) {
  const operatorConnected = now - session.lastSeenOperator < PRESENCE_MS;
  const clientConnected = session.lastSeenClient > 0 && now - session.lastSeenClient < PRESENCE_MS;
  return {
    clientName: session.clientName,
    token: session.token,
    expiresAt: session.expiresAt,
    ended: Boolean(session.endedAt),
    expired: session.expiresAt <= now,
    operatorConnected,
    clientConnected,
    screenSharing: session.screenSharing && operatorConnected,
    cameraConnected: session.cameraOn && clientConnected,
  };
}

export function readSession(token: string) {
  return store().sessions.get(token.trim().toUpperCase());
}

export function touchOperator(token: string, secret: string): { session: Session } | { error: SessionError } {
  const session = readSession(token);
  const problem = classify(session);
  if (problem || !session) return { error: problem ?? "missing" };
  if (secret !== session.operatorSecret) return { error: "forbidden" };
  session.lastSeenOperator = Date.now();
  return { session };
}

export function touchClient(token: string, clientId: string): { session: Session } | { error: SessionError } {
  const session = readSession(token);
  const problem = classify(session);
  if (problem || !session) return { error: problem ?? "missing" };
  const now = Date.now();
  const occupied = session.clientId && session.clientId !== clientId && now - session.lastSeenClient < PRESENCE_MS;
  if (occupied) return { error: "busy" };
  session.clientId = clientId;
  session.lastSeenClient = now;
  return { session };
}

export function renewSession(token: string, secret: string): { session: Session } | { error: SessionError } {
  const session = readSession(token);
  if (!session) return { error: "missing" };
  if (session.endedAt) return { error: "ended" };
  if (secret !== session.operatorSecret) return { error: "forbidden" };
  const now = Date.now();
  session.expiresAt = now + SESSION_TTL_MS;
  session.lastSeenOperator = now;
  return { session };
}

export function endSession(token: string, from: Role): { session: Session } | { error: SessionError } {
  const session = readSession(token);
  if (!session) return { error: "missing" };
  if (!session.endedAt) {
    session.endedAt = Date.now();
    session.screenSharing = false;
    session.cameraOn = false;
    pushSignal(session, from, "end-session");
  }
  return { session };
}

export function pushSignal(session: Session, from: Role, type: SignalType, data?: unknown) {
  session.seq += 1;
  if (type === "screen-started") session.screenSharing = true;
  if (type === "screen-stopped") session.screenSharing = false;
  if (type === "camera-started") session.cameraOn = true;
  if (type === "camera-stopped") session.cameraOn = false;
  if (type === "end-session") {
    session.endedAt = session.endedAt ?? Date.now();
    session.screenSharing = false;
    session.cameraOn = false;
  }
  session.signals.push({ i: session.seq, from, type, data, at: Date.now() });
  if (session.signals.length > MAX_SIGNALS) {
    session.signals.splice(0, session.signals.length - MAX_SIGNALS);
  }
}

export function signalsAfter(session: Session, after: number, role: Role) {
  return session.signals.filter((item) => item.i > after && item.from !== role);
}
