"use client";

import { useEffect, useState } from "react";
import DestinoCard from "@/components/DestinoCard";
import type { Destino } from "@/data/destinos";

const VISIBLE = 5;

export default function DestinosFaixa({ destinos }: { destinos: Destino[] }) {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(true);
  const [paused, setPaused] = useState(false);
  const total = destinos.length;
  const loop = total > VISIBLE ? [...destinos, ...destinos.slice(0, VISIBLE)] : destinos;

  useEffect(() => {
    if (paused || total <= VISIBLE) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setSliding(true);
      window.requestAnimationFrame(() => {
        setIndex((current) => current + 1);
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  useEffect(() => {
    if (index < total) return;
    const timer = window.setTimeout(() => {
      setSliding(false);
      setIndex(0);
    }, 720);
    return () => window.clearTimeout(timer);
  }, [index, total]);

  return (
    <div
      className="bk-faixa"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={`bk-faixa-track${sliding ? "" : " is-instant"}`}
        style={{ ["--i" as string]: index }}
      >
        {loop.map((destino, position) => (
          <DestinoCard key={`${destino.slug}-${position}`} destino={destino} />
        ))}
      </div>
    </div>
  );
}
