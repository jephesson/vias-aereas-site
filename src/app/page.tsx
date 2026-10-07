"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AirportInput from "@/components/AirportInput";
import DestinosFaixa from "@/components/DestinosFaixa";
import type { Place } from "@/data/airports";
import { destinos, destinosDestaque } from "@/data/destinos";
import type { FlightLeg, FlightOffer } from "@/lib/googleFlights";
import { resolveAffiliateNameFallback, resolveTradeMilesAffiliate } from "@/lib/trademilesAffiliate";

const WHATSAPP_NUMBER = "5551992926814";
const CNPJ = "63.817.773/0001-85";

type TripType = "ida" | "ida_volta" | "multi";

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

function formatMoney(amount: number) {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  const [outboundOffers, setOutboundOffers] = useState<FlightOffer[]>([]);
  const [returnOffers, setReturnOffers] = useState<FlightOffer[]>([]);
  const [outboundId, setOutboundId] = useState("");
  const [returnId, setReturnId] = useState("");
  const [outboundOpen, setOutboundOpen] = useState(true);
  const [returnOpen, setReturnOpen] = useState(true);
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
  const selectedOutbound = outboundOffers.find((offer) => offer.id === outboundId) ?? null;
  const selectedReturn = returnOffers.find((offer) => offer.id === returnId) ?? null;
  const quoteReady = Boolean(
    tripType !== "multi" && selectedOutbound && !outboundOpen && (tripType === "ida" || (selectedReturn && !returnOpen)),
  );
  const totalNumber = (selectedOutbound?.priceNumber ?? 0) + (selectedReturn?.priceNumber ?? 0);
  const totalLabel = formatMoney(totalNumber);

  const dateError = useMemo(() => {
    if (tripType === "ida_volta" && dataIda && dataVolta && !isAfterOrEqual(dataVolta, dataIda)) {
      return "A data de volta não pode ser anterior à data de ida.";
    }
    return "";
  }, [tripType, dataIda, dataVolta]);

  const canSearch = Boolean(
    fromPlace && toPlace && dataIda && (tripType !== "ida_volta" || dataVolta) && !dateError && totalPax > 0,
  );

  function swapRoute() {
    setOrigem(destino);
    setDestino(origem);
    setFromPlace(toPlace);
    setToPlace(fromPlace);
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!paxRef.current?.contains(event.target as Node)) setPaxOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function buildOfferMessage() {
    if (!selectedOutbound) return "";
    const linhas = [
      "Olá! Quero o desconto exclusivo de até 30% nesta passagem.",
      "",
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tripType === "ida_volta" ? "Ida e volta" : "Só ida"}`,
      `👤 *Passageiros:* ${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s)`,
      "",
      legLines("Ida", dataIda, selectedOutbound.outbound),
      `💰 *Preço da ida:* ${selectedOutbound.priceLabel}`,
      selectedReturn ? legLines("Volta", dataVolta, selectedReturn.outbound) : null,
      selectedReturn ? `💰 *Preço da volta:* ${selectedReturn.priceLabel}` : null,
      `💰 *Total:* ${totalLabel}`,
      affiliateName ? `🤝 *Indicação:* ${affiliateName}` : null,
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function openWhatsapp() {
    if (!selectedOutbound) return;
    const companhias = [selectedOutbound.outbound.airline, selectedReturn?.outbound.airline].filter(Boolean).join(" / ");
    const observacoes = [`Total: ${totalLabel}`, `Companhia: ${companhias}`].join(" | ");
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
        precoGoogleFlights: totalLabel,
        companhia: companhias,
      }),
    }).catch(() => undefined);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOfferMessage())}`;
    window.open(url, "_blank");
  }

  function openMultiWhatsapp() {
    const texto = [
      "Olá! Quero uma cotação multidestinos.",
      "",
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* Multidestinos`,
      `📅 *Ida:* ${formatDate(dataIda)}`,
      dataVolta ? `📅 *Volta:* ${formatDate(dataVolta)}` : null,
      `👤 *Passageiros:* ${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s)`,
      affiliateName ? `🤝 *Indicação:* ${affiliateName}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSearch || !fromPlace || !toPlace || searching) return;
    if (tripType === "multi") {
      setPaxOpen(false);
      openMultiWhatsapp();
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearched(true);
    setOutboundOffers([]);
    setReturnOffers([]);
    setOutboundId("");
    setReturnId("");
    setOutboundOpen(true);
    setReturnOpen(true);
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
      const data = (await response.json()) as { outbound?: FlightOffer[]; inbound?: FlightOffer[]; error?: string };
      if (!response.ok) {
        setSearchError(data.error || "Não foi possível consultar os voos.");
        return;
      }
      setOutboundOffers(data.outbound ?? []);
      setReturnOffers(data.inbound ?? []);
    } catch {
      setSearchError("Não foi possível consultar os voos.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="bk">
      <section className="bk-stage">
        <h1 className="va-sr">Encontre o voo. Pague menos.</h1>
        <img
          className="bk-hero-image"
          src="/hero-banner.jpg"
          alt="Vias Aéreas. Encontre o voo. Pague menos. Até 30% de desconto exclusivo, atendimento especializado, rápido, seguro e gratuito."
          fetchPriority="high"
        />
      </section>

      <div className="bk-wrap">
        <form className="bk-search" onSubmit={handleSubmit}>
          <div className="bk-types">
            <button type="button" className={tripType === "ida_volta" ? "is-on" : ""} onClick={() => setTripType("ida_volta")}>
              Ir e volta
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
            <button
              type="button"
              className={tripType === "multi" ? "is-on" : ""}
              onClick={() => {
                setTripType("multi");
                setSearched(false);
              }}
            >
              Multidestinos
            </button>
          </div>

          <div className="bk-rail">
            <div className="bk-route">
              <label className="bk-cell">
                <span>Origem</span>
                <AirportInput label="Origem" value={origem} onChange={setOrigem} onPick={setFromPlace} placeholder="SAO, GRU ou cidade" />
              </label>
              <button type="button" className="bk-swap" onClick={swapRoute} aria-label="Inverter origem e destino">
                ⇄
              </button>
              <label className="bk-cell">
                <span>Destino</span>
                <AirportInput label="Destino" value={destino} onChange={setDestino} onPick={setToPlace} placeholder="SSA, GIG ou cidade" />
              </label>
            </div>
            <div className="bk-when">
            <DateField
              label="Ida"
              value={dataIda}
              min={minToday}
              onChange={(value) => {
                setDataIda(value);
                if (dataVolta && value && !isAfterOrEqual(dataVolta, value)) setDataVolta("");
              }}
            />
            <DateField
              label="Volta"
              value={dataVolta}
              min={dataIda || minToday}
              disabled={tripType === "ida"}
              onChange={setDataVolta}
            />
            <div className="bk-pax bk-cell" ref={paxRef}>
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
          </div>
          {tripType === "multi" ? (
            <p className="bk-note">Multidestinos a gente monta com você no WhatsApp, com o trecho informado.</p>
          ) : null}
          {dateError ? <p className="bk-error">{dateError}</p> : null}
          {affiliateName ? (
            <p className="bk-ref">
              Indicação de <b>{affiliateName}</b>
            </p>
          ) : null}
        </form>

        {searched ? (
          <section className="bk-results" aria-live="polite">
            {searching ? <p className="bk-status">Consultando os voos e horários...</p> : null}
            {searchError ? <p className="bk-status">{searchError}</p> : null}
            {!searching && !searchError && outboundOffers.length === 0 && returnOffers.length === 0 ? (
              <p className="bk-status">Nenhum voo encontrado para esse trecho e data.</p>
            ) : null}
            {outboundOffers.length > 0 ? (
              <FlightChoices
                title={outboundId && !outboundOpen ? "Ida escolhida" : "Escolha a ida"}
                hint={`${outboundOffers.length === 1 ? "1 voo" : `${outboundOffers.length} voos`} · preço só da ida`}
                flights={outboundOffers}
                selectedId={outboundId}
                open={outboundOpen || !outboundId}
                date={dataIda}
                direction="Ida"
                onSelect={(id) => {
                  setOutboundId(id);
                  setOutboundOpen(false);
                  requestAnimationFrame(() => {
                    document.getElementById("escolha-volta")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                onChange={() => setOutboundOpen(true)}
              />
            ) : null}
            {tripType === "ida_volta" && selectedOutbound && !outboundOpen && returnOffers.length > 0 ? (
              <FlightChoices
                id="escolha-volta"
                title={returnId && !returnOpen ? "Volta escolhida" : "Escolha a volta"}
                hint={`${returnOffers.length === 1 ? "1 voo" : `${returnOffers.length} voos`} · preço só da volta`}
                flights={returnOffers}
                selectedId={returnId}
                open={returnOpen || !returnId}
                date={dataVolta}
                direction="Volta"
                onSelect={(id) => {
                  setReturnId(id);
                  setReturnOpen(false);
                }}
                onChange={() => setReturnOpen(true)}
              />
            ) : null}
            {tripType === "ida_volta" && selectedOutbound && !outboundOpen && !searching && !searchError && returnOffers.length === 0 ? (
              <p className="bk-status">Nenhum voo de volta encontrado para essa data.</p>
            ) : null}
            {quoteReady ? (
              <div className="bk-bar">
                <div className="bk-bar-inner">
                  <div>
                    <p className="bk-bar-price">
                      {selectedReturn ? "Total da ida e volta" : "Preço total"} <strong>{totalLabel}</strong>
                    </p>
                    <p className="bk-bar-deal">
                      {selectedReturn
                        ? `${selectedOutbound?.priceLabel} na ida + ${selectedReturn.priceLabel} na volta.`
                        : "Chame a gente no WhatsApp e pegue um desconto exclusivo de até 30%."}
                    </p>
                  </div>
                  <button type="button" className="bk-search-btn" onClick={openWhatsapp}>
                    Quero o desconto
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="bk-beneficios" aria-label="Benefícios">
          <ul>
            <li>
              <BenefitIcon kind="plane" />
              <span>Todas as companhias aéreas</span>
            </li>
            <li>
              <BenefitIcon kind="miles" />
              <span>Opções em dinheiro e milhas</span>
            </li>
            <li>
              <BenefitIcon kind="chat" />
              <span>Suporte via WhatsApp</span>
            </li>
            <li>
              <BenefitIcon kind="star" />
              <span>Consultoria personalizada</span>
            </li>
            <li>
              <BenefitIcon kind="lock" />
              <span>Seus dados 100% seguros</span>
            </li>
          </ul>
        </section>

        <section className="bk-destinos" aria-labelledby="destinos-titulo">
          <div className="bk-destinos-head">
            <div>
              <h2 id="destinos-titulo">Destinos em destaque</h2>
              <p>Confira algumas das melhores oportunidades que encontramos para nossos clientes.</p>
            </div>
          </div>
          <DestinosFaixa destinos={[...destinosDestaque, ...destinos.filter((destino) => !destino.destaque)]} />
        </section>
      </div>

      <footer className="bk-foot">
        <img
          className="bk-partners"
          src="/barra-beneficios.png"
          alt="Mais de 10.000 viajantes atendidos, atendimento especializado, compra segura e parceria com as principais companhias aéreas: LATAM, GOL, Azul, Smiles, Iberia, TAP e Air France."
        />
        <p className="bk-copy">© {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}</p>
      </footer>
    </main>
  );
}

function BenefitIcon({ kind }: { kind: "plane" | "miles" | "chat" | "star" | "lock" }) {
  const common = { viewBox: "0 0 32 32", "aria-hidden": true as const };
  if (kind === "plane") {
    return (
      <svg {...common}>
        <path d="M5 17.5 27 8l-6.2 16.2-4.2-5.2L5 17.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "miles") {
    return (
      <svg {...common}>
        <rect x="5" y="9" width="22" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 14h22M11 9v14" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (kind === "chat") {
    return (
      <svg {...common}>
        <path d="M7 8h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H14l-5 4v-4H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg {...common}>
        <path d="m16 6 2.4 5.6L24.5 13l-4.2 3.8 1.2 6L16 19.8 10.5 22.8l1.2-6L7.5 13l6.1-1.4L16 6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="8" y="14" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 14v-3a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
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

function FlightChoices({
  id,
  title,
  hint,
  flights,
  selectedId,
  open,
  date,
  direction,
  onSelect,
  onChange,
}: {
  id?: string;
  title: string;
  hint: string;
  flights: FlightOffer[];
  selectedId: string;
  open: boolean;
  date: string;
  direction: "Ida" | "Volta";
  onSelect: (id: string) => void;
  onChange: () => void;
}) {
  const visible = open ? flights : flights.filter((offer) => offer.id === selectedId);

  return (
    <div className="bk-choice" id={id}>
      <div className="bk-results-head">
        <h2>{title}</h2>
        {open ? <p>{hint}</p> : null}
      </div>
      <div className="bk-list">
        {visible.map((offer) => {
          const chosen = selectedId === offer.id;
          return (
            <article key={offer.id} className={`bk-flight ${chosen ? "is-on" : ""}`}>
              <LegView title={direction} date={date} leg={offer.outbound} />
              <span className="bk-fare">
                <strong>{offer.priceLabel}</strong>
                {chosen && !open ? (
                  <button type="button" className="bk-pick is-change" onClick={onChange}>
                    Alterar voo
                  </button>
                ) : (
                  <button type="button" className="bk-pick" onClick={() => onSelect(offer.id)}>
                    Selecionar
                  </button>
                )}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LegView({ title, date, leg }: { title: string; date: string; leg: FlightLeg }) {
  return (
    <span className="bk-leg">
      <span className="bk-leg-kicker">
        <span className={`bk-dir ${title === "Volta" ? "is-volta" : "is-ida"}`}>{title}</span>
        {leg.departWhen || formatDate(date)}
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

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function toISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function DateField({
  label,
  value,
  min,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  min: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className={`bk-cell bk-date ${disabled ? "is-off" : ""}`} ref={boxRef}>
      <span>{label}</span>
      <button
        type="button"
        className="va-input bk-date-btn"
        disabled={disabled}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <b className={value ? "" : "is-empty"}>{value ? formatDate(value) : "dd/mm/aaaa"}</b>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
      {open && !disabled ? (
        <Calendar
          min={min}
          value={value}
          onPick={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Calendar({ min, value, onPick }: { min: string; value: string; onPick: (iso: string) => void }) {
  const initial = parseISO(value || min);
  const [cursor, setCursor] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const minMonth = parseISO(min);
  const canPrev = year > minMonth.getFullYear() || (year === minMonth.getFullYear() && month > minMonth.getMonth());

  return (
    <div className="bk-cal" role="dialog" aria-label={`Calendário de ${MONTHS[month]}`}>
      <div className="bk-cal-head">
        <button type="button" aria-label="Mês anterior" disabled={!canPrev} onClick={() => setCursor(new Date(year, month - 1, 1))}>
          ‹
        </button>
        <strong>
          {MONTHS[month]} {year}
        </strong>
        <button type="button" aria-label="Próximo mês" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>
      <div className="bk-cal-week">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="bk-cal-grid">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const iso = toISO(new Date(year, month, day));
          return (
            <button key={iso} type="button" disabled={iso < min} className={iso === value ? "is-on" : ""} onClick={() => onPick(iso)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
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
