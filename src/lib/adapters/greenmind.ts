import type { Page } from "playwright-core";
import { getModelById } from "../quotes/catalog";
import { partnerDeepLink } from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { dismissCookieBanner } from "./browser-helpers";
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

  await page.goto(deepLink, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await dismissCookieBanner(page);

  const start = page.getByRole("button", {
    name: /start|tjek værdi|beregn|sælg|få pris|estimer/i,
  });
  if (await start.first().isVisible({ timeout: 2_500 }).catch(() => false)) {
    await start.first().click().catch(() => undefined);
    await page.waitForTimeout(600);
  }

  if (model) {
    for (const label of ["iPhone", "Smartphone", "Mobil"]) {
      const el = page.getByText(label, { exact: true }).first();
      if (await el.isVisible({ timeout: 1_200 }).catch(() => false)) {
        await el.click().catch(() => undefined);
        await page.waitForTimeout(400);
        break;
      }
    }

    const modelEl = page.getByText(model.name, { exact: false }).first();
    if (await modelEl.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await modelEl.click().catch(() => undefined);
      await page.waitForTimeout(400);
    }

    const storageLabels = [
      `${request.storageGb} GB`,
      `${request.storageGb}GB`,
    ];
    for (const label of storageLabels) {
      const storageEl = page.getByText(label, { exact: true }).first();
      if (await storageEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await storageEl.click().catch(() => undefined);
        break;
      }
    }
  }

  const grade =
    !request.condition.worksNormally || !request.condition.screenIntact
      ? /defekt|skadet|dårlig/i
      : request.condition.cosmetic === "fine"
        ? /som ny|perfekt|meget flot|god/i
        : /okay|brugsspor|ridser/i;

  const gradeEl = page.getByText(grade).first();
  if (await gradeEl.isVisible({ timeout: 2_500 }).catch(() => false)) {
    await gradeEl.click().catch(() => undefined);
  }

  for (let i = 0; i < 8; i++) {
    const amount = await readAmount(page);
    if (amount !== null) {
      return baseResult("greenmind", deepLink, {
        amountDkk: amount,
        rawNotes: "Vejledende live-estimat — endelig pris i butik",
      });
    }

    const next = page.getByRole("button", {
      name: /næste|fortsæt|beregn|se pris|estimer|videre/i,
    });
    if (await next.first().isVisible({ timeout: 1_000 }).catch(() => false)) {
      await next.first().click().catch(() => undefined);
    }
    await page.waitForTimeout(700);
  }

  const amount = await readAmount(page);
  if (amount !== null) {
    return baseResult("greenmind", deepLink, {
      amountDkk: amount,
      rawNotes: "Vejledende live-estimat — endelig pris i butik",
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
    if (/pris|tilbud|værdi|estimat|du får|vejledende|vi betaler/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const amount = parseDkkAmount(lines[j]);
        if (amount && amount >= 500) return amount;
      }
    }
  }
  return null;
}

export const greenmindAdapter: PartnerAdapter = {
  id: "greenmind",
  fetchQuote: fetchGreenmindQuote,
};
