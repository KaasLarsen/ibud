import type { Page } from "playwright-core";
import { getModelById } from "../quotes/catalog";
import {
  partnerDeepLink,
  partnerDestinationUrl,
} from "../quotes/deep-links";
import type { QuoteRequest, QuoteResult } from "../quotes/types";
import { dismissCookieBanner, domClickButton } from "./browser-helpers";
import { baseResult, parseDkkAmount, type PartnerAdapter } from "./types";

/**
 * Swappie sell flow: /dk/saelg/iphone/{slug}/ → memory → …
 * Pris: "Estimeret værdi: 2 841 kr"
 */
async function fetchSwappieQuote(
  request: QuoteRequest,
  page: Page,
): Promise<QuoteResult> {
  const model = getModelById(request.modelId);
  const deepLink = partnerDeepLink("swappie", request);
  const scrapeUrl = partnerDestinationUrl("swappie", request);

  if (!model) {
    return baseResult("swappie", deepLink, { error: "Ukendt model" });
  }

  await page.goto(scrapeUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(1_500);
  await dismissCookieBanner(page);
  await page.waitForTimeout(1_500);

  if (!(await waitForContinueEnabled(page, 30_000))) {
    return baseResult("swappie", deepLink, {
      error: "Swappie-flow blev ikke klar",
    });
  }

  await clickContinue(page);
  await page.waitForURL(/\/memory\//, { timeout: 10_000 }).catch(() => undefined);

  const storageLabel =
    request.storageGb >= 1024
      ? `${request.storageGb / 1024}TB`
      : `${request.storageGb}GB`;

  const selected = await page.evaluate((label) => {
    const input = Array.from(
      document.querySelectorAll('input[type="radio"]'),
    ).find(
      (el) => (el as HTMLInputElement).value.toLowerCase() === label.toLowerCase(),
    ) as HTMLInputElement | undefined;
    if (!input) return false;
    input.click();
    const lab = Array.from(document.querySelectorAll("label")).find(
      (l) => l.textContent?.trim().toLowerCase() === label.toLowerCase(),
    );
    lab?.click();
    return input.checked;
  }, storageLabel);

  if (!selected) {
    return baseResult("swappie", deepLink, {
      error: `Kunne ikke vælge lager ${storageLabel}`,
    });
  }

  // Pris dukker op lige efter lager-valg
  let lastAmount: number | null = null;
  for (let i = 0; i < 15; i++) {
    lastAmount = await readEstimate(page);
    if (lastAmount !== null) break;
    await page.waitForTimeout(400);
  }

  if (lastAmount === null) {
    return baseResult("swappie", deepLink, {
      error: `Kunne ikke læse Swappie-estimat (${page.url()})`,
    });
  }

  // Forsøg at justere for batteri/stand — behold seneste pris hvis det fejler
  if (await clickContinue(page)) {
    for (let i = 0; i < 6; i++) {
      await answerCurrentStep(page, request);
      if (!(await waitForContinueEnabled(page, 5_000))) break;
      const amount = await readEstimate(page);
      if (amount !== null) lastAmount = amount;
      if (!(await clickContinue(page))) break;
    }
  }

  return baseResult("swappie", deepLink, {
    amountDkk: lastAmount,
    rawNotes: "Live estimat fra Swappie sælg-flow",
  });
}

async function waitForContinueEnabled(page: Page, timeoutMs: number) {
  const btn = page.getByRole("button", { name: /fortsæt/i }).first();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const visible = await btn.isVisible().catch(() => false);
    const disabled = await btn.isDisabled().catch(() => true);
    if (visible && !disabled) return true;
    await page.waitForTimeout(300);
  }
  return false;
}

async function clickContinue(page: Page): Promise<boolean> {
  if (await domClickButton(page, /fortsæt/)) {
    await page.waitForTimeout(700);
    return true;
  }
  const btn = page.getByRole("button", { name: /fortsæt/i }).first();
  if (!(await btn.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return false;
  }
  if (await btn.isDisabled().catch(() => true)) {
    return false;
  }
  await btn.click({ force: true }).catch(() => undefined);
  await page.waitForTimeout(700);
  return true;
}

async function answerCurrentStep(page: Page, request: QuoteRequest) {
  const { condition } = request;
  const heading = (
    (await page.locator("h1, h2, h3").first().innerText().catch(() => "")) || ""
  ).toLowerCase();

  if (/batteri/.test(heading)) {
    const unsure = page.getByRole("radio", { name: /ikke muligt/i });
    if (condition.battery === "ok") {
      const input = page.getByPlaceholder(/tal|kapacitet/i);
      const enter = page.getByRole("radio", { name: /indtast batteri/i });
      if (await enter.first().isVisible({ timeout: 600 }).catch(() => false)) {
        await enter.first().click({ force: true }).catch(() => undefined);
      }
      if (await input.first().isVisible({ timeout: 600 }).catch(() => false)) {
        await input.first().fill("92").catch(() => undefined);
        await page.waitForTimeout(200);
        if (
          !(await page
            .getByRole("button", { name: /fortsæt/i })
            .first()
            .isDisabled()
            .catch(() => true))
        ) {
          return;
        }
      }
    }
    if (await unsure.first().isVisible({ timeout: 800 }).catch(() => false)) {
      await unsure.first().click({ force: true }).catch(() => undefined);
    }
    return;
  }

  if (/skærm|revne|display/.test(heading)) {
    await clickYesNo(page, condition.screenIntact);
    return;
  }

  if (/fungerer|tænde|funktions/.test(heading)) {
    await clickYesNo(page, condition.worksNormally);
    return;
  }

  if (/stand|ridser|kosmetik|udseende/.test(heading)) {
    const patterns =
      condition.cosmetic === "fine"
        ? [/ingen ridser/i, /som ny/i, /perfekt/i, /god stand/i, /^ja$/i]
        : condition.cosmetic === "scratches"
          ? [/ridser/i, /brugsspor/i, /synlige/i]
          : [/skadet/i, /revner/i, /defekt/i];

    for (const pattern of patterns) {
      const el = page.getByRole("radio", { name: pattern }).or(page.getByText(pattern));
      if (await el.first().isVisible({ timeout: 400 }).catch(() => false)) {
        await el.first().click({ force: true }).catch(() => undefined);
        return;
      }
    }
  }

  await clickYesNo(page, condition.worksNormally && condition.screenIntact);
}

async function clickYesNo(page: Page, yes: boolean) {
  const pattern = yes ? /^(ja|yes)$/i : /^(nej|no)$/i;
  const el = page
    .getByRole("radio", { name: pattern })
    .or(page.getByRole("button", { name: pattern }));
  if (await el.first().isVisible({ timeout: 800 }).catch(() => false)) {
    await el.first().click({ force: true }).catch(() => undefined);
  }
}

async function readEstimate(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText().catch(() => "");
  const match = body.match(/Estimeret værdi[:\s]*([^\n]+)/i);
  if (match) {
    const amount = parseDkkAmount(match[1]);
    if (amount && amount >= 100) return amount;
  }
  return null;
}

export const swappieAdapter: PartnerAdapter = {
  id: "swappie",
  fetchQuote: fetchSwappieQuote,
};
