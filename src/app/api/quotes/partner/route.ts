import { NextResponse } from "next/server";
import { chromium } from "playwright";
import {
  adapters,
  mockQuote,
  unavailableQuote,
} from "@/lib/adapters";
import { isMockMode, SCRAPER_USER_AGENT } from "@/lib/adapters/scraper-config";
import { checkRateLimit, clientIp } from "@/lib/api/rate-limit";
import { getCachedQuote, setCachedQuote } from "@/lib/quotes/cache";
import {
  ADAPTER_TIMEOUT_MS,
  getModelById,
  isScrapingEnabled,
  PARTNER_IDS,
} from "@/lib/quotes/catalog";
import { partnerDeepLink } from "@/lib/quotes/deep-links";
import { quoteRequestSchema } from "@/lib/quotes/schema";
import type { PartnerId, QuoteResult } from "@/lib/quotes/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const rate = checkRateLimit(`quotes-partner:${clientIp(req)}`, 60);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "For mange forespørgsler — prøv igen om lidt" },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldigt JSON" }, { status: 400 });
  }

  const raw = body as { partnerId?: string };
  const partnerId = raw.partnerId as PartnerId | undefined;
  if (!partnerId || !PARTNER_IDS.includes(partnerId)) {
    return NextResponse.json({ error: "Ukendt partner" }, { status: 400 });
  }

  const requestParsed = quoteRequestSchema.safeParse(body);
  if (!requestParsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørgsel" }, { status: 400 });
  }

  const request = requestParsed.data;
  const model = getModelById(request.modelId);
  if (!model || !model.storageOptions.includes(request.storageGb)) {
    return NextResponse.json({ error: "Ukendt model/lager" }, { status: 400 });
  }

  const cached = await getCachedQuote(partnerId, request);
  if (cached?.amountDkk != null) {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
    return NextResponse.json({
      ...cached,
      deepLink: partnerDeepLink(partnerId, request),
      cached: true,
    });
  }

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 2200 + Math.random() * 2000));
    const quote = mockQuote(partnerId, request);
    await setCachedQuote(partnerId, request, quote);
    return NextResponse.json(quote);
  }

  if (!isScrapingEnabled(partnerId)) {
    const quote = unavailableQuote(
      partnerId,
      request,
      "Automatisk budhentning er deaktiveret for denne partner",
    );
    return NextResponse.json(quote);
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const context = await browser.newContext({
      locale: "da-DK",
      userAgent: SCRAPER_USER_AGENT,
    });
    const page = await context.newPage();

    let result: QuoteResult;
    try {
      result = await Promise.race([
        adapters[partnerId].fetchQuote(request, page),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout (${partnerId})`)),
            ADAPTER_TIMEOUT_MS,
          ),
        ),
      ]);
      if (result.amountDkk == null) {
        result = unavailableQuote(
          partnerId,
          request,
          result.error ?? "Live bud kunne ikke læses",
        );
      } else {
        result = {
          ...result,
          deepLink: partnerDeepLink(partnerId, request),
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ukendt fejl";
      result = unavailableQuote(partnerId, request, message);
    } finally {
      await context.close().catch(() => undefined);
    }

    await setCachedQuote(partnerId, request, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(unavailableQuote(partnerId, request));
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
