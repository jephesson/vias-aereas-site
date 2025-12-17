import "./globals.css";

export const metadata = {
  title: "Vias Aéreas",
  description: "Solicite cotações e acompanhe nossos destinos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <header className="va-topnav">
          <div className="va-topnav-inner">
            <a className="va-brandlink" href="/">
              <img className="va-toplogo" src="/logo-vias-aereas.png" alt="Vias Aéreas" />
              <div className="va-brandtext">
                <div className="va-brandname">Vias Aéreas</div>
                <div className="va-brandsub">Cotações • Viagens • Conteúdo</div>
              </div>
            </a>

            <nav className="va-tabs" aria-label="Menu">
              <a className="va-tab" href="/">Cotação</a>
              <a className="va-tab" href="/vlog">Vlog</a>
              <a className="va-tab" href="/afiliados">Afiliados</a>
              <a className="va-tab" href="/sobre">Sobre</a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
