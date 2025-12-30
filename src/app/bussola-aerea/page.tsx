"use client";

import { useMemo, useRef, useState } from "react";

const WHATSAPP_NUMBER = "5553999760707";
const CNPJ = "63.817.773/0001-85";
const BUSSOLA_LOGO = "/logo-bussola-aerea.png";

type TripType = "ida" | "ida_volta";
type ToastState = { title: string; desc?: string } | null;

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
  return `${d}/${m}/${y}`;
}

function fmtMoneyBR(cents: number) {
  const v = (cents || 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// 🔹 Regras de preço
// - 30 dias ida: R$30,00
// - 30 dias ida+volta: R$49,90
// - a partir de 60 dias, cada bloco extra de 30 dias tem 50% de desconto
function calcPriceCents(tipo: TripType, totalDias: number) {
  const blocks = Math.max(1, Math.ceil(totalDias / 30));
  const base = tipo === "ida_volta" ? 4990 : 3000;

  if (blocks === 1) return base;

  const extraBlocks = blocks - 1;
  const extra = Math.round(base * 0.5) * extraBlocks;
  return base + extra;
}

// ⏱️ Prazo: 1 min por dia + 1h (e em ida+volta considera 2 trechos)
function calcEtaMinutes(tipo: TripType, totalDias: number) {
  const legs = tipo === "ida_volta" ? 2 : 1;
  const minutesPerDay = 1 * legs;
  return 60 + totalDias * minutesPerDay;
}

function fmtDurationPT(totalMinutes: number) {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const r = m % 60;

  if (h <= 0) return `${r} min`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}min`;
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

  // ✅ toast
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<number | null>(null);

  function showToast(next: ToastState, ms = 3500) {
    setToast(next);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }

  const blocks = Math.max(1, Math.ceil(periodoDias / 30));
  const priceCents = calcPriceCents(tipo, periodoDias);
  const priceLabel = fmtMoneyBR(priceCents);

  const etaMinutes = calcEtaMinutes(tipo, periodoDias);
  const etaLabel = fmtDurationPT(etaMinutes);

  const error = useMemo(() => {
    if (!nome.trim()) return "Informe seu nome.";
    if (!origem.trim() || !destino.trim()) return "Informe origem e destino.";
    if (!dataInicial) return "Escolha a data inicial.";
    if (periodoDias < 30 || periodoDias > 180)
      return "Escolha entre 30 e 180 dias.";
    return "";
  }, [nome, origem, destino, dataInicial, periodoDias]);

  const canSubmit = !error;

  function buildMessage() {
    const legsTxt = tipo === "ida_volta" ? "2 trechos (ida + volta)" : "1 trecho (só ida)";
    const linhas = [
      "🧭 *Bússola Aérea — Pedido de pesquisa*",
      "",
      "🤖 Pesquisa automatizada do menor preço (Pix) por dia no 123milhas + relatório (Excel + PDF).",
      "",
      `👤 *Nome:* ${nome.trim()}`,
      `✈️ *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${
        tipo === "ida_volta"
          ? "Ida e volta (inclui trecho inverso)"
          : "Só ida"
      }`,
      `📅 *Data inicial:* ${isoToBR(dataInicial)}`,
      `🗓️ *Período:* ${periodoDias} dias (${blocks} bloco(s) de 30)`,
      `🧭 *Processamento:* ${legsTxt}`,
      `💰 *Valor:* ${priceLabel}`,
      `⏱️ *Prazo estimado:* ${etaLabel} (após confirmação do funcionário)`,
      obs.trim() ? `📝 *Obs:* ${obs.trim()}` : null,
      "",
      "ℹ️ O 123milhas utiliza tarifa em dinheiro + milhas; não dá para estimar o valor em milhas por dia aqui.",
      "✅ Porém, ao encontrar o dia mais barato em Pix, geralmente é o dia que também tende a ter o menor custo em milhas.",
      "",
      `Vias Aéreas • CNPJ ${CNPJ}`,
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function openWhats() {
    const msg = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      msg
    )}`;
    const win = window.open(url, "_blank");

    if (win) {
      showToast({
        title: "WhatsApp aberto ✅",
        desc: "Se não abriu, permita pop-ups para este site e tente novamente.",
      });
    } else {
      showToast({
        title: "Pop-up bloqueado ⚠️",
        desc: "Permita pop-ups no navegador e clique em “Enviar pedido” de novo.",
      });
    }
  }

  return (
    <main className="va-bg">
      {/* ✅ Toast */}
      {toast ? (
        <div className="va-toast-wrap" role="status" aria-live="polite">
          <div className="va-toast">
            <div className="va-toast-text">
              <strong>{toast.title}</strong>
              {toast.desc ? <small>{toast.desc}</small> : null}
            </div>
            <button
              type="button"
              className="va-toast-x"
              aria-label="Fechar"
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <div className="va-shell">
        <header className="va-header">
          {/* ✅ Logo retângulo completo (sem legenda “Preço por dia...”) */}
          <div className="va-brand va-brand--hero">
            <div className="va-brandMedia">
              <div className="va-logoCard">
                <img
                  src={BUSSOLA_LOGO}
                  alt="Logo Bússola Aérea"
                  className="va-logoFill"
                />
              </div>
            </div>

            <div>
              <div className="va-pill">
                <span className="va-dot" /> Pesquisa de menor preço por dia
              </div>

              <p className="va-subtitle" style={{ marginTop: 10 }}>
                Você escolhe o trecho e o período. Nosso robô entra no{" "}
                <b>123milhas</b>, coleta a <b>tarifa mais barata (Pix)</b> de cada
                dia e organiza tudo em um relatório pronto.
              </p>

              <ul className="va-list" style={{ marginTop: 10 }}>
                <li>Preço por dia (Pix) no período escolhido</li>
                <li>Relatório em <b>Excel + PDF</b> (Top 5 melhores datas)</li>
                <li>Organização clara para você decidir o melhor dia de viajar</li>
              </ul>

              <div className="va-divider" />

              <p className="va-text">
                <b>Como o robô funciona:</b> ele simula a busca no site do 123milhas,
                identifica a menor tarifa disponível em cada data e consolida os dados.
              </p>

              <p className="va-text" style={{ marginTop: 8 }}>
                <b>Importante:</b> o 123milhas usa tarifa em <b>dinheiro + milhas</b>,
                então não é possível estimar a quantidade de milhas por dia aqui.
                Mesmo assim, o dia mais barato em Pix geralmente é o dia que{" "}
                <b>também tende a ser o mais econômico em milhas</b>.
              </p>

              <p className="va-meta" style={{ marginTop: 10 }}>
                <b>Prazo estimado:</b> {etaLabel}{" "}
                <span style={{ color: "var(--muted2)" }}>
                  (após confirmação do funcionário)
                </span>
                <br />
                <span style={{ color: "var(--muted2)" }}>
                  Cálculo: 1h + 1 min/dia{" "}
                  {tipo === "ida_volta" ? "(por trecho — ida+volta = 2x)" : ""}.
                </span>
              </p>
            </div>
          </div>
        </header>

        <section className="va-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              openWhats();
            }}
          >
            <section className="va-section">
              <div className="va-label">Dados</div>

              <div className="va-grid2">
                <input
                  className="va-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />

                <div className="va-row">
                  <button
                    type="button"
                    onClick={() => setTipo("ida_volta")}
                    className={`va-chip ${
                      tipo === "ida_volta" ? "va-chip--on" : ""
                    }`}
                  >
                    Ida e volta
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("ida")}
                    className={`va-chip ${tipo === "ida" ? "va-chip--on" : ""}`}
                  >
                    Só ida
                  </button>
                </div>
              </div>

              <div className="va-grid2" style={{ marginTop: 10 }}>
                <input
                  className="va-input"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  placeholder="Origem (ex: JPA ou João Pessoa)"
                />
                <input
                  className="va-input"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Destino (ex: POA ou Porto Alegre)"
                />
              </div>

              <div className="va-grid2" style={{ marginTop: 10 }}>
                <div className="va-box">
                  <div className="va-boxTitle">Data inicial</div>
                  <input
                    className="va-input"
                    type="date"
                    min={minToday}
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                  />
                </div>

                <div className="va-box">
                  <div className="va-boxTitle">Período</div>
                  <select
                    className="va-input"
                    value={periodoDias}
                    onChange={(e) => setPeriodoDias(Number(e.target.value))}
                  >
                    {[30, 60, 90, 120, 150, 180].map((d) => (
                      <option key={d} value={d}>
                        {d} dias ({d / 30} bloco(s) de 30)
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                    A partir de 60 dias: cada bloco adicional de 30 dias tem{" "}
                    <b>50% off</b>.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <textarea
                  className="va-input"
                  rows={3}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Observações (opcional)"
                />
              </div>

              {error ? (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "rgba(249,115,22,.95)",
                  }}
                >
                  {error}
                </div>
              ) : null}
            </section>

            <section className="va-section">
              <div className="va-label">Resumo do pedido</div>
              <div className="va-box">
                <div className="va-boxTitle">Detalhes</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
                  <b>Tipo:</b> {tipo === "ida_volta" ? "Ida e volta" : "Só ida"}{" "}
                  <br />
                  <b>Período:</b> {periodoDias} dias ({blocks} bloco(s)) <br />
                  <b>Valor:</b>{" "}
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "var(--blue)",
                    }}
                  >
                    {priceLabel}
                  </span>
                  <br />
                  <b>Prazo estimado:</b>{" "}
                  <span style={{ fontWeight: 900 }}>{etaLabel}</span>{" "}
                  <span style={{ color: "var(--muted2)" }}>
                    (após confirmação do funcionário)
                  </span>
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 6 }}>
                    Cálculo: 1h + 1 min/dia {tipo === "ida_volta" ? "(por trecho — ida+volta = 2x)" : ""}.
                  </div>
                </div>
              </div>
            </section>

            <div className="va-footer">
              <div className="va-note">
                Ao clicar em enviar, abriremos o WhatsApp com a mensagem pronta
                para finalizar o pedido. O prazo acima é uma estimativa.
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`va-cta va-cta--pulse ${
                  canSubmit ? "" : "va-cta--off"
                }`}
              >
                Enviar pedido no WhatsApp
              </button>
            </div>
          </form>
        </section>

        <footer className="va-copy">
          © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}
        </footer>
      </div>
    </main>
  );
}
