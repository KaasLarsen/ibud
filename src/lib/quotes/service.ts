import {
  fetchAllQuotes,
  mockQuote,
  unavailableQuote,
} from "../adapters";
import { isMockMode } from "../adapters/scraper-config";
import { getCachedQuote, logQuoteRun, setCachedQuote } from "./cache";
import { PARTNER_IDS } from "./catalog";
import { partnerDeepLink } from "./deep-links";
import type {
  PartnerId,
  QuoteRequest,
  QuoteResponse,
  QuoteResult,
} from "./types";
import { pickWinner, requestFingerprint } from "./utils";

async function fetchViaWorker(
  request: QuoteRequest,
): Promise<QuoteResult[] | null> {
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
  return data.quotes;
}

export async function getQuotes(
  request: QuoteRequest,
): Promise<QuoteResponse> {
  const cached: QuoteResult[] = [];
  const missing: PartnerId[] = [];

  for (const partnerId of PARTNER_IDS) {
    const hit = await getCachedQuote(partnerId, request);
    if (hit?.amountDkk != null) cached.push(hit);
    else missing.push(partnerId);
  }

  let fresh: QuoteResult[] = [];

  if (missing.length > 0) {
    try {
      const fromWorker = await fetchViaWorker(request);
      if (fromWorker) {
        fresh = fromWorker.map((q) => ({
          ...q,
          deepLink: partnerDeepLink(q.partnerId, request),
        }));
      } else {
        const all = await fetchAllQuotes(request);
        fresh = all.filter((q) => missing.includes(q.partnerId));
      }
    } catch (err) {
      console.error("Quote fetch failed:", err);
      fresh = missing.map((partnerId) =>
        isMockMode()
          ? mockQuote(partnerId, request)
          : unavailableQuote(
              partnerId,
              request,
              err instanceof Error ? err.message : "Kunne ikke hente bud",
            ),
      );
    }

    await Promise.all(
      fresh
        .filter((result) => result.amountDkk != null)
        .map((result) => setCachedQuote(result.partnerId, request, result)),
    );
  }

  const byPartner = new Map<string, QuoteResult>();
  for (const q of [...cached, ...fresh]) {
    byPartner.set(q.partnerId, {
      ...q,
      deepLink: partnerDeepLink(q.partnerId, request),
    });
  }

  const quotes = PARTNER_IDS.map(
    (id) =>
      byPartner.get(id) ??
      (isMockMode()
        ? mockQuote(id, request)
        : unavailableQuote(id, request, "Bud ikke tilgængeligt")),
  );

  const winner = pickWinner(quotes);
  const fingerprint = requestFingerprint(request);

  await logQuoteRun(request, quotes, winner?.partnerId ?? null, fingerprint);

  return {
    request,
    quotes,
    winner,
    fetchedAt: new Date().toISOString(),
  };
}
