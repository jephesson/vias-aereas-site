export default function AfiliadosPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Afiliados</h1>
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
              href="https://trademiles.com.br/afiliado/cadastro"
              target="_blank"
              rel="noopener noreferrer"
              className="va-cta va-ctaLink"
            >
              Quero me cadastrar como afiliado
            </a>
          </div>

          <div style={{ height: 14 }} />
          <p className="va-text">
            Pagamos <b>20% do lucro</b> dos clientes indicados para compra de passagens.
          </p>
          <p className="va-text">
            Para clientes indicados na venda de pontos, pagamos <b>R$ 1,50</b> para cada <b>mil pontos</b> negociados com o indicado pelo afiliado.
          </p>
        </div>
      </div>
    </main>
  );
}
