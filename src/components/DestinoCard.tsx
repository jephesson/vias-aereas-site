import Image from "next/image";
import Link from "next/link";
import type { Destino } from "@/data/destinos";

export default function DestinoCard({ destino, anchor = false }: { destino: Destino; anchor?: boolean }) {
  return (
    <Link id={anchor ? destino.slug : undefined} className="bk-destino" href={`/destinos#${destino.slug}`}>
      <span className="bk-destino-photo">
        <Image
          src={destino.imagem}
          alt=""
          fill
          quality={90}
          sizes="(max-width: 720px) 46vw, 240px"
        />
      </span>
      <span className="bk-destino-meta">
        <span>
          <strong>{destino.nome}</strong>
          <em>{destino.localizacao}</em>
        </span>
        <span className="bk-destino-go" aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}
