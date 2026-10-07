"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
  disabled?: boolean;
};

const tabs: Tab[] = [
  { href: "/", label: "Cotação", match: "exact" },
  { href: "/bussola-aerea", label: "Bússola Aérea", match: "prefix" },
  { href: "/guias", label: "Guias de Viagem", match: "prefix" },
  { href: "/venda-seus-pontos", label: "Venda seus pontos", match: "prefix" },
  { href: "/afiliados", label: "Afiliados", match: "prefix" },
  { href: "/sobre", label: "Sobre", match: "prefix" },
];

function isActive(pathname: string, tab: Tab) {
  const path = (pathname || "/").split("?")[0].split("#")[0];

  if (tab.match === "exact") return path === tab.href;
  return tab.href === "/" ? path === "/" : path.startsWith(tab.href);
}

export default function NavTabs() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="va-menuBtn"
        aria-expanded={open}
        aria-controls="va-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="va-sr">{open ? "Fechar menu" : "Abrir menu"}</span>
        <span className="va-menuIcon" data-open={open ? "true" : "false"} />
      </button>

      <nav id="va-menu" className={`va-tabs ${open ? "va-tabs--open" : ""}`} aria-label="Menu">
        {tabs.map((tab) => {
          if (tab.disabled) {
            return (
              <span
                key={tab.href}
                className="va-tab va-tab--disabled"
                aria-disabled="true"
                title="Acesso por convite"
              >
                {tab.label}
              </span>
            );
          }

          const active = isActive(pathname, tab);
          return (
            <Link
              key={tab.href}
              className={`va-tab ${active ? "va-tab--active" : ""}`}
              href={tab.href}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
