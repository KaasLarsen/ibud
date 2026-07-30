import type { Page } from "playwright";
import { getModelById } from "../quotes/catalog";
import { partnerDeepLink } from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

/**
 * Green.dk model pages: /pages/saelg-iphone-{model}
 */
async function fetchGreenQuote(
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("green", request);

  await page.goto(deepLink, { waitUntil: "domcontentloaded", timeout: 30_000 });

  for (const label of ["Accepter", "Acceptér", "Tillad alle", "OK"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") });
    if (await btn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.first().click().catch(() => undefined);
      break;
    }
  }

  if (model) {
    // Try selecting model by visible name
    const modelEl = page.getByText(model.name, { exact: false }).first();
    if (await modelEl.isVisible({ timeout: 4000 }).catch(() => false)) {
      await modelEl.click().catch(() => undefined);
    }

    // Storage
    const storageLabel =
      request.storageGb >= 1024
        ? `${request.storageGb / 1024} TB`
        : `${request.storageGb} GB`;
    const storageEl = page.getByText(storageLabel, { exact: true }).first();
    if (await storageEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      await storageEl.click().catch(() => undefined);
    }
  }

  // Condition mapping
  await selectCondition(page, request);

  // Look for quote / estimate in page
  for (let i = 0; i < 6; i++) {
    const amount = await readAmount(page);
    if (amount !== null) {
      return baseResult("green", deepLink, {
        amountDkk: amount,
        rawNotes: "Estimat fra Green sælg-flow",
      });
    }

    const next = page.getByRole("button", {
      name: /næste|fortsæt|beregn|se pris|få tilbud/i,
    });
    if (await next.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await next.first().click().catch(() => undefined);
    }
    await page.waitForTimeout(700);
  }

  const amount = await readAmount(page);
  if (amount !== null) {
    return baseResult("green", deepLink, {
      amountDkk: amount,
      rawNotes: "Estimat fra Green sælg-flow",
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
    if (await damaged.isVisible({ timeout: 1500 }).catch(() => false)) {
      await damaged.click().catch(() => undefined);
      return;
    }
  }

  if (condition.cosmetic === "fine" && condition.battery === "ok") {
    const good = page
      .getByText(/som ny|perfekt|flot|god stand|uden ridser/i)
      .first();
    if (await good.isVisible({ timeout: 1500 }).catch(() => false)) {
      await good.click().catch(() => undefined);
      return;
    }
  }

  if (condition.cosmetic === "scratches") {
    const mid = page.getByText(/ridser|brugsspor|okay|acceptabel/i).first();
    if (await mid.isVisible({ timeout: 1500 }).catch(() => false)) {
      await mid.click().catch(() => undefined);
    }
  }
}

async function readAmount(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/pris|tilbud|værdi|estimat|du får|udbetaling/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 100) return amount;
      }
    }
  }
  return null;
}

export const greenAdapter: PartnerAdapter = {
  id: "green",
  fetchQuote: fetchGreenQuote,
};
