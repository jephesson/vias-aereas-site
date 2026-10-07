"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavTabs from "@/components/NavTabs";

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const overlay = pathname === "/";

  return (
    <header className={`va-topnav ${overlay ? "va-topnav--overlay" : ""}`}>
      <div className="va-topnav-inner">
        <Link className="va-brandlink" href="/">
          <img className="va-toplogo" src="/logo-vias-aereas.png" alt="Vias Aéreas" />
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
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12.04 3.5A8.2 8.2 0 0 0 3.8 11.7c0 1.45.38 2.86 1.1 4.1L3.5 20.5l4.82-1.26a8.2 8.2 0 0 0 3.72.9h.01a8.2 8.2 0 0 0 0-16.4Zm0 15a6.8 6.8 0 0 1-3.46-.94l-.25-.15-2.86.75.76-2.79-.16-.26a6.78 6.78 0 1 1 5.97 3.39Zm3.72-5.08c-.2-.1-1.2-.59-1.39-.66-.19-.07-.32-.1-.46.1-.14.2-.53.66-.65.8-.12.13-.24.15-.44.05-.2-.1-.85-.31-1.62-1-.6-.53-1-1.19-1.12-1.39-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.46-1.1-.63-1.51-.16-.4-.33-.34-.46-.35h-.39c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.14 1.4 2.14 3.4 3 .48.2.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.2-.49 1.37-.96.17-.47.17-.88.12-.96-.05-.08-.19-.13-.4-.23Z"
            />
          </svg>
          Fale no WhatsApp
        </a>
      </div>
    </header>
  );
}
