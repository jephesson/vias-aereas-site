"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WHATSAPP_NUMBER = "5553999760707";
const CNPJ = "63.817.773/0001-85";
const BUSSOLA_LOGO = "/logo-bussola-aerea.png";

/** Cupom (somente 1) */
const PROMO_CODE = "VIASAEREAS20";
const PROMO_DISCOUNT = 0.2; // 20%
const PROMO_END = new Date(2026, 0, 10, 23, 59, 59); // 10/01/2026 23:59:59 (local)
const PROMO_STORAGE_KEY = `va_promo_used_${PROMO_CODE}`;
const PROMO_END_LABEL = "10/01/2026";

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

function normalizeCode(s: string) {
  return (s || "").trim().toUpperCase();
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
  const minutesPerDay = 1 * legs; // 1 min/dia por trecho
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

type PromoStatus = "idle" | "invalid" | "expired" | "used" | "applied";
function getPromoStatus(codeRaw: string, used: boolean): PromoStatus {
  const code = normalizeCode(codeRaw);
  if (!code) return "idle";
  if (code !== PROMO_CODE) return "invalid";
  if (new Date() > PROMO_END) return "expired";
  if (used) return "used";
  return "applied";
}

export default function Page() {
  const minToday = useMemo(() => todayISO(), []);

  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState(""); // opcional
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [tipo, setTipo] = useState<TripType>("ida_volta");
  const [dataInicial, setDataInicial] = useState("");
  const [periodoDias, setPeriodoDias] = useState(30);
  const [obs, setObs] = useState("");

  // ✅ cupom
  const [cupom, setCupom] = useState("");
  const [promoUsed, setPromoUsed] = useState(false);

  // ✅ toast
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const used = localStorage.getItem(PROMO_STORAGE_KEY) === "1";
      setPromoUsed(used);
    } catch {
      // ignore
    }
  }, []);

  function showToast(next: ToastState, ms = 3500) {
    setToast(next);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }

  const blocks = Math.max(1, Math.ceil(periodoDias / 30));
  const basePriceCents = calcPriceCents(tipo, periodoDias);

  const promoStatus = useMemo(() => getPromoStatus(cupom, promoUsed), [cupom, promoUsed]);
  const promoApplied = promoStatus === "applied";
  const discountCents = promoApplied ? Math.round(basePriceCents * PROMO_DISCOUNT) : 0;
  const finalPriceCents = Math.max(0, basePriceCents - discountCents);

  const priceLabel = fmtMoneyBR(finalPriceCents);

  // (mantém cálculo interno p/ WhatsApp/operacional)
  const etaMinutes = calcEtaMinutes(tipo, periodoDias);
  const etaLabel = fmtDurationPT(etaMinutes);

  const error = useMemo(() => {
    if (!nome.trim()) return "Informe seu nome.";
    if (!origem.trim() || !destino.trim()) return "Informe origem e destino.";
    if (!dataInicial) return "Escolha a data inicial.";
    if (periodoDias < 30 || periodoDias > 180) return "Escolha entre 30 e 180 dias.";
    return "";
  }, [nome, origem, destino, dataInicial, periodoDias]);

  const canSubmit = !error;

  function promoHint() {
    if (promoStatus === "idle") return null;

    if (promoStatus === "invalid") {
      return <span className="va-inlineBadge va-inlineBadge--warn">Cupom inválido.</span>;
    }
    if (promoStatus === "expired") {
      return (
        <span className="va-inlineBadge va-inlineBadge--warn">
          Cupom expirado (até {PROMO_END_LABEL}).
        </span>
      );
    }
    if (promoStatus === "used") {
      return (
        <span className="va-inlineBadge va-inlineBadge--warn">
          Cupom já usado neste navegador (somente 1º pedido).
        </span>
      );
    }
    return <span className="va-inlineBadge va-inlineBadge--ok">Desconto aplicado ✅ (-20%)</span>;
  }

  function buildMessage() {
    const legsTxt = tipo === "ida_volta" ? "2 trechos (ida + volta)" : "1 trecho (só ida)";

    const linhas: Array<string | null> = [
      "🧭 *Bússola Aérea — Pedido de pesquisa (Agência/Empresa)*",
      "",
      "🤖 Triagem automática no 123milhas: menor preço (Pix) por dia + relatórios para decisão de promoções/cotação.",
      "",
      `👤 *Nome:* ${nome.trim()}`,
      empresa.trim() ? `🏢 *Empresa/Agência:* ${empresa.trim()}` : null,
      `✈️ *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tipo === "ida_volta" ? "Ida e volta (inclui trecho inverso)" : "Só ida"}`,
      `📅 *Data inicial:* ${isoToBR(dataInicial)}`,
      `🗓️ *Período:* ${periodoDias} dias (${blocks} bloco(s) de 30)`,
      `🧭 *Processamento:* ${legsTxt}`,
      "",
      "📦 *Entregas:*",
      "• Excel completo com *todos os dias* (com filtros por data e por preço)",
      "• Resumo *Top 5 melhores datas* em *Excel + PDF*",
      "",
      promoApplied ? `🎟️ *Cupom:* aplicado (-20%)` : null,
      promoApplied ? `💳 *Subtotal:* ${fmtMoneyBR(basePriceCents)}` : null,
      promoApplied ? `💸 *Desconto:* -${fmtMoneyBR(discountCents)}` : null,
      `💰 *Total:* ${fmtMoneyBR(finalPriceCents)}`,
      `⏱️ *Prazo estimado:* ${etaLabel} (após confirmação do funcionário)`,
      obs.trim() ? `📝 *Obs:* ${obs.trim()}` : null,
      "",
      "⚠️ *Ressalvas:* este serviço faz *triagem automática* dos menores preços exibidos no 123milhas. Valores/condições podem mudar sem aviso pela companhia aérea e/ou pelo 123milhas.",
      "✅ A confirmação final (disponibilidade e valor em milhas) ocorre no atendimento, conferindo a data no site da companhia aérea e/ou no 123milhas.",
      "",
      `Vias Aéreas • CNPJ ${CNPJ}`,
    ];

    return linhas.filter(Boolean).join("\n");
  }

  function markPromoUsed() {
    try {
      localStorage.setItem(PROMO_STORAGE_KEY, "1");
      setPromoUsed(true);
    } catch {
      // ignore
    }
  }

  function openWhats() {
    const msg = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    const win = window.open(url, "_blank");

    if (win) {
      if (promoApplied) markPromoUsed();

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
      {toast ? (
        <div className="va-toast-wrap" role="status" aria-live="polite">
          <div className="va-toast">
            <div className="va-toast-text">
              <strong>{toast.title}</strong>
              {toast.desc ? <small>{toast.desc}</small> : null}
            </div>
            <button type="button" className="va-toast-x" aria-label="Fechar" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        </div>
      ) : null}

      <div className="va-shell">
        <header className="va-header">
          <div className="va-brand va-brand--hero">
            <div className="va-brandMedia">
              <div className="va-logoCard">
                <img src={BUSSOLA_LOGO} alt="Logo Bússola Aérea" className="va-logoFill" />
              </div>
            </div>

            <div className="va-heroContent">
              <div className="va-pill">
                <span className="va-dot" /> Pesquisa de menor preço por dia (para Agência/Empresa)
              </div>

              <p className="va-subtitle" style={{ marginTop: 10 }}>
                Você escolhe o trecho e o período. Nosso robô entra no <b>123milhas</b>, coleta a{" "}
                <b>tarifa mais barata (Pix)</b> de cada dia e entrega relatórios prontos para a{" "}
                <b>agência/empresa identificar os melhores dias de promoção</b> e montar a oferta.
              </p>

              <ul className="va-list" style={{ marginTop: 10 }}>
                <li>
                  <b>Excel completo</b> com o preço de <b>todos os dias</b> (filtre por data ou menor preço)
                </li>
                <li>
                  <b>Resumo Top 5</b> melhores datas em <b>Excel + PDF</b> (ideal para enviar ao cliente/aprovação)
                </li>
                <li>Organização clara para decidir rapidamente quando lançar promoções</li>
              </ul>

              <div className="va-divider" />

              <p className="va-text">
                <b>Como funciona:</b> o robô simula a busca, identifica a menor tarifa disponível em cada data e consolida os resultados.
              </p>

              <p className="va-text" style={{ marginTop: 8 }}>
                <b>Importante:</b> o 123milhas usa tarifa em <b>dinheiro + milhas</b>, então não é possível estimar a
                quantidade de milhas por dia aqui. Mesmo assim, o dia mais barato em Pix geralmente é o dia que{" "}
                <b>também tende a ser o mais econômico em milhas</b>.
              </p>

              <div className="va-disclaimerCard" style={{ marginTop: 12 }}>
                <div className="va-disclaimerTitle">Ressalvas</div>
                <p className="va-disclaimer">
                  Este serviço é uma <b>triagem automatizada</b> dos menores preços exibidos no <b>123milhas</b>.
                  Valores/condições podem ser alterados <b>sem aviso</b> pela companhia aérea e/ou pelo 123milhas.{" "}
                  A confirmação final (incluindo valor em milhas e disponibilidade) acontece no atendimento,{" "}
                  conferindo a data no site da companhia aérea e/ou no 123milhas.
                </p>
              </div>
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

              {/* Empresa/Agência + Cupom */}
              <div className="va-grid2" style={{ marginTop: 10 }}>
                <input
                  className="va-input"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Empresa/Agência (opcional)"
                />

                <div className="va-promoWrap">
                  <input
                    className="va-input"
                    value={cupom}
                    onChange={(e) => setCupom(e.target.value)}
                    placeholder="Cupom (opcional)"
                    autoCapitalize="characters"
                  />
                  <div className="va-promoHintRow">{promoHint()}</div>
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
              <div className="va-label">Resumo do pedido</div>
              <div className="va-box">
                <div className="va-boxTitle">Detalhes</div>

                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>
                  <b>Tipo:</b> {tipo === "ida_volta" ? "Ida e volta" : "Só ida"} <br />
                  <b>Período:</b> {periodoDias} dias ({blocks} bloco(s)) <br />
                  <b>Entrega:</b> Excel completo (todos os dias) + Top 5 (Excel + PDF) <br />

                  <div style={{ marginTop: 8 }}>
                    <b>Valor:</b>{" "}
                    {promoApplied ? (
                      <span className="va-priceRow">
                        <span className="va-oldPrice">{fmtMoneyBR(basePriceCents)}</span>
                        <span className="va-priceNow">{fmtMoneyBR(finalPriceCents)}</span>
                        <span className="va-inlineBadge va-inlineBadge--ok">-20%</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 900, color: "var(--blue)" }}>{priceLabel}</span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 8 }}>
                    <b>Cálculo do processamento:</b> 1h + 1 min/dia {tipo === "ida_volta" ? "(por trecho — ida+volta = 2x)" : ""}.
                  </div>

                  {/* mantido só “por trás” */}
                  <div style={{ display: "none" }}>{etaLabel}</div>
                </div>
              </div>
            </section>

            <div className="va-footer">
              <div className="va-note">
                Ao clicar em enviar, abriremos o WhatsApp com a mensagem pronta para finalizar o pedido. <br />
                <b>Atenção:</b> valores e disponibilidade podem mudar sem aviso (CIA/123milhas).
              </div>

              <button type="submit" disabled={!canSubmit} className={`va-cta va-cta--pulse ${canSubmit ? "" : "va-cta--off"}`}>
                Enviar pedido no WhatsApp
              </button>
            </div>

            <div className="va-formDisclaimer">
              <p className="va-disclaimer" style={{ margin: 0 }}>
                <b>Ressalvas:</b> este serviço faz <b>triagem automatizada</b> de preço no <b>123milhas</b>. As tarifas podem mudar{" "}
                <b>sem aviso</b> pela companhia aérea e/ou pelo 123milhas. A confirmação final (incluindo valor em milhas e disponibilidade)
                ocorre no atendimento, conferindo a data no site da companhia aérea e/ou no 123milhas.
              </p>
            </div>
          </form>
        </section>

        <footer className="va-copy">
          © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ} • Valores sujeitos a alteração sem aviso.
        </footer>
      </div>
    </main>
  );
}
