const CNPJ = "63.817.773/0001-85";

export default function SobrePage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Sobre o Vias Aéreas</h1>
          <p className="va-subtitle">
            Somos uma agência focada em encontrar a melhor opção de passagem para sua viagem.
            <br />
            <b>Cotação em até 2 horas.</b>
          </p>
          <p className="va-subtitle">CNPJ: <b>{CNPJ}</b></p>
        </div>
      </div>
    </main>
  );
}
