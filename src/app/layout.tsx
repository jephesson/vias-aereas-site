import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";

const GA_ID = "G-1ZG0WNM8LZ";

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
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
          }}
        />
      </head>
      <body className={sans.className}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
