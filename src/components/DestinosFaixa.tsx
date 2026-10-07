"use client";

import DestinoCard from "@/components/DestinoCard";
import type { Destino } from "@/data/destinos";

export default function DestinosFaixa({ destinos }: { destinos: Destino[] }) {
  const loop = [...destinos, ...destinos];
  const seconds = Math.max(destinos.length * 2.4, 24);

  return (
    <div className="bk-faixa">
      <div className="bk-faixa-track" style={{ animationDuration: `${seconds}s` }}>
        {loop.map((destino, position) => (
          <DestinoCard key={`${destino.slug}-${position}`} destino={destino} />
        ))}
      </div>
    </div>
  );
}
