import type { Metadata } from "next";
import { Suspense } from "react";
import Operador from "./Operador";

export const metadata: Metadata = {
  title: "Continuidade | Vias Aéreas",
  robots: { index: false, follow: false },
};

export default function ContinuidadePage() {
  return (
    <Suspense fallback={<main className="ct-page" />}>
      <Operador />
    </Suspense>
  );
}
