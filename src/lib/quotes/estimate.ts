import { PARTNERS } from "./catalog";
import type { PartnerId, QuoteRequest, QuoteResult } from "./types";
import { partnerDeepLink } from "./deep-links";

function baseAmountForModel(modelId: string): number {
  const table: Record<string, number> = {
    "iphone-se-2020": 500,
    "iphone-se-2022": 900,
    "iphone-x": 400,
    "iphone-xr": 550,
    "iphone-xs": 650,
    "iphone-xs-max": 750,
    "iphone-11": 1100,
    "iphone-11-pro": 1400,
    "iphone-11-pro-max": 1600,
    "iphone-12-mini": 1000,
    "iphone-12": 1300,
    "iphone-12-pro": 1700,
    "iphone-12-pro-max": 1900,
    "iphone-13-mini": 1700,
    "iphone-13": 2100,
    "iphone-13-pro": 2700,
    "iphone-13-pro-max": 2900,
    "iphone-14": 3300,
    "iphone-14-plus": 3500,
    "iphone-14-pro": 4300,
    "iphone-14-pro-max": 4600,
    "iphone-15": 4900,
    "iphone-15-plus": 5100,
    "iphone-15-pro": 6300,
    "iphone-15-pro-max": 6900,
    "iphone-16e": 5500,
    "iphone-16": 7300,
    "iphone-16-plus": 7700,
    "iphone-16-pro": 8900,
    "iphone-16-pro-max": 9600,
    "iphone-17": 9800,
    "iphone-17-air": 10500,
    "iphone-17-pro": 11800,
    "iphone-17-pro-max": 12800,
  };
  return table[modelId] ?? 1500;
}

const variance: Record<PartnerId, number> = {
  green: 1.02,
  swappie: 0.97,
  greenmind: 1.0,
  phonehero: 1.04,
  phonetrade: 0.99,
  miphone: 1.01,
};

/** Estimeret bud — bruges når live scrape ikke er tilgængelig. */
export function estimateQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
): QuoteResult {
  let amount = baseAmountForModel(request.modelId);
  amount += Math.round((request.storageGb - 128) * 1.2);

  const { condition } = request;
  if (!condition.worksNormally) amount = Math.round(amount * 0.35);
  else if (!condition.screenIntact) amount = Math.round(amount * 0.55);
  else if (condition.cosmetic === "scratches") amount = Math.round(amount * 0.88);
  else if (condition.cosmetic === "damaged") amount = Math.round(amount * 0.65);
  if (condition.battery === "poor") amount = Math.round(amount * 0.9);

  amount = Math.round((amount * variance[partnerId]) / 50) * 50;

  return {
    partnerId,
    amountDkk: amount,
    currency: "DKK",
    deepLink: partnerDeepLink(partnerId, request),
    fetchedAt: new Date().toISOString(),
  };
}

export function estimateDeepLinkFallback(partnerId: PartnerId): string {
  return PARTNERS[partnerId].sellBaseUrl;
}
