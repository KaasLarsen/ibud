import type { Page } from "playwright";
import { getModelById } from "../quotes/catalog";
import { partnerDeepLink } from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

/**
 * GreenMind online estimate at /saelg-din-enhed.
 */
async function fetchGreenmindQuote(
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("greenmind", request);

  await page.goto(deepLink, { waitUntil: "domcontentloaded", timeout: 30_000 });

  for (const label of ["Accepter", "Acceptér", "Tillad alle", "OK"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") });
    if (await btn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.first().click().catch(() => undefined);
      break;
    }
  }

  if (model) {
    const modelEl = page.getByText(model.name, { exact: false }).first();
    if (await modelEl.isVisible({ timeout: 4000 }).catch(() => false)) {
      await modelEl.click().catch(() => undefined);
    }

    const storageLabel =
      request.storageGb >= 1024
        ? `${request.storageGb / 1024} TB`
        : `${request.storageGb} GB`;
    const storageEl = page.getByText(storageLabel, { exact: true }).first();
    if (await storageEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      await storageEl.click().catch(() => undefined);
    }
  }

  // Condition grade
  const grade =
    !request.condition.worksNormally || !request.condition.screenIntact
      ? /defekt|skadet|dårlig/i
      : request.condition.cosmetic === "fine"
        ? /som ny|perfekt|meget flot|god/i
        : /okay|brugsspor|ridser/i;

  const gradeEl = page.getByText(grade).first();
  if (await gradeEl.isVisible({ timeout: 2500 }).catch(() => false)) {
    await gradeEl.click().catch(() => undefined);
  }

  for (let i = 0; i < 6; i++) {
    const amount = await readAmount(page);
    if (amount !== null) {
      return baseResult("greenmind", deepLink, {
        amountDkk: amount,
        rawNotes: "Vejledende estimat — endelig pris i butik",
      });
    }

    const next = page.getByRole("button", {
      name: /næste|fortsæt|beregn|se pris|estimer/i,
    });
    if (await next.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await next.first().click().catch(() => undefined);
    }
    await page.waitForTimeout(700);
  }

  const amount = await readAmount(page);
  if (amount !== null) {
    return baseResult("greenmind", deepLink, {
      amountDkk: amount,
      rawNotes: "Vejledende estimat — endelig pris i butik",
    });
  }

  return baseResult("greenmind", deepLink, {
    error: "Kunne ikke læse GreenMind-estimat",
  });
}

async function readAmount(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  const lines = body.split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (/pris|tilbud|værdi|estimat|du får|vejledende/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 100) return amount;
      }
    }
  }
  return null;
}

export const greenmindAdapter: PartnerAdapter = {
  id: "greenmind",
  fetchQuote: fetchGreenmindQuote,
};
