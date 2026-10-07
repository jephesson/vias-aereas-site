import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Vias Aéreas | Passagens aéreas em dinheiro e milhas",
  description:
    "Encontre passagens aéreas em dinheiro e milhas com a Vias Aéreas. Compare opções e encontre as melhores oportunidades para sua viagem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={sans.className}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
