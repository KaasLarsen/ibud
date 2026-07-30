import type { Page } from "playwright-core";

/** Best-effort cookie consent dismissal across Danish retail sites. */
export async function dismissCookieBanner(page: Page): Promise<void> {
  // Native DOM click — mere pålideligt end Playwright click bag OneTrust-filter
  const clicked = await page.evaluate(() => {
    const selectors = [
      "#onetrust-accept-btn-handler",
      "#accept-recommended-btn-handler",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el instanceof HTMLElement) {
        el.click();
        return sel;
      }
    }
    const buttons = Array.from(document.querySelectorAll("button"));
    const match = buttons.find((b) =>
      /accept all cookies|tillad alle|accepter alle/i.test(b.textContent || ""),
    );
    if (match) {
      match.click();
      return "labeled";
    }
    return null;
  });

  if (clicked) {
    await page
      .locator("#onetrust-banner-sdk, .onetrust-pc-dark-filter")
      .first()
      .waitFor({ state: "hidden", timeout: 8_000 })
      .catch(() => undefined);
    await page.waitForTimeout(400);
  }

  // Hvis filter stadig ligger ovenpå: skjul den uden at fjerne React-roots
  await page.evaluate(() => {
    const filter = document.querySelector(".onetrust-pc-dark-filter");
    if (filter instanceof HTMLElement) filter.style.display = "none";
    const banner = document.querySelector("#onetrust-banner-sdk");
    if (banner instanceof HTMLElement) banner.style.display = "none";
  });
}

/** Klik knap via DOM — undgår overlay-intercept. */
export async function domClickButton(
  page: Page,
  nameRe: RegExp,
): Promise<boolean> {
  return page.evaluate((source) => {
    const re = new RegExp(source, "i");
    const buttons = Array.from(document.querySelectorAll("button"));
    const match = buttons.find((b) => re.test((b.textContent || "").trim()));
    if (!match || match.disabled) return false;
    match.click();
    return true;
  }, nameRe.source);
}

/** Real Chrome UA — partner sites soft-block explicit bot strings. */
export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
