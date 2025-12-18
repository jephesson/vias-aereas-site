import { notFound } from "next/navigation";

const data: Record<
  string,
  { titulo: string; subtitulo: string; conteudo: string[] }
> = {
  tromso: {
    titulo: "Tromsø • Noruega",
    subtitulo: "Ártico de verdade: neve, cidade segura e vibe de Natal.",
    conteudo: [
      "📌 Melhor época (pra neve): final do outono / inverno.",
      "🚶‍♂️ Dá pra fazer muita coisa a pé (mas cuidado com gelo).",
      "🍽️ Dica: coma bem antes dos passeios noturnos (frio derruba).",
      "✨ Atualização futura: aurora boreal, tours e custos.",
    ],
  },
  paris: {
    titulo: "Paris • França",
    subtitulo: "Roteiro eficiente + dicas práticas pra economizar tempo.",
    conteudo: [
      "🗺️ Planeje por regiões (1–2 bairros por dia).",
      "🎟️ Compre ingressos com antecedência quando possível.",
      "☕ Cafés: escolha bem pra não cair em armadilha turística.",
    ],
  },
  londres: {
    titulo: "Londres • Reino Unido",
    subtitulo: "Museus, pubs e rolês — dá pra curtir muito sem gastar absurdo.",
    conteudo: [
      "🏛️ Muitos museus são gratuitos.",
      "🚇 Transporte: use cartão/contactless e organize os dias por zona.",
      "🍺 Pub: experiência obrigatória (e tem comida boa).",
    ],
  },
};

export default function GuiaCidadePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = data[slug];

  if (!post) notFound();

  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <a
            href="/guias"
            style={{ textDecoration: "none", color: "var(--muted)" }}
          >
            ← Voltar
          </a>

          <h1 className="va-title" style={{ marginTop: 10 }}>
            {post.titulo}
          </h1>

          <p className="va-subtitle">{post.subtitulo}</p>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {post.conteudo.map((line, i) => (
              <div key={i} className="va-box">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
