const WHATSAPP_NUMBER = "5551983474413";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Tenho interesse no Site de Gestão de Milhas. Quero agendar a videochamada exclusiva, sem compromisso."
)}`;

const RECURSOS = [
  {
    titulo: "Nova venda com campos por programa",
    texto:
      "LATAM com código de compra (LA), sobrenome, ida obrigatória e volta opcional. Smiles com localizador, sobrenome, aeroporto de ida (3 letras), ida obrigatória e volta opcional.",
  },
  {
    titulo: "Sugestão inteligente de cedentes",
    texto:
      "Prioriza por saldo, disponibilidade de passageiros e ordem de prioridade configurada na sua operação.",
  },
  {
    titulo: "Check de localizador na sidebar",
    texto:
      "Consulta LATAM e Smiles com ordenação por proximidade do voo, abertura direta do link da LATAM e status rápido.",
  },
  {
    titulo: "Painel financeiro completo",
    texto: "Caixa imediato com entradas, saídas, pendências e projeção para tomada de decisão no mesmo painel.",
  },
  {
    titulo: "Controle de pontos pendentes",
    texto: "Visão OPEN por programa para reduzir esquecimentos e acelerar tratativas internas.",
  },
  {
    titulo: "Gestão de termos e WhatsApp",
    texto: "Fluxo de comunicação e registro de termos integrado ao dia a dia comercial.",
  },
  {
    titulo: "Controle de biometria por turnos",
    texto: "Disponibilidade sim/não com turnos M, T e N e página dedicada com lista de cedentes ativos.",
  },
  {
    titulo: "Dashboard diário e mensal",
    texto:
      "Milheiro vendido em linha por dia e barras por mês, comparativos LATAM vs Smiles e indicadores por funcionário, cliente e dia da semana.",
  },
];

const DESTAQUES = [
  {
    titulo: "LATAM + Smiles",
    texto: "Campos e validações dedicados para cada programa.",
  },
  {
    titulo: "Financeiro integrado",
    texto: "Entradas, saídas, pendências e projeção no mesmo painel.",
  },
  {
    titulo: "Operação personalizada",
    texto: "Fluxo adaptado ao seu processo real de venda.",
  },
];

const DIFERENCIAIS = [
  "Personalização total de campos, validações e status.",
  "Fluxo adaptado ao seu processo real, não ao padrão do mercado.",
  "Dashboard, financeiro e operação no mesmo produto.",
  "No seu domínio, com sua marca e com seus dados.",
];

const LIMITACOES = [
  "Fluxos mais fechados e menos adaptáveis.",
  "Campos e regras normalmente padronizados.",
  "Menor controle sobre modelagem do processo.",
  "Personalização mais limitada para cenários específicos.",
];

const PASSOS = [
  {
    titulo: "Diagnóstico rápido",
    texto: "Mapeamos seu fluxo atual para configurar campos, status e regras do jeito certo.",
  },
  {
    titulo: "Configuração da operação",
    texto: "Ativamos vendas, cedentes, financeiro e localizadores com estrutura pronta para uso.",
  },
  {
    titulo: "Videochamada exclusiva",
    texto: "Mostro o painel ao vivo, sem compromisso, para você validar antes de decidir.",
  },
];

export default function GestaoDeMilhasPage() {
  return (
    <main className="va-bg">
      <div className="va-shell gm-shell">
        <section className="gm-hero">
          <div className="gm-heroMain">
            <div className="gm-badge">Plataforma white-label para operação de milhas</div>
            <h1 className="gm-title">Site de Gestão de Milhas</h1>
            <p className="gm-subtitle">
              Transforme sua operação com um sistema focado no processo real de venda: vendas, cedentes, financeiro,
              localizadores e análise de dados em um único painel.
            </p>

            <div className="gm-highlightGrid">
              {DESTAQUES.map((item) => (
                <article key={item.titulo} className="gm-highlightCard">
                  <h3 className="gm-highlightTitle">{item.titulo}</h3>
                  <p className="gm-highlightText">{item.texto}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="gm-offerCard">
            <div className="gm-offerTagRow">
              <div className="gm-offerTag">Oferta promocional</div>
              <div className="gm-offerTag gm-offerTag--urgent">Tempo limitado</div>
            </div>
            <p className="gm-offerOldPrice">De R$ 1.299,90</p>
            <div className="gm-offerPrice">Por R$ 599,90</div>
            <p className="gm-offerText">+ hospedagem para domínio .com.br (média de R$ 70,00 a cada 2 anos).</p>
            <p className="gm-offerCallout">
              Inclui <b>videochamada exclusiva</b> para apresentar o produto, sem compromisso.
            </p>
            <p className="gm-offerMini">
              Atendimento 1:1 para tirar dúvidas e apresentar o painel com foco no seu processo.
            </p>

            <div className="gm-offerActions">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="va-cta va-ctaLink">
                Agendar videochamada
              </a>
            </div>
          </aside>
        </section>

        <section className="va-card gm-card">
          <div className="gm-sectionHead">
            <h2 className="gm-sectionTitle">O que o sistema entrega na prática</h2>
            <p className="gm-sectionSubtitle">
              Recursos que reduzem erro manual, aumentam velocidade operacional e melhoram previsibilidade.
            </p>
          </div>

          <div className="gm-featureGrid">
            {RECURSOS.map((item) => (
              <article key={item.titulo} className="gm-featureCard">
                <h3 className="gm-featureTitle">{item.titulo}</h3>
                <p className="gm-featureText">{item.texto}</p>
              </article>
            ))}
          </div>

          <div className="gm-resultBox">
            <span className="gm-resultLabel">Resultado</span>
            <p className="gm-resultText">Mais controle, mais velocidade operacional e menos erro manual no dia a dia.</p>
          </div>
        </section>

        <section className="va-card gm-card">
          <div className="gm-sectionHead">
            <h2 className="gm-sectionTitle">Vantagens em relação a plataformas fechadas</h2>
            <p className="gm-sectionSubtitle">
              O principal diferencial é o controle total do seu processo, com configuração aderente à sua operação.
            </p>
          </div>

          <div className="gm-compareGrid">
            <article className="gm-compareCard gm-compareCard--highlight">
              <h3 className="gm-compareTitle">TradeMiles</h3>
              <ul className="gm-compareList">
                {DIFERENCIAIS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="gm-compareCard gm-compareCard--baseline">
              <h3 className="gm-compareTitle">Plataforma padrão de mercado</h3>
              <ul className="gm-compareList">
                {LIMITACOES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="va-card gm-card gm-processCard">
          <div className="gm-sectionHead">
            <h2 className="gm-sectionTitle">Como funciona na prática</h2>
            <p className="gm-sectionSubtitle">Processo simples para você avaliar com segurança e sem compromisso.</p>
          </div>

          <div className="gm-processGrid">
            {PASSOS.map((item, idx) => (
              <article key={item.titulo} className="gm-processStep">
                <div className="gm-processIndex">{String(idx + 1).padStart(2, "0")}</div>
                <h3 className="gm-processTitle">{item.titulo}</h3>
                <p className="gm-processText">{item.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="gm-bottomCta">
          <h2 className="gm-bottomTitle">Quer ver isso rodando na sua operação?</h2>
          <p className="gm-bottomText">
            Eu faço uma videochamada exclusiva, sem compromisso, para apresentar o produto e mostrar como ele se adapta ao seu processo.
          </p>
          <div className="gm-bottomActions">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="va-cta va-ctaLink">
              Quero ver em videochamada
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
