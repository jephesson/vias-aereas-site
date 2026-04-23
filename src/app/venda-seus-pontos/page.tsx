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
      "• Para intermediação, é necessário compartilhar as credenciais do programa de fidelidade, pois as passagens são emitidas diretamente no programa.",
      "• Também será necessário ter disponibilidade para validações de segurança (como *SMS/códigos*) durante as emissões.",
      "• O pagamento ocorre em até *48h após a aprovação* da operação.",
      "• O compartilhamento é tratado com sigilo e utilizado exclusivamente para o processo de emissão aprovado.",
      "• Nunca solicitamos transferências bancárias para liberar pagamento da venda de pontos.",
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
          <div className="va-brand vs-hero">
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

        <section className="va-card vs-card">
          <section className="va-section vs-infoCard">
            <div className="va-label">Como funciona a venda de pontos</div>
            <div className="vs-infoText">
              <p className="va-text">
                Você escolhe o programa (<b>LATAM Pass, Smiles, Livelo, Esfera ou C6 Átomos</b>), informa a quantidade
                de pontos e recebe uma estimativa com o milheiro atual.
              </p>
              <p className="va-text">
                Se aprovar, seguimos no WhatsApp com os próximos passos. Para concluir a operação, é necessário
                compartilhar as credenciais do programa de fidelidade, pois as passagens são emitidas diretamente no
                programa.
              </p>
              <p className="va-text">
                O pagamento é realizado em até <b>48h após a aprovação</b>, conforme análise operacional.
              </p>
            </div>
          </section>

          {/* Programa */}
          <section className="va-section">
            <div className="va-label">Programa</div>
            <div className="va-row vs-programRow">
              {(["SMILES", "LATAM", "LIVELO", "ESFERA", "C6"] as Program[]).map((p) => {
                const on = program === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProgram(p)}
                    className={`va-chip vs-programChip ${on ? "va-chip--on" : ""}`}
                  >
                    {PROGRAM_LABEL[p]}
                  </button>
                );
              })}
            </div>

            <div className="vs-milheiroNow">
              Milheiro para simulação: <b>{formatBRL(milheiro)}</b>
            </div>
            <div className="vs-rateTable">
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
            />

            {!pontosOk ? (
              <div className="vs-warning">
                Informe pelo menos <b>1.000</b> pontos para simular.
              </div>
            ) : null}
          </section>

          {/* Resultado */}
          <section className="va-section">
            <div className="va-label">Simulação</div>

            <div className="va-box vs-resultBox">
              <div className="vs-resultTitle">
                Valor estimado: {formatBRL(valorEstimado)}
              </div>
              <div className="vs-resultCalc">
                {pontosNum.toLocaleString("pt-BR")} pontos ÷ 1.000 × {formatBRL(milheiro)} (milheiro)
              </div>

              <div className="vs-securityBox">
                <b>Atenção:</b> esta simulação <b>não garante</b> a finalização do negócio. Para intermediação,
                será necessário compartilhar as credenciais do programa de fidelidade e ter disponibilidade para envio
                de <b> SMS/códigos</b> durante as emissões. O uso dos dados é restrito ao processo aprovado, com
                confidencialidade. Pagamento em até <b>48h após a aprovação</b>. A negociação é finalizada
                <b> somente via WhatsApp</b>, sem cobrança antecipada para liberar pagamento.
              </div>
            </div>
          </section>

          {/* Aceite + Nome */}
          <section className="va-section">
            <label className="va-check vs-check">
              <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
              <span>
                Li e entendi os avisos acima e quero seguir com a negociação via WhatsApp.
              </span>
            </label>

            <div className="vs-nameWrap">
              <div className="va-label">Seu nome</div>
              <input
                className="va-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>
          </section>

          {/* CTA */}
          <div className="va-footer vs-footer">
            <div className="va-note">
              Ao clicar, abriremos o WhatsApp com a mensagem pronta.
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={!canSubmit}
              className={`va-cta ${canSubmit ? "" : "va-cta--off"}`}
            >
              Enviar para WhatsApp e finalizar
            </button>
          </div>
        </section>

        <footer className="va-copy">
          © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}
        </footer>
      </div>
    </main>
  );
}
