export default function AfiliadosPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <div className="va-pill">
            <span className="va-dot" /> Programa de afiliados
          </div>
          <h1 className="va-title" style={{ marginTop: 10 }}>Afiliados Vias Aéreas</h1>
          <p className="va-subtitle">
            Faça login para acessar sua área de afiliado. Se ainda não for afiliado, cadastre-se e faça parte do nosso time de divulgadores.
          </p>

          <div style={{ height: 14 }} />
          <div className="va-priceActions">
            <a
              href="https://trademiles.com.br/afiliado/login"
              target="_blank"
              rel="noopener noreferrer"
              className="va-cta va-ctaLink"
            >
              Acessar login de afiliados
            </a>
            <a
              href="https://www.trademiles.com.br/afiliado/cadastro"
              target="_blank"
              rel="noopener noreferrer"
              className="va-cta va-ctaLink"
            >
              Quero me cadastrar como afiliado
            </a>
          </div>

          <section
            className="va-section"
            style={{
              marginTop: 18,
              border: "1px solid rgba(59,130,246,.14)",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(59,130,246,.10), rgba(14,165,233,.08))",
            }}
          >
            <div className="va-label">Como funciona sua comissão</div>

            <div style={{ display: "grid", gap: 10 }}>
              <div className="va-box" style={{ border: "1px solid rgba(2,6,23,.08)" }}>
                <strong>1) Indicação para venda de pontos</strong>
                <p className="va-text" style={{ marginTop: 8 }}>
                  Você recebe <b>R$ 1,50 para cada 1.000 pontos</b> negociados do cliente indicado, em qualquer programa
                  que operamos (<b>LATAM Pass, Smiles, Livelo, Esfera e C6 Átomos</b>).
                </p>
                <p className="va-text" style={{ marginTop: 8 }}>
                  Exemplo: cliente vendeu 100.000 pontos ⇒ comissão do afiliado: <b>R$ 150,00</b>.
                </p>
              </div>

              <div className="va-box" style={{ border: "1px solid rgba(2,6,23,.08)" }}>
                <strong>2) Indicação para compra de passagem</strong>
                <p className="va-text" style={{ marginTop: 8 }}>
                  Você recebe <b>20% sobre o lucro</b> de cada passagem vendida para cliente novo indicado.
                </p>
                <p className="va-text" style={{ marginTop: 8 }}>
                  Importante: não é sobre o valor total da passagem. O lucro é calculado internamente pelo nosso sistema
                  após descontar custos de compra de pontos e taxa de embarque (além das despesas operacionais aplicáveis).
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
