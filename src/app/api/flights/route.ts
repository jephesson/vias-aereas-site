import { NextResponse } from "next/server";
import { searchGoogleFlights, type FlightQuery } from "@/lib/googleFlights";

export const maxDuration = 60;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asCount(value: unknown, fallback: number, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(max, Math.round(number)));
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const tripType = body.tripType === "ida" ? "ida" : "ida_volta";
  const query: FlightQuery = {
    fromCode: asText(body.fromCode).toUpperCase(),
    toCode: asText(body.toCode).toUpperCase(),
    tripType,
    departureDate: asText(body.departureDate),
    returnDate: tripType === "ida_volta" ? asText(body.returnDate) : null,
    adults: Math.max(1, asCount(body.adults, 1, 9)),
    children: asCount(body.children, 0, 8),
    infants: asCount(body.infants, 0, 4),
    turnoIda: asText(body.turnoIda) || "Indiferente",
    turnoVolta: tripType === "ida_volta" ? asText(body.turnoVolta) || "Indiferente" : null,
  };

  if (!isDate(query.departureDate) || (query.returnDate && !isDate(query.returnDate))) {
    return NextResponse.json({ error: "Informe as datas da viagem." }, { status: 400 });
  }

  try {
    const offers = await searchGoogleFlights(query);
    return NextResponse.json({ offers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "missing_key") {
      return NextResponse.json(
        { error: "A consulta ao Google Flights ainda não está configurada." },
        { status: 503 },
      );
    }
    if (message === "invalid_airport") {
      return NextResponse.json(
        { error: "Escolha origem e destino na lista de aeroportos." },
        { status: 400 },
      );
    }
    if (message === "search_incomplete") {
      return NextResponse.json(
        { error: "O Google Flights não respondeu agora. Tente de novo em instantes." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível consultar o Google Flights." },
      { status: 502 },
    );
  }
}
