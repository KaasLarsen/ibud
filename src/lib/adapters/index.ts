import type { Browser } from "playwright";
import { greenAdapter } from "./green";
import { greenmindAdapter } from "./greenmind";
import { swappieAdapter } from "./swappie";
import { createSellPageAdapter } from "./sell-page";
import type { PartnerAdapter } from "./types";
import { ADAPTER_TIMEOUT_MS, isScrapingEnabled, PARTNER_IDS } from "../quotes/catalog";
import type { PartnerId, QuoteRequest, QuoteResult } from "../quotes/types";
import { partnerDeepLink } from "../quotes/deep-links";
import { estimateQuote } from "../quotes/estimate";
import {
  isMockMode,
  isServerlessRuntime,
  SCRAPER_USER_AGENT,
  shouldUseEstimatedQuotes,
} from "./scraper-config";
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

/** Estimater når live scrape ikke er muligt (serverless/mock). */
export function mockQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
): QuoteResult {
  return estimateQuote(partnerId, request);
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
  if (isServerlessRuntime()) {
    throw new Error(
      "Playwright kan ikke køre på Vercel — brug WORKER_URL eller SCRAPER_MODE=mock",
    );
  }

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
 * Hent bud: estimat på serverless/mock, ellers live scrape (worker-proces).
 * Returnerer altid priser — aldrig tomme fejlbud til brugeren.
 */
export async function fetchAllQuotes(
  request: QuoteRequest,
): Promise<QuoteResult[]> {
  if (shouldUseEstimatedQuotes() || isMockMode()) {
    return PARTNER_IDS.map((id) => mockQuote(id, request));
  }

  try {
    const live = await fetchAllQuotesLive(request);

    return PARTNER_IDS.map((id) => {
      const liveHit = live.find((q) => q.partnerId === id);
      if (liveHit?.amountDkk != null) return liveHit;
      // Fallback så UI aldrig viser "pris ikke tilgængelig"
      return mockQuote(id, request);
    });
  } catch (err) {
    console.error("Live scrape failed:", err);
    return PARTNER_IDS.map((id) => mockQuote(id, request));
  }
}
