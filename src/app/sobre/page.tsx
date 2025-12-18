const CNPJ = "63.817.773/0001-85";
const INSTAGRAM_USER = "@viasaereastrip";
const INSTAGRAM_URL = "https://www.instagram.com/viasaereastrip";

export default function SobrePage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Sobre o Vias Aéreas</h1>

          <div className="va-stack">
            <p className="va-text">
              O <b>Vias Aéreas</b> é uma agência especializada em cotações inteligentes de passagens,
              criada para ajudar pessoas a viajarem pagando <b>o melhor custo-benefício possível</b>,
              seja com <b>tarifa em dinheiro</b> ou <b>emissão com milhas</b>.
            </p>

            <p className="va-text">
              Somos um <b>grupo formado por quatro pessoas</b>, todos amantes de viagens e de boas oportunidades:
            </p>

            <ul className="va-list">
              <li>Jephesson Santos</li>
              <li>Eduarda Santos</li>
              <li>Lucas Araújo</li>
              <li>Paola Ziani</li>
              <li>Gabriel Silva</li>
            </ul>

            <p className="va-text">
              A empresa foi idealizada pelo <b>Dr. Jephesson Santos</b>, farmacêutico, doutor e empreendedor,
              responsável pelo desenvolvimento do site, pela estrutura tecnológica e pela visão estratégica do projeto.
            </p>

            <div className="va-divider" />

            <h2 className="va-h2">Como funciona a cotação e a emissão</h2>

            <p className="va-text">
              Quando você solicita uma cotação, nós analisamos diferentes combinações de datas, turnos e rotas
              (incluindo opções com e sem bagagem) para encontrar a alternativa mais vantajosa para o seu perfil.
            </p>

            <p className="va-text">
              Além disso, nós <b>comparamos os custos</b> entre:
              <br />
              • <b>Passagens compradas em dinheiro</b> (tarifa tradicional)
              <br />
              • <b>Passagens emitidas com milhas</b>, quando houver disponibilidade e fizer sentido no custo-benefício
            </p>

            <div className="va-divider" />

            <h2 className="va-h2">Por que conseguimos preços competitivos com milhas</h2>

            <p className="va-text">
              Trabalhamos com um <b>banco de pontos</b> (estoque próprio), formado ao longo do tempo por meio de
              <b> campanhas promocionais</b> e condições especiais oferecidas por programas de fidelidade,
              bancos e parceiros oficiais. Quando essas oportunidades aparecem, adquirimos pontos estrategicamente
              para manter um custo competitivo e, assim, conseguir oferecer <b>opções mais econômicas</b> em determinadas rotas e datas.
            </p>

            <ul className="va-list">
              <li>
                <b>Monitoramento diário de oportunidades:</b> acompanhamos campanhas, condições e variações de preços.
              </li>
              <li>
                <b>Comparação real:</b> só recomendamos emissão com milhas quando ela compensa frente à tarifa em dinheiro.
              </li>
              <li>
                <b>Agilidade na busca:</b> experiência prática reduz tempo e aumenta a chance de encontrar boas opções.
              </li>
            </ul>

            <p className="va-text">
              Nosso compromisso é com atendimento <b>rápido, transparente e humano</b>.
              Em geral, enviamos a cotação em até <b>2 horas</b>, sempre com clareza sobre a melhor alternativa disponível no momento.
            </p>

            <p className="va-disclaimer">
              *Valores e disponibilidade podem variar conforme regras das companhias e programas de fidelidade.
              A cotação reflete as condições encontradas no momento da pesquisa.*
            </p>

            <div className="va-divider" />

            <p className="va-meta">
              <b>CNPJ:</b> {CNPJ}
              <br />
              <b>Instagram:</b>{" "}
              <a className="va-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                {INSTAGRAM_USER}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
