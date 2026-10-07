import "./globals.css";
import Link from "next/link";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import NavTabs from "@/components/NavTabs";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const script = Caveat({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-script",
  display: "swap",
});

export const metadata = {
  title: "Vias Aéreas",
  description: "Solicite cotações e acompanhe nossos destinos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.className} ${script.variable}`}>
        <header className="va-topnav">
          <div className="va-topnav-inner">
            <Link className="va-brandlink" href="/">
              <img
                className="va-toplogo"
                src="/logo-vias-aereas.png"
                alt=""
              />
              <div className="va-brandtext">
                <div className="va-brandname">Vias Aéreas</div>
                <div className="va-brandsub">Passagens em dinheiro e milhas</div>
              </div>
            </Link>

            <NavTabs />

            <a
              className="va-wa"
              href="https://wa.me/5551992926814?text=Ol%C3%A1!%20Quero%20falar%20sobre%20passagens."
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale no WhatsApp
            </a>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
