import { NextResponse } from "next/server";
import {
  fetchPartnerQuoteLive,
  mockQuote,
  unavailableQuote,
} from "@/lib/adapters";
import {
  hasWorker,
  isMockMode,
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
    body: JSON.stringify({ ...request, partnerId }),
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

export async function POST(req: Request) {
  const rate = checkRateLimit(`quotes-partner:${clientIp(req)}`, 120);
  if (!rate.allowed) {
    try {
      const body = await req.json();
      const partnerId = (body as { partnerId?: string }).partnerId as
        | PartnerId
        | undefined;
      const parsed = quoteRequestSchema.safeParse(body);
      if (partnerId && PARTNER_IDS.includes(partnerId) && parsed.success) {
        return NextResponse.json(
          unavailableQuote(
            partnerId,
            parsed.data,
            "For mange forespørgsler — prøv igen om lidt",
          ),
        );
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
    return NextResponse.json({
      ...cached,
      deepLink: partnerDeepLink(partnerId, request),
      cached: true,
    });
  }

  // Eksplicit mock — kun lokal UI-udvikling
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
    const quote = mockQuote(partnerId, request);
    await setCachedQuote(partnerId, request, quote);
    return NextResponse.json(quote);
  }

  // Remote Playwright worker hvis konfigureret
  if (hasWorker()) {
    try {
      const fromWorker = await fetchPartnerViaWorker(partnerId, request);
      if (fromWorker?.amountDkk != null) {
        await setCachedQuote(partnerId, request, fromWorker);
        return NextResponse.json(fromWorker);
      }
      const failed =
        fromWorker ??
        unavailableQuote(partnerId, request, "Worker returnerede ingen pris");
      return NextResponse.json(failed);
    } catch (err) {
      console.error("Partner worker error:", err);
      return NextResponse.json(
        unavailableQuote(
          partnerId,
          request,
          err instanceof Error ? err.message : "Worker fejl",
        ),
      );
    }
  }

  // Live scrape i-processen (lokal Playwright eller Vercel + @sparticuz/chromium)
  try {
    const live = await fetchPartnerQuoteLive(partnerId, request);
    if (live.amountDkk != null) {
      await setCachedQuote(partnerId, request, live);
    }
    return NextResponse.json(live);
  } catch (err) {
    console.error("Live scrape error:", err);
    return NextResponse.json(
      unavailableQuote(
        partnerId,
        request,
        err instanceof Error ? err.message : "Scrape fejl",
      ),
    );
  }
}
