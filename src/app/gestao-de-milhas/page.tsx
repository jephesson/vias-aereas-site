const TRADEMILES_URL = "https://www.trademiles.com.br";
const WHATSAPP_NUMBER = "5551983474413";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Tenho interesse no Site de Gestão de Milhas e quero mais informações."
)}`;

export default function GestaoDeMilhasPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Site de Gestão de Milhas</h1>
          <p className="va-subtitle">
            Transforme sua operação de milhas com uma plataforma completa, feita para o seu processo real de venda.
            O sistema white-label organiza vendas, cedentes, financeiro, localizadores e análise de dados em um só painel.
          </p>

          <div style={{ height: 12 }} />

          <h2 className="va-h2">O que o sistema entrega na prática</h2>
          <ul className="va-list">
            <li>
              <b>Nova venda com campos obrigatórios por programa:</b> LATAM com código LA, sobrenome, ida obrigatória e volta opcional.
              Smiles com localizador, sobrenome, aeroporto de ida (3 letras), ida obrigatória e volta opcional.
            </li>
            <li>
              <b>Sugestão inteligente de cedentes:</b> considera saldo, prioridade e disponibilidade de passageiros.
            </li>
            <li>
              <b>Check Localizador na sidebar:</b> LATAM e Smiles com ordenação por proximidade de voo, abertura direta de link da LATAM
              e status rápido (Confirmado, Cancelado e Alterado).
            </li>
            <li>
              <b>Painel financeiro completo (caixa imediato):</b> entradas, saídas, pendências e projeção.
            </li>
            <li>
              <b>Controle de pontos pendentes (OPEN):</b> separado por programa.
            </li>
            <li>
              <b>Gestão de termos e comunicação:</b> integração operacional por WhatsApp.
            </li>
            <li>
              <b>Controle de biometria:</b> disponibilidade (sim/não) + turnos (M, T, N) e página com lista de quem está disponível.
            </li>
            <li>
              <b>Dashboard de análise diária e mensal:</b> gráficos de milheiro vendido (linha por dia e barras por mês), comparativos
              LATAM vs Smiles, tooltip com média de milheiro e indicadores por funcionário, cliente e dia da semana.
            </li>
          </ul>

          <p className="va-text">
            <b>Resultado:</b> mais controle, mais velocidade operacional e menos erro manual no dia a dia.
          </p>

          <div className="va-divider" />

          <h2 className="va-h2">Grande vantagem vs iDDAS</h2>
          <p className="va-text">
            A principal vantagem é personalização total com controle do seu próprio processo. Em vez de seguir um fluxo fechado, o sistema
            é adaptado às suas regras (campos, validações, status, dashboards, financeiro e operação), no seu domínio, com seus dados e
            sua marca.
          </p>

          <div className="va-divider" />

          <div className="va-pricegrid">
            <article className="va-pricecard">
              <div className="va-pricetop">
                <div className="va-tag">Oferta promocional</div>
              </div>

              <div className="va-price">R$ 600,00</div>
              <p className="va-priceSub">
                + valor da hospedagem para domínio .com.br (média de R$ 70,00 a cada 2 anos).
              </p>

              <div className="va-priceActions">
                <a href={TRADEMILES_URL} target="_blank" rel="noopener noreferrer" className="va-cta va-ctaLink">
                  Acessar TradeMiles
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="va-cta2 va-ctaLink">
                  Falar no WhatsApp
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
