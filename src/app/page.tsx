"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AirportInput from "@/components/AirportInput";
import type { Place } from "@/data/airports";
import type { FlightOffer } from "@/lib/googleFlights";
import { resolveAffiliateNameFallback, resolveTradeMilesAffiliate } from "@/lib/trademilesAffiliate";

const WHATSAPP_NUMBER = "5551992926814"; // 51 99292-6814
const CNPJ = "63.817.773/0001-85";

type TripType = "ida" | "ida_volta";
type LeadPayload = {
  origem: string;
  destino: string;
  tipoViagem: TripType;
  dataIda: string;
  dataVolta: string | null;
  turnoIda: string;
  turnoVolta: string | null;
  datasFlexiveis: boolean;
  bagagem: string;
  passageiros: {
    adultos: number;
    criancas: number;
    bebes: number;
    total: number;
  };
  contato: {
    ddi: string;
    ddd: string;
    numero: string;
  };
  observacoes: string;
  affiliateId: string | null;
  affiliateRef: string | null;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isAfterOrEqual(a?: string, b?: string) {
  if (!a || !b) return true;
  return a >= b; // YYYY-MM-DD
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

    resolveAffiliate()
      .catch(() => {
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
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");

  const [turnoIda, setTurnoIda] = useState("Indiferente");
  const [turnoVolta, setTurnoVolta] = useState("Indiferente");

  const [flexivel, setFlexivel] = useState(false);
  const [bagagem, setBagagem] = useState("Sem bagagem");
  const [obs, setObs] = useState("");

  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [bebes, setBebes] = useState(0);

  const [ddi, setDdi] = useState("+55");
  const [ddd, setDdd] = useState("");
  const [numero, setNumero] = useState("");

  const totalPax = useMemo(() => adultos + criancas + bebes, [adultos, criancas, bebes]);

  const dateError = useMemo(() => {
    if (tripType === "ida_volta" && dataIda && dataVolta && !isAfterOrEqual(dataVolta, dataIda)) {
      return "A data de volta não pode ser anterior à data de ida.";
    }
    return "";
  }, [tripType, dataIda, dataVolta]);

  const canSearch = useMemo(() => {
    if (!fromPlace || !toPlace) return false;
    if (!dataIda) return false;
    if (tripType === "ida_volta" && !dataVolta) return false;
    if (dateError) return false;
    if (totalPax <= 0) return false;
    return true;
  }, [fromPlace, toPlace, dataIda, dataVolta, tripType, totalPax, dateError]);

  function contactLine() {
    if (!ddd.trim() || !numero.trim()) return null;
    const cleanDDI = (ddi || "+55").replace(/\s/g, "");
    return `${cleanDDI} (${ddd}) ${numero}`;
  }

  function buildOfferMessage(offer: FlightOffer) {
    const phone = contactLine();
    const airline =
      offer.returnAirline && offer.returnAirline !== offer.airline
        ? `${offer.airline} (ida) · ${offer.returnAirline} (volta)`
        : offer.airline;

    const linhas = [
      "Olá! Quero o desconto exclusivo de até 30% nesta passagem que encontrei no Google Flights.",
      "",
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tripType === "ida_volta" ? "Ida e volta" : "Só ida"}`,
      `📅 *Ida:* ${dataIda}${offer.departure ? ` — ${offer.departure}` : ""} (${turnoIda})`,
      tripType === "ida_volta" ? `📅 *Volta:* ${dataVolta}${offer.returnDeparture ? ` — ${offer.returnDeparture}` : ""} (${turnoVolta})` : null,
      `✈️ *Companhia:* ${airline}`,
      `💰 *Valor no Google Flights:* ${offer.priceLabel}`,
      offer.duration ? `⏱️ *Duração:* ${offer.duration}` : null,
      `🛑 *Paradas:* ${offer.stopsLabel}`,
      `🧳 *Bagagem:* ${bagagem}`,
      `👤 *Passageiros:* ${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s)`,
      `🔁 *Datas flexíveis:* ${flexivel ? "Sim" : "Não"}`,
      phone ? `📞 *Meu contato:* ${phone}` : null,
      affiliateName ? `🤝 *Indicação:* ${affiliateName}` : null,
      obs.trim() ? `📝 *Observações:* ${obs.trim()}` : null,
      offer.buyLink ? `🔗 *Google Flights:* ${offer.buyLink}` : null,
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function buildLeadPayload(): LeadPayload {
    return {
      origem: origem.trim(),
      destino: destino.trim(),
      tipoViagem: tripType,
      dataIda,
      dataVolta: tripType === "ida_volta" ? dataVolta : null,
      turnoIda,
      turnoVolta: tripType === "ida_volta" ? turnoVolta : null,
      datasFlexiveis: flexivel,
      bagagem,
      passageiros: {
        adultos,
        criancas,
        bebes,
        total: totalPax,
      },
      contato: {
        ddi: ddi.trim() || "+55",
        ddd: ddd.trim(),
        numero: numero.trim(),
      },
      observacoes: obs.trim(),
      affiliateId,
      affiliateRef: ref || null,
    };
  }

  async function sendLeadToBackend(payload: LeadPayload) {
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fluxo principal não pode quebrar por erro de integração.
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch || !fromPlace || !toPlace || searching) return;

    setSearching(true);
    setSearchError("");
    setSearched(true);
    setOffers([]);

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
          turnoIda,
          turnoVolta: tripType === "ida_volta" ? turnoVolta : null,
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

  function openWhatsapp(offer: FlightOffer) {
    const payload = buildLeadPayload();
    void sendLeadToBackend({
      ...payload,
      observacoes: [
        payload.observacoes,
        `Google Flights: ${offer.priceLabel}`,
        `Companhia: ${offer.airline}`,
      ]
        .filter(Boolean)
        .join(" | "),
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOfferMessage(offer))}`;
    window.open(url, "_blank");
  }

  return (
    <main className="va-home">
      <div className="va-home-grid">
        <section className="va-pitch">
          <p className="va-kicker">Preço do Google Flights</p>
          <h1>Pesquise a passagem e chame a gente para pagar menos.</h1>
          <p>
            O valor que aparece é o do Google Flights. No WhatsApp, a Vias Aéreas busca um desconto exclusivo de até 30%.
          </p>
          <ul className="va-points">
            <li>Preço ao vivo do Google Flights</li>
            <li>Desconto exclusivo de até 30%</li>
            <li>Mensagem pronta com os dados da passagem</li>
          </ul>
          {affiliateName ? (
            <div className="va-referralCard">
              <span>Indicação de</span>
              <b>{affiliateName}</b>
            </div>
          ) : null}
        </section>

        <form onSubmit={handleSubmit} className="va-card va-quote">
          {/* Tipo */}
          <section className="va-section">
            <div className="va-label">Tipo de viagem</div>
            <div className="va-row">
              <button
                type="button"
                onClick={() => setTripType("ida_volta")}
                className={`va-chip ${tripType === "ida_volta" ? "va-chip--on" : ""}`}
              >
                Ida e volta
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripType("ida");
                  setDataVolta("");
                }}
                className={`va-chip ${tripType === "ida" ? "va-chip--on" : ""}`}
              >
                Só ida
              </button>
            </div>
          </section>

          {/* Trecho */}
          <section className="va-section">
            <div className="va-label">Trecho</div>
            <div className="va-grid2">
              <AirportInput
                label="Origem"
                value={origem}
                onChange={setOrigem}
                onPick={setFromPlace}
                placeholder="Origem (SAO, GRU ou Curitiba)"
              />
              <AirportInput
                label="Destino"
                value={destino}
                onChange={setDestino}
                onPick={setToPlace}
                placeholder="Destino (SSA, GIG ou Lisboa)"
              />
            </div>
          </section>

          {/* Datas */}
          <section className="va-section">
            <div className="va-label">Datas e turnos</div>

            <div className="va-grid2">
              <div className="va-box">
                <div className="va-boxTitle">Ida</div>
                <div className="va-stack">
                  <input
                    className="va-input"
                    type="date"
                    min={minToday}
                    value={dataIda}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDataIda(v);
                      if (dataVolta && v && !isAfterOrEqual(dataVolta, v)) setDataVolta("");
                    }}
                  />
                  <select className="va-input" value={turnoIda} onChange={(e) => setTurnoIda(e.target.value)}>
                    <option>Indiferente</option>
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Madrugada</option>
                  </select>
                </div>
              </div>

              <div className={`va-box ${tripType === "ida" ? "va-disabled" : ""}`}>
                <div className="va-boxTitle">Volta</div>
                <div className="va-stack">
                  <input
                    className="va-input"
                    type="date"
                    min={dataIda ? dataIda : minToday}
                    value={dataVolta}
                    onChange={(e) => setDataVolta(e.target.value)}
                    disabled={tripType === "ida"}
                  />
                  <select
                    className="va-input"
                    value={turnoVolta}
                    onChange={(e) => setTurnoVolta(e.target.value)}
                    disabled={tripType === "ida"}
                  >
                    <option>Indiferente</option>
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Madrugada</option>
                  </select>
                </div>
              </div>
            </div>

            <label className="va-check">
              <input type="checkbox" checked={flexivel} onChange={(e) => setFlexivel(e.target.checked)} />
              Minhas datas são flexíveis (pode sugerir alternativas)
            </label>

            {dateError ? <div style={{ fontSize: 12, color: "rgba(249,115,22,.95)" }}>{dateError}</div> : null}
          </section>

          {/* Passageiros */}
          <section className="va-section">
            <div className="va-label">Passageiros</div>
            <div className="va-grid3">
              <Counter label="Adultos" value={adultos} setValue={setAdultos} min={1} />
              <Counter label="Crianças" value={criancas} setValue={setCriancas} min={0} />
              <Counter label="Bebês" value={bebes} setValue={setBebes} min={0} />
            </div>
          </section>

          {/* Bagagem */}
          <section className="va-section">
            <div className="va-label">Bagagem</div>
            <select className="va-input" value={bagagem} onChange={(e) => setBagagem(e.target.value)}>
              <option>Sem bagagem</option>
              <option>Bagagem de mão</option>
              <option>Despachada 23kg</option>
              <option>Despachada 2 malas</option>
              <option>Indiferente (cotem todas)</option>
            </select>
          </section>

          {/* Telefone */}
          <section className="va-section">
            <div className="va-label">Telefone para contato</div>
            <div className="va-grid3x">
              <input className="va-input" value={ddi} onChange={(e) => setDdi(e.target.value)} placeholder="+55" />
              <input
                className="va-input"
                value={ddd}
                onChange={(e) => setDdd(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="DDD"
              />
              <input
                className="va-input"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="Número"
              />
            </div>
          </section>

          {/* Observações */}
          <section className="va-section">
            <div className="va-label">Observações (opcional)</div>
            <textarea
              className="va-input"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: voos diretos, horários preferidos, mala extra, etc."
              rows={2}
            />
          </section>

          <div className="va-footer">
            <button type="submit" disabled={!canSearch || searching} className={`va-cta ${canSearch && !searching ? "" : "va-cta--off"}`}>
              {searching ? "Buscando no Google Flights..." : "Ver preço no Google Flights"}
            </button>
            <div className="va-note">
              Escolha origem e destino na lista. O resultado mostra o valor do Google Flights.
            </div>
          </div>
        </form>
      </div>

      {searched ? (
        <section className="va-results" aria-live="polite">
          {searching ? <p className="va-results-status">Consultando o Google Flights...</p> : null}
          {searchError ? <p className="va-results-status">{searchError}</p> : null}
          {!searching && !searchError && offers.length === 0 ? (
            <p className="va-results-status">Nenhuma passagem encontrada para esse trecho e data.</p>
          ) : null}
          {offers.map((offer) => (
            <article key={offer.id} className="va-offer">
              <div>
                <p className="va-offer-kicker">Valor no Google Flights</p>
                <p className="va-offer-price">{offer.priceLabel}</p>
                <p className="va-offer-airline">{offer.airline}</p>
                <p className="va-offer-meta">
                  {offer.stopsLabel}
                  {offer.duration ? ` · ${offer.duration}` : ""}
                  {offer.departure ? ` · ${offer.departure}` : ""}
                </p>
                {offer.returnAirline || offer.returnDeparture ? (
                  <p className="va-offer-meta">
                    Volta: {offer.returnAirline || offer.airline}
                    {offer.returnDeparture ? ` · ${offer.returnDeparture}` : ""}
                  </p>
                ) : null}
                <p className="va-offer-deal">
                  Chame a gente no WhatsApp para conseguir um desconto exclusivo de até 30%.
                </p>
              </div>
              <button type="button" className="va-cta" onClick={() => openWhatsapp(offer)}>
                Quero o desconto no WhatsApp
              </button>
            </article>
          ))}
        </section>
      ) : null}
      <footer className="va-copy va-home-copy">
        © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}
      </footer>
    </main>
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
    <div className="va-counter">
      <div className="va-counterLabel">{label}</div>
      <div className="va-counterRow">
        <button type="button" className="va-counterBtn" onClick={() => setValue(Math.max(min, value - 1))}>
          −
        </button>
        <div className="va-counterVal">{value}</div>
        <button type="button" className="va-counterBtn" onClick={() => setValue(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}
