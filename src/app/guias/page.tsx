import GuiasClient from "./GuiasClient";

const guias = [
  {
    slug: "tromso",
    cidade: "Tromsø",
    pais: "Noruega",
    resumo: "Neve, cultura nórdica e a busca pela aurora boreal no Ártico.",
  },
  // quando criar:
  // { slug: "paris", cidade: "Paris", pais: "França", resumo: "..." },
  // { slug: "londres", cidade: "Londres", pais: "Reino Unido", resumo: "..." },
];

export default function GuiasPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Guias de Viagem</h1>
          <p className="va-subtitle">
            Seleciona uma cidade e veja dicas reais, custos e roteiro — do jeito que eu vivi.
          </p>

          <GuiasClient guias={guias} />
        </div>
      </div>
    </main>
  );
}
