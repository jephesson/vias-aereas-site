import type { Metadata } from "next";
import Titular from "../Titular";

export const metadata: Metadata = {
  title: "Continuidade | Vias Aéreas",
  robots: { index: false, follow: false },
};

export default async function ContinuidadeTitularPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <Titular token={token.trim().toUpperCase()} />;
}
