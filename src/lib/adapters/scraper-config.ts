/** Identificerbar bot UA — kontakt i user-agent strengen. */
export const SCRAPER_USER_AGENT =
  "iBudBot/1.0 (+https://ibud.dk; info@ibud.dk) Playwright";

export function isMockMode(): boolean {
  return process.env.SCRAPER_MODE === "mock";
}
