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
    <main className="so">
      <section className="so-hero">
        <div className="so-wrap">
          <p className="so-kicker">Roteiros</p>
          <h1>Guias de Viagem</h1>
          <p className="so-lead">Seleciona uma cidade e veja dicas reais, custos e roteiro — do jeito que a gente viveu.</p>
        </div>
      </section>
      <div className="so-wrap so-body">
        <GuiasClient guias={guias} />
      </div>
    </main>
  );
}
