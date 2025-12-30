"use client";

import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "5553999760707";
const CNPJ = "63.817.773/0001-85";
const PIX_KEY = CNPJ; // troque se sua chave Pix for outra
const BUSSOLA_LOGO = "/logo-bussola-aerea.png";

type TripType = "ida" | "ida_volta";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoToBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fmtMoneyBR(cents: number) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copiado!");
  } catch {
    alert("Não consegui copiar automaticamente.");
  }
}

// ✅ regra de preço que você descreveu
// - 30 dias ida: R$30,00
// - 30 dias ida+volta: R$49,90
// - a partir de 60 dias, cada bloco extra de 30 dias tem 50% de desconto
function calcPriceCents(tipo: TripType, totalDias: number) {
  const blocks = Math.max(1, Math.ceil(totalDias / 30)); // 30/60/90...
  const base = tipo === "ida_volta" ? 4990 : 3000;

  if (blocks === 1) return base;

  const extraBlocks = blocks - 1;
  const extra = Math.round(base * 0.5) * extraBlocks;
  return base + extra;
}

export default function Page() {
  const minToday = useMemo(() => todayISO(), []);

  const [nome, setNome] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [tipo, setTipo] = useState<TripType>("ida_volta");
  const [dataInicial, setDataInicial] = useState("");
  const [periodoDias, setPeriodoDias] = useState(30);
  const [obs, setObs] = useState("");

  const blocks = useMemo(() => Math.max(1, Math.ceil(periodoDias / 30)), [periodoDias]);
  const priceCents = useMemo(() => calcPriceCents(tipo, periodoDias), [tipo, periodoDias]);
  const priceLabel = useMemo(() => fmtMoneyBR(priceCents), [priceCents]);

  const error = useMemo(() => {
    if (!nome.trim()) return "Informe seu nome.";
    if (!origem.trim() || !destino.trim()) return "Informe origem e destino.";
    if (!dataInicial) return "Escolha a data inicial.";
    if (periodoDias < 30 || periodoDias > 180) return "Escolha entre 30 e 180 dias.";
    if (periodoDias % 30 !== 0) return "O período deve ser múltiplo de 30 dias.";
    return "";
  }, [nome, origem, destino, dataInicial, periodoDias]);

  const canSubmit = !error;

  function buildMessage(forPix = false) {
    const linhas = [
      "🧭 *Bússola Aérea — Pedido de pesquisa*",
      "",
      "📌 *O que é:* pesquisa do menor preço (Pix) por dia no 123milhas + relatório (Excel + PDF).",
      "",
      `👤 *Nome:* ${nome.trim()}`,
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tipo === "ida_volta" ? "Ida e volta (inclui trecho inverso)" : "Só ida"}`,
      `📅 *Data inicial:* ${isoToBR(dataInicial)}`,
      `🗓️ *Período:* ${periodoDias} dias (${blocks} bloco(s) de 30)`,
      "",
      `💰 *Valor:* ${priceLabel}`,
      forPix ? `🔑 *Chave Pix:* ${PIX_KEY}` : null,
      obs.trim() ? "" : null,
      obs.trim() ? `📝 *Obs:* ${obs.trim()}` : null,
      "",
      "✅ Se estiver ok, vou rodar a pesquisa e retorno com o relatório.",
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function openWhats(msg: string) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <main className="va-bg">
      <div className="va-shell">
        <header className="va-header">
          <div className="va-brand">
            <img
              src={BUSSOLA_LOGO}
              alt="Bússola Aérea"
              className="va-logo"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />

            <div>
              <div className="va-pill">
                <span className="va-dot" /> Pesquisa de menor preço por dia
              </div>

              <h1 className="va-title">Bússola Aérea</h1>

              <p className="va-subtitle">
                Você escolhe o trecho e o período. Nós pesquisamos o <b>menor preço (Pix) por dia</b> no 123milhas e
                entregamos <b>Excel + PDF</b> (Top 5). Ideal para decidir o melhor dia de viajar.
              </p>
            </div>
          </div>
        </header>

        <section className="va-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              openWhats(buildMessage(false));
            }}
          >
            <section className="va-section">
              <div className="va-label">Dados</div>

              <div className="va-grid2">
                <input className="va-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
                <div className="va-row">
                  <button type="button" onClick={() => setTipo("ida_volta")} className={`va-chip ${tipo === "ida_volta" ? "va-chip--on" : ""}`}>
                    Ida e volta
                  </button>
                  <button type="button" onClick={() => setTipo("ida")} className={`va-chip ${tipo === "ida" ? "va-chip--on" : ""}`}>
                    Só ida
                  </button>
                </div>
              </div>

              <div className="va-grid2" style={{ marginTop: 10 }}>
                <input className="va-input" value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Origem (ex: JPA ou João Pessoa)" />
                <input className="va-input" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Destino (ex: POA ou Porto Alegre)" />
              </div>

              <div className="va-grid2" style={{ marginTop: 10 }}>
                <div className="va-box">
                  <div className="va-boxTitle">Data inicial</div>
                  <input className="va-input" type="date" min={minToday} value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
                </div>

                <div className="va-box">
                  <div className="va-boxTitle">Período</div>
                  <select className="va-input" value={periodoDias} onChange={(e) => setPeriodoDias(Number(e.target.value))}>
                    {[30, 60, 90, 120, 150, 180].map((d) => (
                      <option key={d} value={d}>
                        {d} dias ({d / 30} bloco(s) de 30)
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                    A partir de 60 dias: cada bloco adicional de 30 dias tem <b>50% off</b>.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <textarea className="va-input" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações (opcional)" />
              </div>

              {error ? <div style={{ marginTop: 10, fontSize: 12, color: "rgba(249,115,22,.95)" }}>{error}</div> : null}
            </section>

            <section className="va-section">
              <div className="va-label">Pagamento via Pix</div>

              <div className="va-grid2">
                <div className="va-box">
                  <div className="va-boxTitle">Resumo</div>
                  <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
                    <b>Tipo:</b> {tipo === "ida_volta" ? "Ida e volta" : "Só ida"} <br />
                    <b>Período:</b> {periodoDias} dias ({blocks} bloco(s)) <br />
                    <b>Valor:</b> <span style={{ fontSize: 18, fontWeight: 900 }}>{priceLabel}</span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button type="button" className="va-chip" onClick={() => copyText(priceLabel)}>
                      Copiar valor
                    </button>
                    <button type="button" className="va-chip" onClick={() => copyText(PIX_KEY)}>
                      Copiar chave Pix
                    </button>
                    <button type="button" className="va-chip" onClick={() => copyText(buildMessage(true))}>
                      Copiar mensagem Pix
                    </button>
                  </div>
                </div>

                <div className="va-box">
                  <div className="va-boxTitle">Comprar via WhatsApp</div>
                  <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
                    Abre o WhatsApp com o pedido + valor + chave Pix.
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="va-chip va-chip--on"
                      onClick={() => openWhats(buildMessage(true))}
                      disabled={!canSubmit}
                    >
                      Comprar via Pix (WhatsApp)
                    </button>
                  </div>
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Chave Pix:</div>
                    <div style={{ fontSize: 16, fontWeight: 900, wordBreak: "break-word" }}>{PIX_KEY}</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="va-footer">
              <div className="va-note">Ao enviar, abrirá o WhatsApp com a mensagem pronta.</div>

              <button type="submit" disabled={!canSubmit} className={`va-cta ${canSubmit ? "" : "va-cta--off"}`}>
                Enviar pedido no WhatsApp
              </button>
            </div>
          </form>
        </section>

        <footer className="va-copy">© {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}</footer>
      </div>
    </main>
  );
}
