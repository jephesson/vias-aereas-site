const CNPJ = "63.817.773/0001-85";
const INSTAGRAM = "https://www.instagram.com/vias.aereas";

export default function SobrePage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Sobre o Vias Aéreas</h1>

          <p className="va-subtitle">
            O <b>Vias Aéreas</b> é uma agência especializada em cotações inteligentes
            de passagens aéreas, criada com o propósito de ajudar pessoas a viajarem
            pagando os <b>melhores preços possíveis</b>, seja utilizando milhas ou
            tarifas tradicionais.
          </p>

          <p className="va-subtitle">
            Somos um <b>grupo formado por quatro pessoas</b>, todos apaixonados por
            viagens e por encontrar oportunidades reais de economia:
            <br />
            • Eduarda Santos <br />
            • Lucas Araújo <br />
            • Paola Ziani <br />
            • Gabriel Silva
          </p>

          <p className="va-subtitle">
            A empresa foi idealizada pelo <b>Dr. Jephesson Santos</b>, farmacêutico,
            doutor e empreendedor, responsável pelo desenvolvimento do site,
            estrutura tecnológica e pela visão estratégica do projeto.
          </p>

          <p className="va-subtitle">
            Nosso foco é oferecer um atendimento <b>rápido, transparente e humano</b>,
            com cotações geralmente respondidas em até <b>2 horas</b>, sempre buscando
            a melhor alternativa para cada perfil de viajante.
          </p>

          <p className="va-subtitle">
            <b>CNPJ:</b> {CNPJ}
            <br />
            <b>Instagram:</b>{" "}
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              @vias.aereas
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
