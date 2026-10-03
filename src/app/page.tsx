"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AirportInput from "@/components/AirportInput";
import type { Place } from "@/data/airports";
import type { FlightLeg, FlightOffer } from "@/lib/googleFlights";
import { resolveAffiliateNameFallback, resolveTradeMilesAffiliate } from "@/lib/trademilesAffiliate";

const WHATSAPP_NUMBER = "5551992926814";
const CNPJ = "63.817.773/0001-85";

type TripType = "ida" | "ida_volta";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isAfterOrEqual(a?: string, b?: string) {
  if (!a || !b) return true;
  return a >= b;
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function airportCode(label: string) {
  const match = label.match(/\(([A-Z]{3})\)/);
  return match?.[1] ?? label;
}

function paxLabel(adultos: number, criancas: number, bebes: number) {
  const total = adultos + criancas + bebes;
  return total === 1 ? "1 passageiro" : `${total} passageiros`;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CotacaoPage />
    </Suspense>
  );
}

function CotacaoPage() {
  const searchParams = useSearchParams();
  const minToday = useMemo(() => todayISO(), []);
  const ref = searchParams.get("ref")?.trim() ?? "";
  const affiliateFallbackName = useMemo(() => resolveAffiliateNameFallback(ref), [ref]);
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [affiliateName, setAffiliateName] = useState("");
  const paxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAffiliate() {
      if (!ref) {
        setAffiliateId(null);
        setAffiliateName("");
        return;
      }

      const affiliate = await resolveTradeMilesAffiliate(ref);
      if (cancelled) return;
      setAffiliateId(affiliate?.id ?? null);
      setAffiliateName(affiliate?.name || affiliateFallbackName);
    }

    resolveAffiliate().catch(() => {
      if (cancelled) return;
      setAffiliateId(null);
      setAffiliateName(affiliateFallbackName);
    });

    return () => {
      cancelled = true;
    };
  }, [ref, affiliateFallbackName]);

  const [tripType, setTripType] = useState<TripType>("ida_volta");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [fromPlace, setFromPlace] = useState<Place | null>(null);
  const [toPlace, setToPlace] = useState<Place | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);

  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [bebes, setBebes] = useState(0);

  const totalPax = adultos + criancas + bebes;
  const selected = offers.find((offer) => offer.id === selectedId) ?? null;

  const dateError = useMemo(() => {
    if (tripType === "ida_volta" && dataIda && dataVolta && !isAfterOrEqual(dataVolta, dataIda)) {
      return "A data de volta não pode ser anterior à data de ida.";
    }
    return "";
  }, [tripType, dataIda, dataVolta]);

  const canSearch = Boolean(fromPlace && toPlace && dataIda && (tripType === "ida" || dataVolta) && !dateError && totalPax > 0);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!paxRef.current?.contains(event.target as Node)) setPaxOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function buildOfferMessage(offer: FlightOffer) {
    const linhas = [
      "Olá! Quero o desconto exclusivo de até 30% nesta passagem que escolhi no Google Flights.",
      "",
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tripType === "ida_volta" ? "Ida e volta" : "Só ida"}`,
      `👤 *Passageiros:* ${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s)`,
      "",
      legLines("Ida", dataIda, offer.outbound),
      offer.inbound ? legLines("Volta", dataVolta, offer.inbound) : null,
      `💰 *Preço total no Google Flights:* ${offer.priceLabel}`,
      affiliateName ? `🤝 *Indicação:* ${affiliateName}` : null,
      offer.buyLink ? `🔗 *Google Flights:* ${offer.buyLink}` : null,
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function openWhatsapp(offer: FlightOffer) {
    const observacoes = [`Google Flights: ${offer.priceLabel}`, `Companhia: ${offer.outbound.airline}`].join(" | ");
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origem: origem.trim(),
        destino: destino.trim(),
        tipoViagem: tripType,
        dataIda,
        dataVolta: tripType === "ida_volta" ? dataVolta : null,
        passageiros: { adultos, criancas, bebes, total: totalPax },
        observacoes,
        affiliateId,
        affiliateRef: ref || null,
        precoGoogleFlights: offer.priceLabel,
        companhia: offer.outbound.airline,
      }),
    }).catch(() => undefined);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOfferMessage(offer))}`;
    window.open(url, "_blank");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSearch || !fromPlace || !toPlace || searching) return;

    setSearching(true);
    setSearchError("");
    setSearched(true);
    setOffers([]);
    setSelectedId("");
    setPaxOpen(false);

    try {
      const response = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCode: fromPlace.code,
          toCode: toPlace.code,
          tripType,
          departureDate: dataIda,
          returnDate: tripType === "ida_volta" ? dataVolta : null,
          adults: adultos,
          children: criancas,
          infants: bebes,
        }),
      });
      const data = (await response.json()) as { offers?: FlightOffer[]; error?: string };
      if (!response.ok) {
        setSearchError(data.error || "Não foi possível consultar o Google Flights.");
        return;
      }
      setOffers(data.offers ?? []);
    } catch {
      setSearchError("Não foi possível consultar o Google Flights.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="bk">
      <div className="bk-wrap">
        <header className="bk-intro">
          <p className="bk-kicker">Google Flights</p>
          <h1>Escolha o voo. A gente busca o desconto.</h1>
        </header>

        <form className="bk-search" onSubmit={handleSubmit}>
          <div className="bk-types">
            <button type="button" className={tripType === "ida_volta" ? "is-on" : ""} onClick={() => setTripType("ida_volta")}>
              Ida e volta
            </button>
            <button
              type="button"
              className={tripType === "ida" ? "is-on" : ""}
              onClick={() => {
                setTripType("ida");
                setDataVolta("");
              }}
            >
              Só ida
            </button>
          </div>

          <div className="bk-fields">
            <label>
              <span>Origem</span>
              <AirportInput label="Origem" value={origem} onChange={setOrigem} onPick={setFromPlace} placeholder="SAO, GRU ou cidade" />
            </label>
            <label>
              <span>Destino</span>
              <AirportInput label="Destino" value={destino} onChange={setDestino} onPick={setToPlace} placeholder="SSA, GIG ou cidade" />
            </label>
            <label>
              <span>Ida</span>
              <input
                className="va-input"
                type="date"
                min={minToday}
                value={dataIda}
                onChange={(event) => {
                  const value = event.target.value;
                  setDataIda(value);
                  if (dataVolta && value && !isAfterOrEqual(dataVolta, value)) setDataVolta("");
                }}
              />
            </label>
            <label className={tripType === "ida" ? "is-off" : ""}>
              <span>Volta</span>
              <input
                className="va-input"
                type="date"
                min={dataIda || minToday}
                value={dataVolta}
                disabled={tripType === "ida"}
                onChange={(event) => setDataVolta(event.target.value)}
              />
            </label>
            <div className="bk-pax" ref={paxRef}>
              <span>Passageiros</span>
              <button type="button" className="va-input bk-pax-btn" onClick={() => setPaxOpen((open) => !open)}>
                {paxLabel(adultos, criancas, bebes)}
              </button>
              {paxOpen ? (
                <div className="bk-pax-panel">
                  <Counter label="Adultos" value={adultos} setValue={setAdultos} min={1} />
                  <Counter label="Crianças" value={criancas} setValue={setCriancas} min={0} />
                  <Counter label="Bebês" value={bebes} setValue={setBebes} min={0} />
                </div>
              ) : null}
            </div>
            <button type="submit" className="bk-search-btn" disabled={!canSearch || searching}>
              {searching ? "Buscando..." : "Buscar voos"}
            </button>
          </div>
          {dateError ? <p className="bk-error">{dateError}</p> : null}
          {affiliateName ? (
            <p className="bk-ref">
              Indicação de <b>{affiliateName}</b>
            </p>
          ) : null}
        </form>

        {searched ? (
          <section className="bk-results" aria-live="polite">
            {searching ? <p className="bk-status">Consultando os voos e horários no Google Flights...</p> : null}
            {searchError ? <p className="bk-status">{searchError}</p> : null}
            {!searching && !searchError && offers.length === 0 ? (
              <p className="bk-status">Nenhum voo encontrado para esse trecho e data.</p>
            ) : null}
            {offers.length > 0 ? (
              <>
                <div className="bk-results-head">
                  <h2>Escolha o voo</h2>
                  <p>{offers.length === 1 ? "1 opção" : `${offers.length} opções`} · preço total do Google Flights</p>
                </div>
                <div className="bk-list">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      className={`bk-flight ${selectedId === offer.id ? "is-on" : ""}`}
                      aria-pressed={selectedId === offer.id}
                      onClick={() => setSelectedId(offer.id)}
                    >
                      <span className="bk-radio" aria-hidden="true" />
                      <span className="bk-legs">
                        <LegView title="Ida" date={dataIda} leg={offer.outbound} />
                        {offer.inbound ? <LegView title="Volta" date={dataVolta} leg={offer.inbound} /> : null}
                      </span>
                      <span className="bk-fare">
                        <span>Total</span>
                        <strong>{offer.priceLabel}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : null}
      </div>

      {selected ? (
        <div className="bk-bar">
          <div className="bk-bar-inner">
            <div>
              <p className="bk-bar-price">
                Preço total <strong>{selected.priceLabel}</strong>
              </p>
              <p className="bk-bar-deal">Chame a gente no WhatsApp para conseguir um desconto exclusivo de até 30%.</p>
            </div>
            <button type="button" className="bk-search-btn" onClick={() => openWhatsapp(selected)}>
              Quero o desconto
            </button>
          </div>
        </div>
      ) : null}

      <footer className="bk-copy">© {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}</footer>
    </main>
  );
}

function legLines(title: string, date: string, leg: FlightLeg) {
  const route = [leg.fromLabel, leg.toLabel].filter(Boolean).join(" → ");
  return [
    `✈️ *${title}* · ${formatDate(date)}`,
    `${leg.airline}`,
    `${leg.departTime} → ${leg.arriveTime}${leg.departWhen ? ` · ${leg.departWhen}` : ""}`,
    `${leg.stopsLabel}${leg.duration ? ` · ${leg.duration}` : ""}`,
    route || null,
  ]
    .filter(Boolean)
    .join("\n");
}

function LegView({ title, date, leg }: { title: string; date: string; leg: FlightLeg }) {
  return (
    <span className="bk-leg">
      <span className="bk-leg-kicker">
        {title} · {formatDate(date)}
        {leg.departWhen ? ` · ${leg.departWhen}` : ""}
      </span>
      <span className="bk-leg-row">
        <span className="bk-time">
          <b>{leg.departTime}</b>
          <small>{airportCode(leg.fromLabel)}</small>
        </span>
        <span className="bk-path">
          <small>
            {leg.duration ? `${leg.duration} · ` : ""}
            {leg.stopsLabel}
          </small>
          <span />
        </span>
        <span className="bk-time">
          <b>{leg.arriveTime}</b>
          <small>{airportCode(leg.toLabel)}</small>
        </span>
      </span>
      <span className="bk-airline">{leg.airline}</span>
    </span>
  );
}

function Counter({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) {
  return (
    <div className="bk-counter">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => setValue(Math.max(min, value - 1))} aria-label={`Diminuir ${label}`}>
          −
        </button>
        <b>{value}</b>
        <button type="button" onClick={() => setValue(value + 1)} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
