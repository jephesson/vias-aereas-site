"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; match?: "exact" | "prefix" };

const tabs: Tab[] = [
  { href: "/", label: "Cotação", match: "exact" },
  { href: "/bussola-aerea", label: "Bússola Aérea", match: "prefix" },
  { href: "/guias", label: "Guias de Viagem", match: "prefix" },
  { href: "/gestao-de-milhas", label: "Gestão de Milhas", match: "prefix" },

  // ✅ NOVO: Venda seus pontos
  { href: "/venda-seus-pontos", label: "Venda seus pontos", match: "prefix" },

  { href: "/afiliados", label: "Seguros", match: "prefix" },
  { href: "/sobre", label: "Sobre", match: "prefix" },
];

function isActive(pathname: string, tab: Tab) {
  const path = (pathname || "/").split("?")[0].split("#")[0];

  if (tab.match === "exact") return path === tab.href;
  return tab.href === "/" ? path === "/" : path.startsWith(tab.href);
}

export default function NavTabs() {
  const pathname = usePathname() || "/";

  return (
    <nav className="va-tabs" aria-label="Menu">
      {tabs.map((t) => {
        const active = isActive(pathname, t);
        return (
          <Link
            key={t.href}
            className={`va-tab ${active ? "va-tab--active" : ""}`}
            href={t.href}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
