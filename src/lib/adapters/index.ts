import type { Browser } from "playwright";
import { greenAdapter } from "./green";
import { greenmindAdapter } from "./greenmind";
import { swappieAdapter } from "./swappie";
import { createSellPageAdapter } from "./sell-page";
import type { PartnerAdapter } from "./types";
import { ADAPTER_TIMEOUT_MS, isScrapingEnabled, PARTNER_IDS } from "../quotes/catalog";
import type { PartnerId, QuoteRequest, QuoteResult } from "../quotes/types";
import { partnerDeepLink } from "../quotes/deep-links";
import { isMockMode, SCRAPER_USER_AGENT } from "./scraper-config";
import { baseResult } from "./types";

export const adapters: Record<PartnerId, PartnerAdapter> = {
  green: greenAdapter,
  swappie: swappieAdapter,
  greenmind: greenmindAdapter,
  phonehero: createSellPageAdapter({
    id: "phonehero",
    label: "PhoneHero",
  }),
  phonetrade: createSellPageAdapter({
    id: "phonetrade",
    label: "Phonetrade",
  }),
  miphone: createSellPageAdapter({
    id: "miphone",
    label: "MiPhone",
  }),
};

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

/** Kun til lokal udvikling (SCRAPER_MODE=mock). Aldrig syntetiske priser i production. */
export function mockQuote(
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

  const variance: Record<PartnerId, number> = {
    green: 1.02,
    swappie: 0.97,
    greenmind: 1.0,
    phonehero: 1.04,
    phonetrade: 0.99,
    miphone: 1.01,
  };
  amount = Math.round((amount * variance[partnerId]) / 50) * 50;

  return baseResult(partnerId, partnerDeepLink(partnerId, request), {
    amountDkk: amount,
    rawNotes: "Dev-estimat (SCRAPER_MODE=mock)",
  });
}

export function unavailableQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
  error?: string,
): QuoteResult {
  return baseResult(partnerId, partnerDeepLink(partnerId, request), {
    error: error ?? "Bud kunne ikke hentes lige nu",
  });
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timeout efter ${ms}ms (${label})`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchPartnerQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
  browser: Browser,
): Promise<QuoteResult> {
  if (!isScrapingEnabled(partnerId)) {
    return unavailableQuote(
      partnerId,
      request,
      "Automatisk budhentning er deaktiveret for denne partner",
    );
  }

  const adapter = adapters[partnerId];
  const context = await browser.newContext({
    locale: "da-DK",
    userAgent: SCRAPER_USER_AGENT,
  });
  const page = await context.newPage();

  try {
    return await withTimeout(
      adapter.fetchQuote(request, page),
      ADAPTER_TIMEOUT_MS,
      partnerId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukendt fejl";
    return unavailableQuote(partnerId, request, message);
  } finally {
    await context.close().catch(() => undefined);
  }
}

export async function fetchAllQuotesLive(
  request: QuoteRequest,
): Promise<QuoteResult[]> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    return await Promise.all(
      PARTNER_IDS.map((id) => fetchPartnerQuote(id, request, browser)),
    );
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/**
 * Live scrape i production. Viser kun faktiske bud — ingen syntetiske fallback-priser.
 * SCRAPER_MODE=mock er kun til lokal udvikling.
 */
export async function fetchAllQuotes(
  request: QuoteRequest,
): Promise<QuoteResult[]> {
  if (isMockMode()) {
    return PARTNER_IDS.map((id) => mockQuote(id, request));
  }

  try {
    const live = await fetchAllQuotesLive(request);

    return PARTNER_IDS.map((id) => {
      const liveHit = live.find((q) => q.partnerId === id);
      if (liveHit?.amountDkk != null) return liveHit;
      return unavailableQuote(id, request, liveHit?.error);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukendt fejl";
    console.error("Live scrape failed:", err);
    return PARTNER_IDS.map((id) => unavailableQuote(id, request, message));
  }
}
