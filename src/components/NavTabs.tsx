"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; match?: "exact" | "prefix" };

const tabs: Tab[] = [
  { href: "/", label: "Cotação", match: "exact" },
  { href: "/bussola-aerea", label: "Bússola Aérea", match: "prefix" },
  { href: "/guias", label: "Guias de Viagem", match: "prefix" },
  { href: "/afiliados", label: "Afiliados", match: "prefix" },
  { href: "/sobre", label: "Sobre", match: "prefix" },
];

function isActive(pathname: string, tab: Tab) {
  if (tab.match === "exact") return pathname === tab.href;
  return tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
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
