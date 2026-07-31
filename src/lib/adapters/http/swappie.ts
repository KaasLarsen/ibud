import { getModelById } from "../../quotes/catalog";
import { partnerDeepLink } from "../../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../../quotes/types";
import { baseResult } from "../types";

/**
 * Swappies offentlige sell-prices API.
 * Virker når Cloudflare ikke blokerer (typisk ikke fra Vercel-datacenter).
 */
type SwappiePriceRow = {
  model_name: string;
  visual_condition: string;
  functional_condition: string[];
  price: {
    price: number;
    currency: string;
    fixed_price?: number;
  };
};

function storageLabel(storageGb: number): string {
  if (storageGb >= 1024) return `${storageGb / 1024}TB`;
  return `${storageGb}GB`;
}

function visualCondition(request: QuoteRequest): string {
  const { condition } = request;
  if (condition.cosmetic === "damaged" || !condition.screenIntact) {
    return "HEAVILY_USED";
  }
  if (condition.cosmetic === "scratches" || condition.battery === "poor") {
    return "GOOD";
  }
  return "ALMOST_NEW";
}

export async function fetchSwappieHttpQuote(
  request: QuoteRequest,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("swappie", request);
  if (!model) {
    return baseResult("swappie", deepLink, { error: "Ukendt model" });
  }

  const storage = storageLabel(request.storageGb);
  const storages = encodeURIComponent(JSON.stringify([storage]));
  const modelName = encodeURIComponent(model.name);
  const url = `https://swappie.com/api/sell/api/v3/prices/?model_name=${modelName}&country=DK&storages=${storages}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Origin: "https://swappie.com",
        Referer: "https://swappie.com/dk/saelg/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const text = await res.text();
    if (!res.ok || /just a moment|cloudflare|cf-browser/i.test(text)) {
      return baseResult("swappie", deepLink, {
        error: "Swappie blokeret (Cloudflare)",
      });
    }

    const data = JSON.parse(text) as { results?: SwappiePriceRow[] };
    const rows = data.results ?? [];
    if (!rows.length) {
      return baseResult("swappie", deepLink, {
        error: "Swappie returnerede ingen priser",
      });
    }

    const wantVisual = visualCondition(request);
    const broken = !request.condition.worksNormally;
    const modelKey = `${model.name} ${storage}`.toLowerCase();

    const candidates = rows.filter((r) =>
      r.model_name.toLowerCase().includes(modelKey.split(" ")[0]!) &&
      r.model_name.toLowerCase().includes(storage.toLowerCase()),
    );

    const pool = candidates.length ? candidates : rows;

    const match =
      pool.find((r) => {
        const hasBroken = (r.functional_condition ?? []).includes("BROKEN");
        if (broken !== hasBroken) return false;
        return r.visual_condition === wantVisual;
      }) ??
      pool.find((r) => {
        const hasBroken = (r.functional_condition ?? []).includes("BROKEN");
        return broken === hasBroken;
      }) ??
      pool[0];

    if (!match) {
      return baseResult("swappie", deepLink, {
        error: "Ingen matchende Swappie-pris",
      });
    }

    const amount = Math.round(
      match.price.fixed_price ?? match.price.price ?? 0,
    );
    if (amount < 1) {
      return baseResult("swappie", deepLink, {
        error: "Ugyldig Swappie-pris",
      });
    }

    return baseResult("swappie", deepLink, {
      amountDkk: amount,
      rawNotes: `Swappie prices API · ${match.visual_condition}`,
    });
  } catch (err) {
    return baseResult("swappie", deepLink, {
      error: err instanceof Error ? err.message : "Swappie HTTP-fejl",
    });
  }
}
