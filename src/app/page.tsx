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
    selectedOutbound && !outboundOpen && (tripType === "ida" || (selectedReturn && !returnOpen)),
  );
  const totalNumber = (selectedOutbound?.priceNumber ?? 0) + (selectedReturn?.priceNumber ?? 0);
  const totalLabel = formatMoney(totalNumber);

  const dateError = useMemo(() => {
    if (tripType === "ida_volta" && dataIda && dataVolta && !isAfterOrEqual(dataVolta, dataIda)) {
      return "A data de volta não pode ser anterior à data de ida.";
    }
    return "";
  }, [tripType, dataIda, dataVolta]);

  const canSearch = Boolean(fromPlace && toPlace && dataIda && (tripType === "ida" || dataVolta) && !dateError && totalPax > 0);

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSearch || !fromPlace || !toPlace || searching) return;

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
        <div className="bk-stage-inner">
          <div className="bk-hero">
            <div>
              <p className="bk-kicker">Passagens em dinheiro e milhas</p>
              <h1>
                Encontre o voo.
                <span>Pague menos.</span>
              </h1>
              <p className="bk-lead">
                Comparamos preços das principais companhias aéreas e encontramos as melhores oportunidades para você.
              </p>
              <ul className="bk-proof">
                <li>
                  <b>Até 30%</b>
                  <span>de desconto exclusivo</span>
                </li>
                <li>
                  <b>Atendimento</b>
                  <span>especializado</span>
                </li>
                <li>
                  <b>Rápido,</b>
                  <span>seguro e gratuito</span>
                </li>
              </ul>
            </div>
            <p className="bk-script">
              Mais viagens
              <br />
              para a sua história
            </p>
          </div>
        </div>
      </section>

      <div className="bk-wrap">
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
          {dateError ? <p className="bk-error">{dateError}</p> : null}
          {affiliateName ? (
            <p className="bk-ref">
              Indicação de <b>{affiliateName}</b>
            </p>
          ) : null}
        </form>

        {searched ? null : (
          <section className="bk-steps" aria-label="Como funciona">
            <article>
              <span>01</span>
              <h2>Veja os voos</h2>
              <p>Horário, companhia e o preço encontrado na internet.</p>
            </article>
            <article>
              <span>02</span>
              <h2>Escolha o seu</h2>
              <p>Compare as opções e selecione a ida e a volta que fazem sentido.</p>
            </article>
            <article>
              <span>03</span>
              <h2>Fale com a gente</h2>
              <p>Chame no WhatsApp e garanta o desconto exclusivo de até 30%.</p>
            </article>
          </section>
        )}

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
          </section>
        ) : null}
      </div>

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

      <footer className="bk-foot">
        <div className="bk-trust">
          <div className="bk-trust-item">
            <TrustIcon kind="people" />
            <div>
              <strong>+10.000</strong>
              <span>viajantes atendidos</span>
            </div>
          </div>
          <span className="bk-trust-div" aria-hidden="true" />
          <div className="bk-trust-item">
            <TrustIcon kind="headset" />
            <div>
              <strong>Atendimento especializado</strong>
              <span>suporte personalizado</span>
            </div>
          </div>
          <span className="bk-trust-div" aria-hidden="true" />
          <div className="bk-trust-item">
            <TrustIcon kind="shield" />
            <div>
              <strong>Compra segura</strong>
              <span>acompanhamento do início ao fim</span>
            </div>
          </div>
          <span className="bk-trust-div" aria-hidden="true" />
          <p className="bk-trust-note">Parceria com as principais companhias aéreas</p>
          <div className="bk-airlines" aria-label="Companhias parceiras">
            <span className="al al-latam">LATAM</span>
            <span className="al al-gol">GOL</span>
            <span className="al al-azul">Azul</span>
            <span className="al al-smiles">Smiles</span>
            <span className="al al-iberia">IBERIA</span>
            <span className="al al-tap">TAP</span>
            <span className="al al-af">AIRFRANCE</span>
          </div>
        </div>
        <p className="bk-copy">© {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}</p>
      </footer>
    </main>
  );
}

function TrustIcon({ kind }: { kind: "people" | "headset" | "shield" }) {
  if (kind === "people") {
    return (
      <span className="bk-trust-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="11" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="21" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 23.5c.8-3.4 3.4-5.2 6.6-5.2s5.7 1.8 6.5 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 18.6c1.8-.7 3.6-.6 5.2.4 1.6 1 2.6 2.6 3.1 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (kind === "headset") {
    return (
      <span className="bk-trust-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M6 17v-1a10 10 0 0 1 20 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="4" y="16" width="5" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="23" y="16" width="5" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M25.5 24v1.2A2.8 2.8 0 0 1 22.7 28H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="bk-trust-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 4.5 26 8.5v7.2c0 5.6-3.8 9.4-10 12.3C9.8 25.1 6 21.3 6 15.7V8.5L16 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m12 16.2 2.6 2.6L20.5 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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
                <span>{direction}</span>
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
