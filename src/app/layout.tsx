import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";

export const metadata = {
  title: "Vias Aéreas",
  description: "Solicite cotações e acompanhe nossos destinos.",
};

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "Cotação" },
  { href: "/bussola-aerea", label: "Bússola Aérea" },
  { href: "/guias", label: "Guias de Viagem" },
  { href: "/afiliados", label: "Afiliados" },
  { href: "/sobre", label: "Sobre" },
];

function normalizePath(p: string) {
  if (!p) return "/";
  const base = p.split("?")[0].split("#")[0];
  if (base !== "/" && base.endsWith("/")) return base.slice(0, -1);
  return base || "/";
}

function isActive(currentPath: string, href: string) {
  const cur = normalizePath(currentPath);
  const target = normalizePath(href);

  if (target === "/") return cur === "/";
  return cur === target || cur.startsWith(target + "/");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const h = headers();
  const currentPath = normalizePath(h.get("x-pathname") || "/");

  return (
    <html lang="pt-br">
      <body>
        <header className="va-topnav">
          <div className="va-topnav-inner">
            <Link className="va-brandlink" href="/">
              <img className="va-toplogo" src="/logo-vias-aereas.png" alt="Vias Aéreas" />
              <div className="va-brandtext">
                <div className="va-brandname">Vias Aéreas</div>
                <div className="va-brandsub">Cotações • Viagens • Conteúdo</div>
              </div>
            </Link>

            <nav className="va-tabs" aria-label="Menu">
              {NAV.map((item) => {
                const active = isActive(currentPath, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`va-tab ${active ? "va-tab--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
