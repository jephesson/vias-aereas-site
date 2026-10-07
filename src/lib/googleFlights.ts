import airportData from "@/data/airports.json";

const HOST = "google-flights-live-api.p.rapidapi.com";

type AirportFile = {
  airports: [string, string, string, string][];
  cities: [string, string, string, string[]][];
};

const data = airportData as AirportFile;
const airportCodes = new Set(data.airports.map((row) => row[0]));
const cityCovers = new Map(data.cities.map((row) => [row[0], row[3]]));

export type FlightLeg = {
  airline: string;
  departTime: string;
  departWhen: string;
  arriveTime: string;
  arriveWhen: string;
  duration: string;
  stopsLabel: string;
  fromLabel: string;
  toLabel: string;
};

export type FlightOffer = {
  id: string;
  priceLabel: string;
  priceNumber: number;
  outbound: FlightLeg;
  inbound: FlightLeg | null;
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

const WEEKDAYS: Record<string, string> = {
  sun: "dom",
  mon: "seg",
  tue: "ter",
  wed: "qua",
  thu: "qui",
  fri: "sex",
  sat: "sáb",
};

const MONTHS: Record<string, string> = {
  jan: "jan",
  feb: "fev",
  mar: "mar",
  apr: "abr",
  may: "mai",
  jun: "jun",
  jul: "jul",
  aug: "ago",
  sep: "set",
  oct: "out",
  nov: "nov",
  dec: "dez",
};

export function prettyDuration(value: string) {
  return value
    .replace(/(\d+)\s*hrs?/gi, "$1h")
    .replace(/(\d+)\s*mins?/gi, "$1min")
    .replace(/\s+/g, " ")
    .trim();
}

function prettyWhen(raw: string) {
  const match = raw.match(/^([A-Za-z]{3}),\s+([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!match) return raw;
  const weekday = WEEKDAYS[match[1].toLowerCase()] ?? match[1].toLowerCase();
  const month = MONTHS[match[2].toLowerCase()] ?? match[2].toLowerCase();
  return `${weekday}, ${match[3]} ${month}`;
}

export function parseSchedule(description: string) {
  const match = description.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s+on\s+(.+)$/i);
  if (!match) return { time: description, when: "" };
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return {
    time: `${String(hour).padStart(2, "0")}:${minute}`,
    when: prettyWhen(match[4].trim()),
  };
}

function prettyAirline(value: string) {
  const tidy = (text: string) => text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim();
  const parts = value.split(/Operated by/i);
  const main = tidy(parts[0] ?? "");
  const seen = new Set<string>();
  const operated = (parts[1] ?? "")
    .split(",")
    .map((part) => tidy(part))
    .filter((name) => {
      const key = name.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (!main) return value.trim();
  const compact = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const mainKey = compact(main);
  const others = operated.filter((name) => {
    const key = compact(name);
    return key && !mainKey.includes(key) && !key.includes(mainKey);
  });
  if (others.length > 0) return `${main} · operado por ${others.join(", ")}`;
  const fuller = [...operated].sort((a, b) => b.length - a.length)[0];
  return fuller && fuller.length > main.length ? fuller : main;
}

function legFrom(
  airline: string,
  depart: string,
  arrive: string,
  duration: string,
  stops: number,
  fromLabel: string,
  toLabel: string,
): FlightLeg {
  const departure = parseSchedule(depart);
  const arrival = parseSchedule(arrive);
  return {
    airline: prettyAirline(airline) || "Companhia não informada",
    departTime: departure.time,
    departWhen: departure.when,
    arriveTime: arrival.time,
    arriveWhen: arrival.when,
    duration: prettyDuration(duration),
    stopsLabel: stopsLabel(stops),
    fromLabel,
    toLabel,
  };
}

function normalizeRow(row: Record<string, unknown>, roundTrip: boolean): FlightOffer | null {
  const priceNumber = roundTrip
    ? asNumber(row.total_price_as_number)
    : asNumber(row.price_as_number);
  if (priceNumber == null) return null;

  const priceText = asString(roundTrip ? row.total_price : row.price);
  const fromLabel = asString(row.from_airport);
  const toLabel = asString(row.to_airport);

  const outbound = legFrom(
    asString(roundTrip ? row.departure_flight_airline : row.airline),
    asString(roundTrip ? row.departure_flight_departure_description : row.departure_description),
    asString(roundTrip ? row.departure_flight_arrival_description : row.arrival_description),
    asString(roundTrip ? row.departure_flight_duration : row.duration),
    roundTrip ? asNumber(row.departure_flight_stops) ?? 0 : asNumber(row.stops) ?? 0,
    fromLabel,
    toLabel,
  );

  const inbound = roundTrip
    ? legFrom(
        asString(row.return_flight_airline),
        asString(row.return_flight_departure_description),
        asString(row.return_flight_arrival_description),
        asString(row.return_flight_duration),
        asNumber(row.return_flight_stops) ?? 0,
        toLabel,
        fromLabel,
      )
    : null;

  return {
    id: "",
    priceLabel: priceText || money(priceNumber),
    priceNumber,
    outbound,
    inbound,
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
        : "Não foi possível consultar os voos.";
    const error = new Error(message);
    throw error;
  }

  return Array.isArray(payload) ? payload : [];
}

async function searchLeg(fromCode: string, toCode: string, date: string, query: FlightQuery) {
  const fromCodes = resolveAirportCodes(fromCode);
  const toCodes = resolveAirportCodes(toCode);
  if (!fromCodes.length || !toCodes.length) {
    throw new Error("invalid_airport");
  }

  const passengers = passengersOf(query);
  const pairs = fromCodes.flatMap((from) => toCodes.map((to) => [from, to] as const)).slice(0, 4);
  const batches = await Promise.all(
    pairs.map(async ([from, to]) => {
      const rows = await postFlights("/api/google_flights/oneway/v1", {
        from_airport: from,
        to_airport: to,
        departure_date: date,
        currency: "brl",
        seat_type: 1,
        passengers,
        limit: 12,
        sort_type: "Overall",
      });
      return rows
        .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
        .map((row) => normalizeRow(row, false))
        .filter((row): row is FlightOffer => Boolean(row));
    }),
  );

  const seen = new Set<string>();
  return batches
    .flat()
    .sort((a, b) => a.priceNumber - b.priceNumber || a.outbound.departTime.localeCompare(b.outbound.departTime))
    .filter((offer) => {
      const key = `${offer.outbound.airline}|${offer.priceNumber}|${offer.outbound.departTime}|${offer.outbound.arriveTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

export async function searchGoogleFlights(query: FlightQuery) {
  if (query.tripType === "ida_volta" && query.returnDate) {
    const [outbound, inbound] = await Promise.all([
      searchLeg(query.fromCode, query.toCode, query.departureDate, query),
      searchLeg(query.toCode, query.fromCode, query.returnDate, query),
    ]);
    return {
      outbound: outbound.map((offer, index) => ({ ...offer, id: `ida-${index + 1}` })),
      inbound: inbound.map((offer, index) => ({ ...offer, id: `volta-${index + 1}` })),
    };
  }

  const outbound = await searchLeg(query.fromCode, query.toCode, query.departureDate, query);
  return {
    outbound: outbound.map((offer, index) => ({ ...offer, id: `ida-${index + 1}` })),
    inbound: [] as FlightOffer[],
  };
}
