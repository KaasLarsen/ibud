import type { Browser } from "playwright-core";
import "./playwright-trace";
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
} from "./scraper-config";
import { BROWSER_USER_AGENT } from "./browser-helpers";
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

/** Kun til lokal UI-udvikling med SCRAPER_MODE=mock — aldrig i production. */
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
    userAgent: BROWSER_USER_AGENT,
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

/**
 * Launch Chromium:
 * - Vercel/serverless: @sparticuz/chromium + playwright-core
 * - Local/worker: full Playwright
 */
async function launchBrowser(): Promise<Browser> {
  if (isServerlessRuntime()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: playwrightChromium } = await import("playwright-core");

    const executablePath = await chromium.executablePath();
    // Lambda/Vercel needs shared libs next to the binary
    if (executablePath) {
      const libDir = executablePath.replace(/\/[^/]+$/, "");
      process.env.LD_LIBRARY_PATH = [
        libDir,
        process.env.LD_LIBRARY_PATH,
      ]
        .filter(Boolean)
        .join(":");
    }

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

/** Live scrape af én partner (lokal, worker eller Vercel serverless). */
export async function fetchPartnerQuoteLive(
  partnerId: PartnerId,
  request: QuoteRequest,
): Promise<QuoteResult> {
  if (isMockMode()) {
    return mockQuote(partnerId, request);
  }

  const browser = await launchBrowser();
  try {
    return await fetchPartnerQuote(partnerId, request, browser);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export async function fetchAllQuotesLive(
  request: QuoteRequest,
): Promise<QuoteResult[]> {
  const browser = await launchBrowser();

  try {
    // På serverless: sekventielt for at holde hukommelse nede
    if (isServerlessRuntime()) {
      const out: QuoteResult[] = [];
      for (const id of PARTNER_IDS) {
        out.push(await fetchPartnerQuote(id, request, browser));
      }
      return out;
    }

    return await Promise.all(
      PARTNER_IDS.map((id) => fetchPartnerQuote(id, request, browser)),
    );
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/**
 * Hent bud fra partnernes sælg-flows.
 * Mock-priser kun når SCRAPER_MODE=mock. Ellers aldrig syntetiske priser.
 */
export async function fetchAllQuotes(
  request: QuoteRequest,
): Promise<QuoteResult[]> {
  if (isMockMode()) {
    return PARTNER_IDS.map((id) => mockQuote(id, request));
  }

  return fetchAllQuotesLive(request);
}
