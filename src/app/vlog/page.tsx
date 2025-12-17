const posts = [
  { slug: "tromso", cidade: "Tromsø", pais: "Noruega", resumo: "Meu lugar favorito no Ártico — neve, luzes e uma cidade segura." },
  { slug: "paris", cidade: "Paris", pais: "França", resumo: "Clássica, linda e intensa — dicas práticas e roteiro." },
  { slug: "londres", cidade: "Londres", pais: "Reino Unido", resumo: "Museus, pubs e rolês — como aproveitar bem." },
];

export default function VlogPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <h1 className="va-title">Vlog de Viagens</h1>
          <p className="va-subtitle">
            Um guia estilo vlog: você navega por cidades e eu vou atualizando com dicas e experiências.
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {posts.map((p) => (
              <a key={p.slug} href={`/vlog/${p.slug}`} style={{ textDecoration: "none" }}>
                <div className="va-box">
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{p.cidade} • {p.pais}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>{p.resumo}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
