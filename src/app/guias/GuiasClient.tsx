"use client";

import Link from "next/link";
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
    <div className="va-stack va-guides">
      <div className="va-grid2">
        <div className="va-stack">
          <label className="va-label" htmlFor="guia-busca">
            Pesquisar
          </label>
          <input
            id="guia-busca"
            className="va-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: Tromsø, Noruega, aurora..."
          />
        </div>

        <div className="va-stack">
          <label className="va-label" htmlFor="guia-pais">
            Filtrar por país
          </label>
          <select
            id="guia-pais"
            className="va-input"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
          >
            {paises.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="va-stack">
        {filtrados.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`} className="va-guideLink">
            <span className="va-guideKicker">{g.pais}</span>
            <span className="va-guideTitle">{g.cidade}</span>
            <span className="va-guideText">{g.resumo}</span>
          </Link>
        ))}

        {filtrados.length === 0 && (
          <div className="va-box va-guideEmpty">Nenhum guia encontrado.</div>
        )}
      </div>
    </div>
  );
}
