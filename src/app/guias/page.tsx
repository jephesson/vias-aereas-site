const cidades = [
  { slug: "tromso", cidade: "Tromsø", pais: "Noruega", resumo: "Ártico de verdade: neve, cidade segura e a busca pela aurora boreal." },
  // adicione aqui só quando tiver conteúdo:
  // { slug: "paris", cidade: "Paris", pais: "França", resumo: "..." },
  // { slug: "londres", cidade: "Londres", pais: "Reino Unido", resumo: "..." },
];

export default function GuiasPage() {
  // Países disponíveis (derivados)
  const paises = Array.from(new Set(cidades.map((c) => c.pais)));

  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Guias de Viagem</h1>
          <p className="va-subtitle">
            Escolha uma cidade para ver o guia completo. Só aparecem destinos que já têm conteúdo publicado.
          </p>

          {/* Filtros simples sem JS (por enquanto visual) */}
          <div style={{ display: "grid", gap: 12, marginTop: 14, gridTemplateColumns: "1fr 1fr" }}>
            <div className="va-box">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Filtrar por país</div>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const first = cidades.find((c) => c.pais === val);
                  if (first) window.location.href = `/guias/${first.slug}`;
                }}
                defaultValue=""
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              >
                <option value="">Selecione…</option>
                {paises.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>
                (Ao selecionar um país, te levo para a primeira cidade disponível)
              </div>
            </div>

            <div className="va-box">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Escolher cidade</div>
              <select
                onChange={(e) => {
                  const slug = e.target.value;
                  if (slug) window.location.href = `/guias/${slug}`;
                }}
                defaultValue=""
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              >
                <option value="">Selecione…</option>
                {cidades.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.cidade} — {c.pais}
                  </option>
                ))}
              </select>
              <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>
                (Lista só com destinos já publicados)
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {cidades.map((c) => (
              <a key={c.slug} href={`/guias/${c.slug}`} style={{ textDecoration: "none" }}>
                <div className="va-box">
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {c.cidade} • {c.pais}
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>{c.resumo}</div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
