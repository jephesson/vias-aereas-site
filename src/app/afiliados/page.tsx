type Seguro = {
  id: string;
  nome: string;
  descricao: string;
  url: string;
  cupom?: string;
};

// Cole aqui os links gerados no painel do Parceiros Promo.
const SEGUROS: Seguro[] = [
  {
    id: "seguro-viagem-internacional",
    nome: "Seguro Viagem Internacional",
    descricao: "Cobertura para emergências médicas, extravio de bagagem e imprevistos na viagem.",
    url: "",
    cupom: "",
  },
  {
    id: "seguro-viagem-nacional",
    nome: "Seguro Viagem Nacional",
    descricao: "Proteção para viagens dentro do Brasil com assistência 24h.",
    url: "",
    cupom: "",
  },
  {
    id: "seguro-multiviagens",
    nome: "Seguro Multiviagens",
    descricao: "Plano anual para quem viaja várias vezes ao ano.",
    url: "",
    cupom: "",
  },
];

export default function SegurosPage() {
  const totalComLink = SEGUROS.filter((seguro) => seguro.url.trim()).length;

  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Seguros</h1>
          <p className="va-subtitle">
            Área para divulgar seus seguros de afiliado. Cole os links no array <b>SEGUROS</b> deste arquivo e eles aparecem aqui automaticamente.
          </p>
          <p className="va-subtitle">
            Configurados: <b>{totalComLink}</b> de <b>{SEGUROS.length}</b> links.
          </p>

          <div style={{ height: 14 }} />

          <section className="va-pricegrid" aria-label="Lista de seguros">
            {SEGUROS.map((seguro) => {
              const temLink = Boolean(seguro.url.trim());
              return (
                <article key={seguro.id} className="va-pricecard">
                  <div className="va-pricetop">
                    <h2 className="va-h2">{seguro.nome}</h2>
                    <span className="va-tag">{temLink ? "Ativo" : "Sem link"}</span>
                  </div>

                  <p className="va-text">{seguro.descricao}</p>

                  {seguro.cupom?.trim() ? (
                    <p className="va-meta">
                      Cupom: <b>{seguro.cupom}</b>
                    </p>
                  ) : (
                    <p className="va-meta">Sem cupom configurado.</p>
                  )}

                  <div className="va-priceActions">
                    {temLink ? (
                      <a
                        href={seguro.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="va-cta va-ctaLink"
                      >
                        Abrir link do seguro
                      </a>
                    ) : (
                      <button type="button" className="va-cta va-cta--off" disabled>
                        Adicione o link no código
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
