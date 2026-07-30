import type { Page } from "playwright";
import { getModelById } from "../quotes/catalog";
import { partnerDeepLink } from "../quotes/deep-links";
import type { PartnerId, QuoteRequest, QuoteResult } from "../quotes/types";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

type SellPageConfig = {
  id: PartnerId;
  label: string;
};

/**
 * Generic best-effort scrape for Danish sell/valuation pages:
 * open model deep link → pick storage/condition → read kr-amount.
 */
export function createSellPageAdapter(config: SellPageConfig): PartnerAdapter {
  return {
    id: config.id,
    fetchQuote: async (request, page) =>
      fetchSellPageQuote(config, request, page),
  };
}

async function fetchSellPageQuote(
  config: SellPageConfig,
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink(config.id, request);

  await page.goto(deepLink, { waitUntil: "domcontentloaded", timeout: 30_000 });

  for (const label of ["Accepter", "Acceptér", "Tillad alle", "OK", "Accept"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") });
    if (await btn.first().isVisible({ timeout: 1200 }).catch(() => false)) {
      await btn.first().click().catch(() => undefined);
      break;
    }
  }

  if (model) {
    await clickText(page, model.name);
    const storageLabel =
      request.storageGb >= 1024
        ? `${request.storageGb / 1024} TB`
        : `${request.storageGb} GB`;
    await clickText(page, storageLabel, true);
  }

  await applyCondition(page, request);

  for (let i = 0; i < 7; i++) {
    const amount = await readAmount(page);
    if (amount !== null) {
      return baseResult(config.id, deepLink, {
        amountDkk: amount,
        rawNotes: `Estimat fra ${config.label}`,
      });
    }

    const next = page.getByRole("button", {
      name: /næste|fortsæt|beregn|se pris|få tilbud|estimer|videre/i,
    });
    if (await next.first().isVisible({ timeout: 900 }).catch(() => false)) {
      await next.first().click().catch(() => undefined);
    }
    await page.waitForTimeout(650);
  }

  const amount = await readAmount(page);
  if (amount !== null) {
    return baseResult(config.id, deepLink, {
      amountDkk: amount,
      rawNotes: `Estimat fra ${config.label}`,
    });
  }

  return baseResult(config.id, deepLink, {
    error: `Kunne ikke læse ${config.label}-estimat`,
  });
}

async function clickText(page: Page, text: string, exact = false) {
  const el = page.getByText(text, { exact }).first();
  if (await el.isVisible({ timeout: 2500 }).catch(() => false)) {
    await el.click().catch(() => undefined);
  }
}

async function applyCondition(page: Page, request: QuoteRequest) {
  const { condition } = request;

  if (!condition.worksNormally || !condition.screenIntact) {
    await clickFirstMatch(page, [/defekt/i, /skadet/i, /revnet/i, /dårlig/i]);
    return;
  }

  if (condition.cosmetic === "fine" && condition.battery === "ok") {
    await clickFirstMatch(page, [
      /som ny/i,
      /perfekt/i,
      /flot/i,
      /god stand/i,
      /uden ridser/i,
    ]);
    return;
  }

  if (condition.cosmetic === "scratches") {
    await clickFirstMatch(page, [/ridser/i, /brugsspor/i, /okay/i, /acceptabel/i]);
  }

  if (condition.battery === "poor") {
    await clickFirstMatch(page, [/batteri/i, /under 85/i, /dårligt batteri/i]);
  }
}

async function clickFirstMatch(page: Page, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const el = page.getByText(pattern).first();
    if (await el.isVisible({ timeout: 700 }).catch(() => false)) {
      await el.click().catch(() => undefined);
      return;
    }
  }
}

async function readAmount(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/pris|tilbud|værdi|estimat|du får|udbetaling|vi betaler|bud/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 100) return amount;
      }
    }
  }
  return null;
}
