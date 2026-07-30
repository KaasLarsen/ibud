import { NextResponse } from "next/server";
import { mockQuote } from "@/lib/adapters";
import {
  hasWorker,
  isMockMode,
  shouldUseEstimatedQuotes,
} from "@/lib/adapters/scraper-config";
import { checkRateLimit, clientIp } from "@/lib/api/rate-limit";
import { getCachedQuote, setCachedQuote } from "@/lib/quotes/cache";
import {
  getModelById,
  PARTNER_IDS,
} from "@/lib/quotes/catalog";
import { partnerDeepLink } from "@/lib/quotes/deep-links";
import { quoteRequestSchema } from "@/lib/quotes/schema";
import type { PartnerId, QuoteResult } from "@/lib/quotes/types";

export const maxDuration = 60;

async function fetchPartnerViaWorker(
  partnerId: PartnerId,
  request: ReturnType<typeof quoteRequestSchema.parse>,
): Promise<QuoteResult | null> {
  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) return null;

  const secret = process.env.WORKER_SECRET;
  const res = await fetch(`${workerUrl.replace(/\/$/, "")}/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Worker fejl: ${res.status}`);
  }

  const data = (await res.json()) as { quotes: QuoteResult[] };
  const hit = data.quotes.find((q) => q.partnerId === partnerId);
  if (!hit) return null;

  return {
    ...hit,
    deepLink: partnerDeepLink(partnerId, request),
  };
}

function pricedQuote(
  partnerId: PartnerId,
  request: ReturnType<typeof quoteRequestSchema.parse>,
): QuoteResult {
  return mockQuote(partnerId, request);
}

export async function POST(req: Request) {
  const rate = checkRateLimit(`quotes-partner:${clientIp(req)}`, 120);
  if (!rate.allowed) {
    // Soft-fail: returnér stadig et bud, så UI aldrig crasher
    try {
      const body = await req.json();
      const partnerId = (body as { partnerId?: string }).partnerId as
        | PartnerId
        | undefined;
      const parsed = quoteRequestSchema.safeParse(body);
      if (partnerId && PARTNER_IDS.includes(partnerId) && parsed.success) {
        return NextResponse.json(pricedQuote(partnerId, parsed.data));
      }
    } catch {
      // fall through
    }
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

  // Playwright må aldrig køre på Vercel — kun mock eller remote worker
  if (shouldUseEstimatedQuotes() || isMockMode() || !hasWorker()) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1200));
    const quote = pricedQuote(partnerId, request);
    await setCachedQuote(partnerId, request, quote);
    return NextResponse.json(quote);
  }

  try {
    const fromWorker = await fetchPartnerViaWorker(partnerId, request);
    if (fromWorker?.amountDkk != null) {
      await setCachedQuote(partnerId, request, fromWorker);
      return NextResponse.json(fromWorker);
    }
  } catch (err) {
    console.error("Partner worker error:", err);
  }

  // Altid et bud — aldrig null-pris til brugeren
  const fallback = pricedQuote(partnerId, request);
  await setCachedQuote(partnerId, request, fallback);
  return NextResponse.json(fallback);
}
