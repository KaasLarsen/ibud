/**
 * Partner-Ads tracking for Green.dk.
 * Template: https://www.partner-ads.com/dk/c/p/{partnerId}/b/{bannerId}/PRODUKTLINK
 * Provision: 8% of purchases (not trade-in leads).
 */

const DEFAULT_TRACKING_PREFIX =
  "https://www.partner-ads.com/dk/c/p/57214/b/109463/";

function trackingPrefix(): string {
  const fromEnv = process.env.GREEN_PARTNER_ADS_PREFIX?.trim();
  if (fromEnv) {
    return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
  }
  return DEFAULT_TRACKING_PREFIX;
}

/** Wrap a Green destination URL so Partner-Ads attributes the click. */
export function applyGreenTracking(destinationUrl: string): string {
  const dest = destinationUrl.trim();
  if (!dest) return trackingPrefix();

  // Avoid double-wrapping if already a Partner-Ads click URL
  if (dest.includes("partner-ads.com")) return dest;

  return `${trackingPrefix()}${dest}`;
}
