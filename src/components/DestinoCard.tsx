import Image from "next/image";
import Link from "next/link";
import type { Destino } from "@/data/destinos";

export default function DestinoCard({ destino }: { destino: Destino }) {
  return (
    <Link id={destino.slug} className="bk-destino" href={`/destinos#${destino.slug}`}>
      <Image
        src={destino.imagem}
        alt={`${destino.nome}, ${destino.localizacao}`}
        width={768}
        height={620}
        quality={92}
        sizes="(max-width: 720px) 50vw, 280px"
      />
    </Link>
  );
}
