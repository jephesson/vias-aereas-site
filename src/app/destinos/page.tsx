import DestinoCard from "@/components/DestinoCard";
import { destinos } from "@/data/destinos";

export const metadata = {
  title: "Destinos | Vias Aéreas",
  description: "Veja os destinos atendidos pela Vias Aéreas, no Brasil e no exterior.",
};

export default function DestinosPage() {
  return (
    <main className="bk-list">
      <div className="bk-wrap">
        <h1>Todos os destinos</h1>
        <p>Passagens em dinheiro e milhas para estes destinos, com saída pelos aeroportos de cada cidade.</p>
        <div className="bk-destinos-grid">
          {destinos.map((destino) => (
            <DestinoCard key={destino.slug} destino={destino} />
          ))}
        </div>
      </div>
    </main>
  );
}
