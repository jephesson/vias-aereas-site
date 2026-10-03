const CNPJ = "63.817.773/0001-85";
const INSTAGRAM_USER = "@viasaereastrip";
const INSTAGRAM_URL = "https://www.instagram.com/viasaereastrip";

const team = [
  {
    name: "Jephesson Santos",
    role: "Fundador • Diretor de Estratégia e Tecnologia",
    text: "Farmacêutico, doutor em Biologia Celular e Molecular e empreendedor, Jephesson é fundador do Vias Aéreas e responsável pela liderança da equipe e pela estratégia da empresa. Também está à frente do desenvolvimento dos sistemas, plataformas e soluções tecnológicas que estruturam a operação do Vias Aéreas, unindo tecnologia e inteligência de negócios para tornar o processo de pesquisa e atendimento cada vez mais eficiente.",
  },
  {
    name: "Lucas Araújo",
    role: "Fundador • Consultor de Negócios e Viagens",
    text: "Lucas é cofundador do Vias Aéreas, tendo participado da construção do projeto desde sua origem. Com formação em História e experiência em educação e tecnologia, atua também na área de negócios e viagens, participando da prospecção, relacionamento com clientes e desenvolvimento comercial da empresa.",
  },
  {
    name: "Eduarda Santos",
    role: "CEO • Consultora de Negócios e Viagens",
    text: "Técnica em Administração, Eduarda é responsável pela gestão executiva e pela operação comercial do Vias Aéreas. Atua diretamente no relacionamento com clientes, prospecção e desenvolvimento de negócios, garantindo que a experiência construída pela empresa se traduza em um atendimento próximo, ágil e personalizado.",
  },
  {
    name: "Jocykleber Meireles",
    role: "Investidor • Conselheiro de Negócios",
    text: "Profissional da área de Ciências Contábeis, mestre em Ciências Contábeis e com experiência acadêmica nas áreas de Contabilidade, Finanças e Gestão, Jocykleber integra o Vias Aéreas como investidor. Sua experiência contribui para a visão empresarial e para o desenvolvimento sustentável da companhia.",
  },
  {
    name: "Rian Floriano",
    role: "Consultor de Negócios e Viagens",
    text: "Engenheiro civil, com experiência em projetos e tecnologia BIM, Rian atua na frente comercial do Vias Aéreas. Participa da prospecção de novos clientes, relacionamento e desenvolvimento de soluções de viagem, contribuindo para aproximar a empresa de novos viajantes e parceiros.",
  },
];

const method = [
  {
    title: "Pesquisa antes da recomendação",
    paragraphs: [
      "Não acreditamos que exista uma única forma de comprar uma passagem.",
      "Uma mesma viagem pode apresentar resultados completamente diferentes dependendo da data, horário, aeroporto, companhia aérea, bagagem, programa de fidelidade e disponibilidade de assentos.",
      "Por isso, analisamos diferentes cenários antes de apresentar uma recomendação.",
    ],
  },
  {
    title: "Dinheiro ou milhas?",
    paragraphs: [
      "Nem toda emissão com milhas é vantajosa.",
      "Esse é um dos princípios do nosso trabalho.",
      "Sempre que possível, comparamos a alternativa de compra tradicional com as possibilidades de emissão utilizando milhas. A recomendação considera as condições encontradas no momento da pesquisa e o custo efetivo de cada alternativa.",
      "O objetivo é encontrar a solução mais eficiente para aquela viagem, e não simplesmente utilizar milhas por utilizar.",
    ],
  },
  {
    title: "Inteligência em programas de fidelidade",
    paragraphs: [
      "O mercado de milhas é dinâmico. Campanhas, disponibilidade, regras e valores podem mudar constantemente.",
      "Por isso, acompanhamos oportunidades em diferentes programas de fidelidade e mantemos uma estrutura própria de pontos e milhas adquiridos em condições estratégicas.",
      "Essa estrutura nos permite avaliar oportunidades de emissão que nem sempre são evidentes em uma pesquisa convencional.",
    ],
  },
  {
    title: "Tecnologia e atendimento humano",
    paragraphs: [
      "O Vias Aéreas foi concebido desde o início como uma empresa orientada por tecnologia.",
      "Nossos sistemas são desenvolvidos internamente para apoiar a pesquisa, organização das informações e operação da equipe.",
      "Mas acreditamos que tecnologia não substitui o atendimento humano.",
      "A tecnologia amplia nossa capacidade. A experiência da nossa equipe transforma informação em uma recomendação.",
    ],
  },
];

const pillars = [
  {
    title: "Transparência",
    text: "Apresentamos as condições encontradas de forma clara, sem criar falsas economias ou recomendar uma emissão apenas porque utiliza milhas.",
  },
  {
    title: "Agilidade",
    text: "Nossa equipe trabalha para que as cotações sejam realizadas com rapidez. Em condições normais, buscamos enviar as propostas em até 2 horas.",
  },
  {
    title: "Personalização",
    text: "Cada viajante possui necessidades diferentes. Por isso, nossas cotações consideram não apenas o preço, mas também horários, bagagem, flexibilidade, aeroportos e demais características relevantes para a viagem.",
  },
];

export default function SobrePage() {
  return (
    <main className="so">
      <section className="so-hero">
        <div className="so-wrap">
          <p className="so-kicker">A empresa</p>
          <h1>Sobre o Vias Aéreas</h1>
          <p className="so-lead">
            Inteligência, experiência e estratégia para transformar milhas e tarifas em melhores viagens.
          </p>
        </div>
      </section>

      <div className="so-wrap so-body">
        <section className="so-prose">
          <p>
            O <strong>Vias Aéreas</strong> é uma agência de viagens especializada em estratégias de compra e emissão de
            passagens aéreas, combinando tecnologia, conhecimento de mercado e experiência com programas de fidelidade
            para encontrar soluções de viagem mais eficientes para cada cliente.
          </p>
          <p>
            Mais do que simplesmente pesquisar passagens, analisamos diferentes possibilidades de{" "}
            <strong>tarifas, milhas, datas, horários, rotas, bagagens e condições de emissão</strong> para identificar
            a alternativa que melhor equilibra preço, conveniência e disponibilidade.
          </p>
          <p>
            Nossa proposta é tornar um mercado que muitas vezes parece complexo — especialmente o universo das milhas —
            mais simples, transparente e acessível.
          </p>
        </section>

        <section className="so-block">
          <h2>Uma empresa construída sobre diferentes competências</h2>
          <p className="so-intro">
            O Vias Aéreas nasceu da união entre <strong>empreendedorismo, tecnologia, gestão e conhecimento de viagens</strong>.
            Nossa equipe reúne profissionais com diferentes formações e experiências, cada um contribuindo para uma etapa
            essencial do negócio.
          </p>
          <div className="so-team">
            {team.map((person) => (
              <article key={person.name} className="so-person">
                <h3>{person.name}</h3>
                <p className="so-role">{person.role}</p>
                <p>{person.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="so-block">
          <h2>Nossa forma de trabalhar</h2>
          <div className="so-methods">
            {method.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="so-block">
          <h2>Uma nova forma de encontrar sua passagem</h2>
          <div className="so-prose">
            <p>Encontrar uma boa passagem não deveria depender apenas de abrir um buscador e escolher o primeiro resultado.</p>
            <p>
              Existem diferentes caminhos para chegar ao mesmo destino — e cada um pode apresentar custos, horários e
              condições diferentes.
            </p>
            <p>É nesse espaço que o Vias Aéreas atua.</p>
            <p className="so-steps">
              <strong>Pesquisamos.</strong> <strong>Comparamos.</strong> <strong>Analisamos.</strong> E apresentamos as
              alternativas.
            </p>
            <p>
              O cliente recebe uma visão clara das possibilidades disponíveis para sua viagem e pode escolher a opção
              que melhor atende às suas necessidades.
            </p>
          </div>
        </section>

        <section className="so-block">
          <h2>Nosso compromisso</h2>
          <p className="so-intro">Nosso compromisso é oferecer uma experiência baseada em três pilares:</p>
          <div className="so-pillars">
            {pillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="so-close">
          <p className="so-kicker">Vias Aéreas</p>
          <h2>Inteligência para encontrar. Experiência para escolher. Tecnologia para transformar.</h2>
          <p>
            Seja uma passagem convencional ou uma emissão com milhas, nosso trabalho é encontrar as possibilidades e
            transformar um processo complexo em uma experiência simples, clara e personalizada.
          </p>
        </section>

        <p className="so-note">
          Valores, disponibilidade, tarifas e condições de emissão estão sujeitos a alterações conforme a
          disponibilidade das companhias aéreas e as regras dos programas de fidelidade. As informações apresentadas em
          uma cotação refletem as condições disponíveis no momento da pesquisa e não constituem garantia de
          disponibilidade até a confirmação da reserva ou emissão.
        </p>

        <footer className="so-foot">
          <strong>Vias Aéreas</strong>
          <span>CNPJ: {CNPJ}</span>
          <span>
            Instagram:{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              {INSTAGRAM_USER}
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
