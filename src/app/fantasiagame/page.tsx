import type { Metadata } from "next";
import { Suspense } from "react";
import { CotacaoPage } from "@/app/page";

export const metadata: Metadata = {
  title: "Vias Aéreas | José Antônio",
  description: "Cotação de passagens da Vias Aéreas com o afiliado José Antônio.",
};

export default function FantasiaGamePage() {
  return (
    <Suspense fallback={null}>
      <CotacaoPage
        welcome="Bem-vindo afiliado José Antônio!"
        affiliateRef="fantasiagame"
        affiliateLabel="José Antônio"
      />
    </Suspense>
  );
}
