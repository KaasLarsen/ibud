import type { Page } from "playwright-core";
import { getModelById } from "../quotes/catalog";
import {
  partnerDeepLink,
  partnerDestinationUrl,
} from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { dismissCookieBanner } from "./browser-helpers";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

/**
 * Green.dk model pages: /pages/saelg-iphone-{model}
 */
async function fetchGreenQuote(
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const scrapeUrl = partnerDestinationUrl("green", request);
  const deepLink = partnerDeepLink("green", request);

  await page.goto(scrapeUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await dismissCookieBanner(page);
  await page.waitForTimeout(800);

  if (model) {
    const modelEl = page.getByText(model.name, { exact: false }).first();
    if (await modelEl.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await modelEl.click().catch(() => undefined);
    }

    const storageLabels = [
      request.storageGb >= 1024
        ? `${request.storageGb / 1024} TB`
        : `${request.storageGb} GB`,
      request.storageGb >= 1024
        ? `${request.storageGb / 1024}TB`
        : `${request.storageGb}GB`,
    ];
    for (const label of storageLabels) {
      const storageEl = page.getByText(label, { exact: true }).first();
      if (await storageEl.isVisible({ timeout: 1_500 }).catch(() => false)) {
        await storageEl.click().catch(() => undefined);
        break;
      }
    }
  }

  await selectCondition(page, request);

  for (let i = 0; i < 8; i++) {
    const amount = await readAmount(page);
    if (amount !== null) {
      return baseResult("green", deepLink, {
        amountDkk: amount,
        rawNotes: "Live estimat fra Green sælg-flow",
      });
    }

    const next = page.getByRole("button", {
      name: /næste|fortsæt|beregn|se pris|få tilbud/i,
    });
    if (await next.first().isVisible({ timeout: 1_000 }).catch(() => false)) {
      await next.first().click().catch(() => undefined);
    }
    await page.waitForTimeout(700);
  }

  const amount = await readAmount(page);
  if (amount !== null) {
    return baseResult("green", deepLink, {
      amountDkk: amount,
      rawNotes: "Live estimat fra Green sælg-flow",
    });
  }

  return baseResult("green", deepLink, {
    error: "Kunne ikke læse Green-estimat",
  });
}

async function selectCondition(page: Page, request: QuoteRequest) {
  const { condition } = request;

  if (!condition.worksNormally || !condition.screenIntact) {
    const damaged = page.getByText(/defekt|skadet|revnet|dårlig/i).first();
    if (await damaged.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await damaged.click().catch(() => undefined);
      return;
    }
  }

  if (condition.cosmetic === "fine" && condition.battery === "ok") {
    const good = page
      .getByText(/som ny|perfekt|flot|god stand|uden ridser/i)
      .first();
    if (await good.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await good.click().catch(() => undefined);
      return;
    }
  }

  if (condition.cosmetic === "scratches") {
    const mid = page.getByText(/ridser|brugsspor|okay|acceptabel/i).first();
    if (await mid.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await mid.click().catch(() => undefined);
    }
  }
}

async function readAmount(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/pris|tilbud|værdi|estimat|du får|udbetaling|vi betaler/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 500) return amount;
      }
    }
  }

  // Fallback: largest plausible DKK amount on page (buyback range)
  let best: number | null = null;
  for (const line of lines) {
    if (!/kr|DKK|\d{1,3}[.\s]\d{3}/i.test(line)) continue;
    const amount = parseDkkAmount(line);
    if (amount && amount >= 500 && amount <= 50_000) {
      if (best === null || amount > best) best = amount;
    }
  }
  return best;
}

export const greenAdapter: PartnerAdapter = {
  id: "green",
  fetchQuote: fetchGreenQuote,
};
