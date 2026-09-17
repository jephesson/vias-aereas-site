"use client";

import { useMemo, useState } from "react";

const UNICO_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUnicoHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === "cadastro.unico.app" ||
    host === "id.unico.io" ||
    /(?:^|\.)unico\.(app|io)$/.test(host)
  );
}

function unicoProcessLinkFromId(id: string) {
  return `https://cadastro.unico.app/process/${id}?collect-data=true`;
}

function extractLatamOrderId(raw: string): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  try {
    const url = new URL(s);
    const fromParam = url.searchParams.get("orderId") || url.searchParams.get("orderid");
    if (fromParam && /^LA[A-Z0-9]+$/i.test(fromParam.trim())) {
      return fromParam.trim().toUpperCase();
    }
  } catch {
    // fall through
  }
  const fromQuery = s.match(/orderId=([A-Za-z0-9]+)/i);
  if (fromQuery?.[1] && /^LA[A-Z0-9]+$/i.test(fromQuery[1])) {
    return fromQuery[1].toUpperCase();
  }
  const cleaned = s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (/^LA[A-Z0-9]+$/.test(cleaned)) return cleaned;
  return null;
}

function buildLatamPagamentoLink(orderId: string) {
  return `https://www.latamairlines.com/br/pt/v2/pagamentos/?orderId=${encodeURIComponent(
    orderId
  )}&flow=BOOKING-REDEMPTION`;
}

function normalizeUnicoBiometriaLink(raw: string): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (UNICO_UUID_RE.test(s)) return unicoProcessLinkFromId(s);

  try {
    const url = new URL(s);
    if (!isUnicoHost(url.hostname)) {
      const id = String(url.searchParams.get("id") || "").trim();
      if (UNICO_UUID_RE.test(id)) return unicoProcessLinkFromId(id);
      return null;
    }
    const processMatch = url.pathname.match(
      /^\/process\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i
    );
    if (processMatch?.[1]) return unicoProcessLinkFromId(processMatch[1]);
    const id = String(url.searchParams.get("id") || "").trim();
    if (UNICO_UUID_RE.test(id)) return unicoProcessLinkFromId(id);
  } catch {
    const idMatch = s.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    if (idMatch?.[1] && UNICO_UUID_RE.test(idMatch[1])) {
      return unicoProcessLinkFromId(idMatch[1]);
    }
  }
  return null;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    window.prompt("Copie:", value);
  }
}

function Result({ value, note }: { value: string; note: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="va-stack" style={{ marginTop: 10 }}>
      <div className="va-text" style={{ color: "#047857", fontWeight: 600 }}>
        {note}
      </div>
      <div className="va-box" style={{ wordBreak: "break-all", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
        {value}
      </div>
      <div className="va-row">
        <button
          type="button"
          className="va-cta2"
          onClick={async () => {
            await copyText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
        <a className="va-cta" href={value} target="_blank" rel="noopener noreferrer">
          Abrir
        </a>
      </div>
    </div>
  );
}

export default function ValidacaoPage() {
  const [orderInput, setOrderInput] = useState("");
  const [bioInput, setBioInput] = useState("");

  const orderId = useMemo(() => extractLatamOrderId(orderInput), [orderInput]);
  const pagamentoLink = orderId ? buildLatamPagamentoLink(orderId) : null;
  const bioLink = useMemo(() => normalizeUnicoBiometriaLink(bioInput), [bioInput]);

  return (
    <main className="va-bg">
      <div className="va-shell" style={{ maxWidth: 640 }}>
        <div className="va-card">
          <div className="va-pill">
            <span className="va-dot" />
            Validação LATAM
          </div>
          <h1 className="va-title">Pagamento e biometria</h1>
          <p className="va-text">
            Cole o link da reserva LATAM para gerar a página de pagamento, ou o link da Unico para
            gerar o link da biometria.
          </p>
        </div>

        <div className="va-card" style={{ marginTop: 14 }}>
          <h2 className="va-h2">Pagamento LATAM</h2>
          <p className="va-label">Cole o link da reserva ou o Order ID (LA…).</p>
          <input
            className="va-input"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            placeholder="https://www.latamairlines.com/…?orderId=LA…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {orderInput.trim() && !orderId ? (
            <p className="va-text" style={{ color: "#b91c1c", marginTop: 8 }}>
              Order ID inválido. Precisa começar com LA.
            </p>
          ) : null}
          {orderId && pagamentoLink ? (
            <Result value={pagamentoLink} note={`Order ID ${orderId} → página de pagamento`} />
          ) : null}
        </div>

        <div className="va-card" style={{ marginTop: 14 }}>
          <h2 className="va-h2">Biometria Unico</h2>
          <p className="va-label">Cole o link do intro. Converte para o process que deve ser aberto.</p>
          <input
            className="va-input"
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            placeholder="https://cadastro.unico.app/flow/intro?…&id=…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {bioInput.trim() && !bioLink ? (
            <p className="va-text" style={{ color: "#b91c1c", marginTop: 8 }}>
              Link Unico inválido. Use o intro (com id=) ou o /process/….
            </p>
          ) : null}
          {bioLink ? (
            <Result
              value={bioLink}
              note={
                bioLink !== bioInput.trim()
                  ? "Convertido do intro → process"
                  : "Link de biometria pronto"
              }
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
