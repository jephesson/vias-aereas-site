"use client";

import { useMemo, useState } from "react";

type Guia = {
  slug: string;
  cidade: string;
  pais: string;
  resumo: string;
};

export default function GuiasClient({ guias }: { guias: Guia[] }) {
  const [q, setQ] = useState("");
  const [pais, setPais] = useState("Todos");

  const paises = useMemo(() => {
    const set = new Set(guias.map((g) => g.pais));
    return ["Todos", ...Array.from(set).sort()];
  }, [guias]);

  const filtrados = useMemo(() => {
    return guias
      .filter((g) => (pais === "Todos" ? true : g.pais === pais))
      .filter((g) => {
        const s = (g.cidade + " " + g.pais + " " + g.resumo).toLowerCase();
        return s.includes(q.toLowerCase());
      });
  }, [guias, q, pais]);

  return (
    <>
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <div className="va-box" style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Pesquisar</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex: Tromsø, Noruega, aurora..."
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Filtrar por país</div>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                outline: "none",
              }}
            >
              {paises.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {filtrados.map((g) => (
            <a
              key={g.slug}
              href={`/guias/${g.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div className="va-box">
                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  {g.cidade} • {g.pais}
                </div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {g.resumo}
                </div>
              </div>
            </a>
          ))}

          {filtrados.length === 0 && (
            <div className="va-box" style={{ color: "var(--muted)" }}>
              Nenhum guia encontrado.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
