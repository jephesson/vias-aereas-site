type AirportFile = {
  airports: [string, string, string, string][];
  cities: [string, string, string, string[]][];
};

export type Place = {
  code: string;
  name: string;
  city: string;
  country: string;
  kind: "airport" | "city";
  covers: string[];
  label: string;
  search: string;
};

let cache: Place[] | null = null;

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function joinCodes(codes: string[]) {
  if (codes.length <= 1) return codes[0] ?? "";
  if (codes.length === 2) return `${codes[0]} e ${codes[1]}`;
  return `${codes.slice(0, -1).join(", ")} e ${codes[codes.length - 1]}`;
}

export function placeLabel(place: Pick<Place, "kind" | "code" | "name" | "city" | "covers">) {
  if (place.kind === "city") {
    return `${place.code} — ${place.city} (${joinCodes(place.covers)})`;
  }
  const where = [place.name, place.city].filter(Boolean).join(", ");
  return `${place.code} — ${where}`;
}

export async function loadPlaces() {
  if (cache) return cache;
  const loaded = await import("./airports.json");
  const data = (loaded.default ?? loaded) as AirportFile;
  const byCode = new Map(data.airports.map((row) => [row[0], row]));

  const airports: Place[] = data.airports.map(([code, name, city, country]) => {
    const place: Place = {
      code,
      name,
      city,
      country,
      kind: "airport",
      covers: [],
      label: "",
      search: "",
    };
    place.label = placeLabel(place);
    place.search = norm(`${code} ${name} ${city} ${country}`);
    return place;
  });

  const cities: Place[] = data.cities.map(([code, city, country, covers]) => {
    const names = covers
      .map((item) => byCode.get(item)?.[1])
      .filter((item): item is string => Boolean(item));
    const place: Place = {
      code,
      name: city,
      city,
      country,
      kind: "city",
      covers,
      label: "",
      search: "",
    };
    place.label = placeLabel(place);
    place.search = norm(`${code} ${city} ${country} ${covers.join(" ")} ${names.join(" ")}`);
    return place;
  });

  cache = [...cities, ...airports];
  return cache;
}

export function searchPlaces(places: Place[], query: string, limit = 8) {
  const q = norm(query);
  if (q.length < 2) return [];

  const exact: Place[] = [];
  const covered: Place[] = [];
  const codePrefix: Place[] = [];
  const cityPrefix: Place[] = [];
  const includes: Place[] = [];

  for (const place of places) {
    const code = place.code.toLowerCase();
    if (code === q) {
      exact.push(place);
      continue;
    }
    if (place.kind === "city" && place.covers.some((item) => item.toLowerCase() === q)) {
      covered.push(place);
      continue;
    }
    if (code.startsWith(q)) {
      codePrefix.push(place);
      continue;
    }
    if (norm(place.city).startsWith(q) || norm(place.name).startsWith(q)) {
      cityPrefix.push(place);
      continue;
    }
    if (place.search.includes(q)) includes.push(place);
  }

  cityPrefix.sort((a, b) => Number(b.kind === "city") - Number(a.kind === "city"));

  const ranked = [...exact, ...covered, ...codePrefix, ...cityPrefix, ...includes];
  const seen = new Set<string>();
  const out: Place[] = [];

  for (const place of ranked) {
    const key = `${place.kind}:${place.code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);

    if (place.kind === "city") {
      for (const code of place.covers) {
        const airport = places.find((item) => item.kind === "airport" && item.code === code);
        const airportKey = `airport:${code}`;
        if (!airport || seen.has(airportKey)) continue;
        seen.add(airportKey);
        out.push(airport);
      }
    }

    if (out.length >= limit) break;
  }

  return out.slice(0, limit);
}
