import { getModelById } from "../../quotes/catalog";
import { partnerDeepLink } from "../../quotes/deep-links";
import type { PartnerId, QuoteRequest, QuoteResult } from "../../quotes/types";
import { baseResult, parseDkkAmount } from "../types";

/**
 * Green + Phonetrade bruger samme Reusely buyback-widget (offentlig tenant-id i sidekilden).
 * Priser hentes via HTTP — ingen browser / Cloudflare.
 */
const REUSELY_TENANT_ID =
  "83fbc99b940e6cac1313ca148f8aa89aab9e772d19017aac3fa847d9371afe17";
const REUSELY_BASE = "https://api-eu.reusely.com/api/v2/widget";

type ReuselyCondition = {
  name: string;
  id: number;
  price: string;
  sort: number;
};

type ReuselyModelPayload = {
  type?: string;
  product?: { product_name?: string; description?: string };
  options?: {
    conditions?: { choices?: ReuselyCondition[] };
  };
};

function modelSlug(modelId: string): string {
  return modelId; // catalog ids matcher Reusely (iphone-15, iphone-15-pro, …)
}

function pickConditionName(request: QuoteRequest): string {
  const { condition } = request;
  if (!condition.worksNormally || !condition.screenIntact) {
    return "Defekt";
  }
  if (condition.cosmetic === "damaged") {
    return "Slidt";
  }
  if (condition.cosmetic === "scratches" || condition.battery === "poor") {
    return "Brugt";
  }
  // Fin stand + OK batteri → Perfekt (Helt ny kræver typisk ubrugt/forseglet)
  return "Perfekt";
}

function parseReuselyPrice(raw: string): number | null {
  // Reusely sender "1.656" (tusindtalsseparator) eller "97"
  return parseDkkAmount(raw);
}

async function fetchReuselyConditions(
  slug: string,
): Promise<ReuselyCondition[]> {
  const url = `${REUSELY_BASE}/catalog/model-device/apple/${encodeURIComponent(slug)}?is_paginate=1&page=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Origin: "https://green.dk",
      Referer: "https://green.dk/",
      "x-tenant-id": REUSELY_TENANT_ID,
      "User-Agent":
        "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Reusely HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    status_code?: number;
    result?: ReuselyModelPayload;
  };
  const choices = data.result?.options?.conditions?.choices;
  if (!choices?.length) {
    throw new Error("Reusely returnerede ingen stand-priser");
  }
  return choices;
}

export async function fetchReuselyQuote(
  partnerId: "green" | "phonetrade",
  request: QuoteRequest,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink(partnerId, request);
  if (!model) {
    return baseResult(partnerId, deepLink, { error: "Ukendt model" });
  }

  try {
    const conditions = await fetchReuselyConditions(modelSlug(model.id));
    const wanted = pickConditionName(request);
    const match =
      conditions.find(
        (c) => c.name.toLowerCase() === wanted.toLowerCase(),
      ) ??
      conditions.find((c) =>
        c.name.toLowerCase().includes(wanted.toLowerCase()),
      );

    if (!match) {
      return baseResult(partnerId, deepLink, {
        error: `Ingen Reusely-pris for stand "${wanted}"`,
      });
    }

    const amount = parseReuselyPrice(match.price);
    if (amount == null || amount < 1) {
      return baseResult(partnerId, deepLink, {
        error: `Ugyldig Reusely-pris (${match.price})`,
      });
    }

    return baseResult(partnerId, deepLink, {
      amountDkk: amount,
      rawNotes: `Reusely API · stand ${match.name}`,
    });
  } catch (err) {
    return baseResult(partnerId, deepLink, {
      error: err instanceof Error ? err.message : "Reusely-fejl",
    });
  }
}

export function isReuselyPartner(
  partnerId: PartnerId,
): partnerId is "green" | "phonetrade" {
  return partnerId === "green" || partnerId === "phonetrade";
}
