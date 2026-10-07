import Image from "next/image";
import Link from "next/link";
import type { Destino } from "@/data/destinos";

export default function DestinoCard({ destino }: { destino: Destino }) {
  return (
    <Link id={destino.slug} className="bk-destino" href={`/destinos#${destino.slug}`}>
      <span className="bk-destino-photo">
        <Image
          src={destino.imagem}
          alt={`${destino.nome}, ${destino.localizacao}`}
          fill
          sizes="(max-width: 720px) 50vw, 220px"
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
