import "./globals.css";
import Link from "next/link";
import NavTabs from "@/components/NavTabs"; // ajuste o caminho se o seu arquivo estiver em outro lugar

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
    <html lang="pt-br">
      <body>
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
                <div className="va-brandsub">Cotações • Viagens • Conteúdo</div>
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
