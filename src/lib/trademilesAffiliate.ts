type TradeMilesReferralResponse = {
  ok?: boolean;
  data?: {
    affiliate?: {
      id?: string;
      name?: string;
    };
    links?: {
      flightSales?: string;
      pointsPurchase?: string;
    };
  };
};

export type ResolvedAffiliate = {
  id: string;
  name: string;
  links: {
    flightSales: string;
    pointsPurchase: string;
  };
};

const TRADEMILES_REFERRAL_ENDPOINT =
  "https://tradmiles-final.vercel.app/api/afiliado/referral";

export async function resolveTradeMilesAffiliate(
  ref: string
): Promise<ResolvedAffiliate | null> {
  const normalizedRef = ref.trim();
  if (!normalizedRef) return null;

  try {
    const response = await fetch(
      `${TRADEMILES_REFERRAL_ENDPOINT}?ref=${encodeURIComponent(normalizedRef)}`,
      { method: "GET" }
    );

    if (response.status === 404) return null;
    if (!response.ok) return null;

    const body = (await response.json()) as TradeMilesReferralResponse;
    if (!body?.ok) return null;

    const affiliateId = body.data?.affiliate?.id?.trim();
    if (!affiliateId) return null;

    return {
      id: affiliateId,
      name: body.data?.affiliate?.name?.trim() ?? "",
      links: {
        flightSales: body.data?.links?.flightSales?.trim() ?? "",
        pointsPurchase: body.data?.links?.pointsPurchase?.trim() ?? "",
      },
    };
  } catch {
    return null;
  }
}
