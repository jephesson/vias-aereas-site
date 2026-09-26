import "./globals.css";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import NavTabs from "@/components/NavTabs";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
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
      <body className={sans.className}>
        <header className="va-topnav">
          <div className="va-topnav-inner">
            <Link className="va-brandlink" href="/">
              <img
                className="va-toplogo"
                src="/logo-vias-aereas.png"
                alt="Vias Aéreas"
              />
              <div className="va-brandtext">
                <div className="va-brandname">Vias Aéreas</div>
                <div className="va-brandsub">Passagens em dinheiro e milhas</div>
              </div>
            </Link>

            <NavTabs />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
