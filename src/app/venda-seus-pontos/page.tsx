"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveTradeMilesAffiliate } from "@/lib/trademilesAffiliate";

const WHATSAPP_NUMBER = "5551983474413"; // 55 + 51 + 983474413
const CNPJ = "63.817.773/0001-85";

type Program = "SMILES" | "ESFERA" | "LIVELO" | "LATAM" | "C6";

const PROGRAM_LABEL: Record<Program, string> = {
  SMILES: "Smiles",
  ESFERA: "Esfera",
  LIVELO: "Livelo",
  LATAM: "LATAM Pass",
  C6: "C6 Átomos",
};

const MILHEIRO_REAIS: Record<Program, number> = {
  SMILES: 10,
  ESFERA: 22,
  LIVELO: 22,
  LATAM: 20,
  C6: 22,
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VendaSeusPontosPage />
    </Suspense>
  );
}

function VendaSeusPontosPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref")?.trim() ?? "";
  const [affiliateName, setAffiliateName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function resolveAffiliate() {
      if (!ref) {
        setAffiliateName("");
        return;
      }

      const affiliate = await resolveTradeMilesAffiliate(ref);
      if (cancelled) return;
      setAffiliateName(affiliate?.name ?? "");
    }

    resolveAffiliate().catch(() => {
      if (cancelled) return;
      setAffiliateName("");
    });

    return () => {
      cancelled = true;
    };
  }, [ref]);
  const [program, setProgram] = useState<Program>("SMILES");
  const [pontos, setPontos] = useState<string>(""); // string p/ input
  const [nome, setNome] = useState<string>("");
  const [aceito, setAceito] = useState(false);

  const pontosNum = useMemo(() => {
    const n = Number(onlyDigits(pontos));
    return Number.isFinite(n) ? n : 0;
  }, [pontos]);

  const milheiro = MILHEIRO_REAIS[program];

  const valorEstimado = useMemo(() => {
    // pontos / 1000 * preço do milheiro
    return (pontosNum / 1000) * milheiro;
  }, [pontosNum, milheiro]);

  const pontosOk = pontosNum >= 1000; // mínimo prático p/ simulação
  const canSubmit = useMemo(() => {
    if (!aceito) return false;
    if (!nome.trim()) return false;
    if (!pontosOk) return false;
    return true;
  }, [aceito, nome, pontosOk]);

  function buildMessage() {
    const linhas = [
      "💰 *Simulação — Venda de Pontos (Vias Aéreas)*",
      "",
      affiliateName ? `🤝 *Indicação:* ${affiliateName}` : null,
      affiliateName ? "" : null,
      `👤 *Nome:* ${nome.trim()}`,
      `🏷️ *Programa:* ${PROGRAM_LABEL[program]}`,
      `✨ *Pontos:* ${pontosNum.toLocaleString("pt-BR")}`,
      `💵 *Milheiro (simulação):* ${formatBRL(milheiro)}`,
      `📌 *Valor estimado:* *${formatBRL(valorEstimado)}*`,
      "",
      "⚠️ *Avisos importantes:*",
      "• Esta simulação *não garante* a finalização do negócio.",
      "• Para intermediação, será necessário fornecer os dados do programa e ter disponibilidade para envio de *SMS/códigos* durante as emissões.",
      "• O pagamento ocorre em até *24h após o início das emissões*.",
      "• A negociação e finalização acontecem *somente via WhatsApp*.",
      "",
      "✅ *Quero seguir com a venda. Pode me orientar nos próximos passos.*",
    ];

    return linhas.join("\n");
  }

  function handleWhatsApp() {
    if (!canSubmit) return;
    const msg = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <main className="va-bg">
      <div className="va-shell">
        <header className="va-header">
          <div className="va-brand">
            <div>
              <div className="va-pill">
                <span className="va-dot" /> Simulador rápido
              </div>

              <h1 className="va-title">Venda seus pontos</h1>

              <p className="va-subtitle">
                Selecione o programa, informe a quantidade de pontos e veja a simulação atualizada.
                <br />
                Ao aceitar, você envia os dados pelo WhatsApp para finalizar conosco.
              </p>

              {affiliateName ? (
                <div className="va-referralCard">
                  <span>Indicação de</span>
                  <b>{affiliateName}</b>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="va-card">
          <section
            className="va-section"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,.10), rgba(14,165,233,.08))",
              border: "1px solid rgba(59,130,246,.16)",
              borderRadius: 16,
            }}
          >
            <div className="va-label">Como funciona a venda de pontos</div>
            <div style={{ display: "grid", gap: 8, color: "var(--muted)" }}>
              <p className="va-text" style={{ margin: 0 }}>
                Você escolhe o programa (<b>LATAM Pass, Smiles, Livelo, Esfera ou C6 Átomos</b>), informa a quantidade
                de pontos e recebe uma estimativa com o milheiro atual.
              </p>
              <p className="va-text" style={{ margin: 0 }}>
                Se aprovar, seguimos no WhatsApp com os próximos passos, validação da conta e suporte durante o processo
                de emissão.
              </p>
              <p className="va-text" style={{ margin: 0 }}>
                O pagamento é realizado em até <b>24h após o início das emissões</b>, conforme análise operacional.
              </p>
            </div>
          </section>

          {/* Programa */}
          <section className="va-section">
            <div className="va-label">Programa</div>
            <div className="va-row" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["SMILES", "LATAM", "LIVELO", "ESFERA", "C6"] as Program[]).map((p) => {
                const on = program === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProgram(p)}
                    className={`va-chip ${on ? "va-chip--on" : ""}`}
                    style={{
                      borderRadius: 999,
                      padding: "10px 14px",
                      border: "1px solid rgba(0,0,0,.10)",
                      background: on ? "rgba(59,130,246,.12)" : "white",
                      fontWeight: 800,
                    }}
                  >
                    {PROGRAM_LABEL[p]}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)" }}>
              Milheiro para simulação: <b>{formatBRL(milheiro)}</b>
            </div>
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
                Tabela atual: Smiles <b>R$ 10,00</b> • LATAM Pass <b>R$ 20,00</b> • Livelo <b>R$ 22,00</b> • Esfera{" "}
                <b>R$ 22,00</b> • C6 Átomos <b>R$ 22,00</b>.
              </div>
          </section>

          {/* Pontos */}
          <section className="va-section">
            <div className="va-label">Quantidade de pontos</div>
            <input
              className="va-input"
              value={pontos}
              onChange={(e) => setPontos(e.target.value)}
              placeholder="Ex: 100000"
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                outline: "none",
                width: "100%",
              }}
            />

            {!pontosOk ? (
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(249,115,22,.95)" }}>
                Informe pelo menos <b>1.000</b> pontos para simular.
              </div>
            ) : null}
          </section>

          {/* Resultado */}
          <section className="va-section">
            <div className="va-label">Simulação</div>

            <div className="va-box" style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                Valor estimado: {formatBRL(valorEstimado)}
              </div>
              <div style={{ color: "var(--muted)" }}>
                {pontosNum.toLocaleString("pt-BR")} pontos ÷ 1.000 × {formatBRL(milheiro)} (milheiro)
              </div>

              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,.08)",
                  background: "rgba(0,0,0,.02)",
                  color: "var(--muted)",
                  lineHeight: 1.45,
                  fontSize: 13,
                }}
              >
                <b>Atenção:</b> esta simulação <b>não garante</b> a finalização do negócio. Para intermediação,
                será necessário fornecer os dados do programa e ter disponibilidade para envio de <b>SMS/códigos</b>{" "}
                durante as emissões. Pagamento em até <b>24h após o início das emissões</b>. A negociação é finalizada
                <b> somente via WhatsApp</b>.
              </div>
            </div>
          </section>

          {/* Aceite + Nome */}
          <section className="va-section">
            <label className="va-check" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
              <span>
                Li e entendi os avisos acima e quero seguir com a negociação via WhatsApp.
              </span>
            </label>

            <div style={{ marginTop: 12 }}>
              <div className="va-label">Seu nome</div>
              <input
                className="va-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,.12)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
          </section>

          {/* CTA */}
          <div className="va-footer" style={{ display: "grid", gap: 10 }}>
            <div className="va-note">
              Ao clicar, abriremos o WhatsApp com a mensagem pronta.
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={!canSubmit}
              className={`va-cta ${canSubmit ? "" : "va-cta--off"}`}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,.10)",
                fontWeight: 900,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.55,
              }}
            >
              Enviar para WhatsApp e finalizar
            </button>
          </div>
        </section>

        <footer className="va-copy" style={{ marginTop: 16 }}>
          © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}
        </footer>
      </div>
    </main>
  );
}
