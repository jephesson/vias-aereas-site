import airportData from "@/data/airports.json";

const HOST = "google-flights-live-api.p.rapidapi.com";

type AirportFile = {
  airports: [string, string, string, string][];
  cities: [string, string, string, string[]][];
};

const data = airportData as AirportFile;
const airportCodes = new Set(data.airports.map((row) => row[0]));
const cityCovers = new Map(data.cities.map((row) => [row[0], row[3]]));

export type FlightOffer = {
  id: string;
  priceLabel: string;
  priceNumber: number;
  airline: string;
  returnAirline: string | null;
  stopsLabel: string;
  duration: string;
  departure: string;
  arrival: string;
  returnDeparture: string | null;
  returnArrival: string | null;
  buyLink: string | null;
};

export type FlightQuery = {
  fromCode: string;
  toCode: string;
  tripType: "ida" | "ida_volta";
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  turnoIda: string;
  turnoVolta: string | null;
};

const TURNOS: Record<string, [number, number] | null> = {
  Indiferente: null,
  Manhã: [5, 11],
  Tarde: [12, 17],
  Noite: [18, 23],
  Madrugada: [0, 4],
};

export function resolveAirportCodes(code: string) {
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(clean)) return [];
  const covers = cityCovers.get(clean);
  if (covers?.length) return covers.filter((item) => airportCodes.has(item)).slice(0, 3);
  return airportCodes.has(clean) ? [clean] : [];
}

function passengersOf(query: FlightQuery) {
  return [
    ...Array.from({ length: query.adults }, () => 1),
    ...Array.from({ length: query.children }, () => 2),
    ...Array.from({ length: query.infants }, () => 3),
  ];
}

function turnoHours(turno: string | null) {
  if (!turno) return null;
  return TURNOS[turno] ?? null;
}

function stopsLabel(stops: number) {
  if (stops <= 0) return "Direto";
  if (stops === 1) return "1 parada";
  return `${stops} paradas`;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function money(amount: number) {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeRow(row: Record<string, unknown>, roundTrip: boolean): FlightOffer | null {
  const priceNumber = roundTrip
    ? asNumber(row.total_price_as_number)
    : asNumber(row.price_as_number);
  if (priceNumber == null) return null;

  const priceText = asString(roundTrip ? row.total_price : row.price);
  const airline = asString(roundTrip ? row.departure_flight_airline : row.airline) || "Companhia não informada";
  const returnAirline = roundTrip ? asString(row.return_flight_airline) || null : null;
  const stops = roundTrip ? asNumber(row.total_stops) ?? 0 : asNumber(row.stops) ?? 0;
  const duration = roundTrip
    ? asString(row.departure_flight_duration)
    : asString(row.duration);

  return {
    id: "",
    priceLabel: priceText || money(priceNumber),
    priceNumber,
    airline,
    returnAirline,
    stopsLabel: stopsLabel(stops),
    duration,
    departure: asString(roundTrip ? row.departure_flight_departure_description : row.departure_description),
    arrival: asString(roundTrip ? row.departure_flight_arrival_description : row.arrival_description),
    returnDeparture: roundTrip ? asString(row.return_flight_departure_description) || null : null,
    returnArrival: roundTrip ? asString(row.return_flight_arrival_description) || null : null,
    buyLink: asString(row.buy_link) || null,
  };
}

async function postFlights(path: string, body: Record<string, unknown>) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    const error = new Error("missing_key");
    throw error;
  }

  const response = await fetch(`https://${HOST}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": HOST,
      "x-rapidapi-key": key,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(50000),
  });

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (response.status >= 500) {
    throw new Error("search_incomplete");
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "detail" in payload
        ? JSON.stringify((payload as { detail: unknown }).detail)
        : "Não foi possível consultar o Google Flights.";
    const error = new Error(message);
    throw error;
  }

  return Array.isArray(payload) ? payload : [];
}

export async function searchGoogleFlights(query: FlightQuery) {
  const fromCodes = resolveAirportCodes(query.fromCode);
  const toCodes = resolveAirportCodes(query.toCode);
  if (!fromCodes.length || !toCodes.length) {
    throw new Error("invalid_airport");
  }

  const roundTrip = query.tripType === "ida_volta";
  const path = roundTrip ? "/api/google_flights/roundtrip/v1" : "/api/google_flights/oneway/v1";
  const ida = turnoHours(query.turnoIda);
  const volta = turnoHours(query.turnoVolta);
  const passengers = passengersOf(query);
  const pairs = fromCodes.flatMap((from) => toCodes.map((to) => [from, to] as const)).slice(0, 6);

  const batches = await Promise.all(
    pairs.map(async ([from, to]) => {
      const body: Record<string, unknown> = {
        from_airport: from,
        to_airport: to,
        departure_date: query.departureDate,
        currency: "brl",
        seat_type: 1,
        passengers,
        limit: 3,
        sort_type: "Overall",
      };

      if (roundTrip && query.returnDate) body.return_date = query.returnDate;

      if (ida) {
        if (roundTrip) {
          body.departure_departure_time_min = ida[0];
          body.departure_departure_time_max = ida[1];
        } else {
          body.departure_time_min = ida[0];
          body.departure_time_max = ida[1];
        }
      }

      if (roundTrip && volta) {
        body.return_departure_time_min = volta[0];
        body.return_departure_time_max = volta[1];
      }

      const rows = await postFlights(path, body);
      return rows
        .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
        .map((row) => normalizeRow(row, roundTrip))
        .filter((row): row is FlightOffer => Boolean(row));
    }),
  );

  const seen = new Set<string>();
  const offers = batches
    .flat()
    .sort((a, b) => a.priceNumber - b.priceNumber)
    .filter((offer) => {
      const key = `${offer.airline}|${offer.priceNumber}|${offer.departure}|${offer.returnDeparture ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((offer, index) => ({ ...offer, id: String(index + 1) }));

  return offers;
}
