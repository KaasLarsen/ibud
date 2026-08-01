import type { BuyCatalogSnapshot, BuyListing } from "@/lib/buy/types";

/**
 * Partner-Ads product feed for Green.dk shop (refurbished / køb).
 * Salgspriser — ikke opkøbsbud. vareurl er allerede Partner-Ads-tracket.
 * @see docs/legal/green-partnership.md
 */
export const GREEN_PRODUCT_FEED_URL =
  "https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=57214&bannerid=109386&feedid=3564";

const FEED_REVALIDATE_SECONDS = 60 * 60; // 1 time

type RawProduct = {
  id: string;
  category: string;
  brand: string;
  name: string;
  priceDkk: number;
  stock: string;
  deliveryDays: string;
  shippingDkk: number;
  size: string;
  color: string;
  imageUrl: string;
  affiliateUrl: string;
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function tagValue(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(re);
  if (!match) return "";
  return decodeXmlEntities(match[1].trim());
}

function parseFeedXml(xml: string): RawProduct[] {
  const products: RawProduct[] = [];
  const chunks = xml.split(/<\/produkt>/i);

  for (const chunk of chunks) {
    const start = chunk.search(/<produkt>/i);
    if (start < 0) continue;
    const block = chunk.slice(start + "<produkt>".length);

    const priceRaw = tagValue(block, "nypris").replace(",", ".");
    const priceDkk = Number.parseFloat(priceRaw);
    if (!Number.isFinite(priceDkk) || priceDkk <= 0) continue;

    const shippingRaw = tagValue(block, "fragtomk").replace(",", ".");
    const shippingDkk = Number.parseFloat(shippingRaw);

    products.push({
      id: tagValue(block, "produktid"),
      category: tagValue(block, "kategorinavn"),
      brand: tagValue(block, "brand"),
      name: tagValue(block, "produktnavn"),
      priceDkk,
      stock: tagValue(block, "lagerantal"),
      deliveryDays: tagValue(block, "leveringstid"),
      shippingDkk: Number.isFinite(shippingDkk) ? shippingDkk : 0,
      size: tagValue(block, "size"),
      color: tagValue(block, "color"),
      imageUrl: tagValue(block, "billedurl"),
      affiliateUrl: tagValue(block, "vareurl"),
    });
  }

  return products;
}

function isIphoneProduct(product: RawProduct): boolean {
  const cat = product.category.toLowerCase();
  const name = product.name.toLowerCase();
  return cat.includes("iphone") || name.includes("iphone");
}

function isInStock(product: RawProduct): boolean {
  return product.stock.trim().toLowerCase() === "in stock";
}

/** "Brugt iPhone 16 Pro Max" → "iPhone 16 Pro Max" */
export function normalizeIphoneModelName(name: string): string {
  return name
    .replace(/^Brugt\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseStorageGb(size: string): number {
  const raw = size.trim().toUpperCase().replace(/\s+/g, "");
  if (!raw) return 0;
  const tb = raw.match(/^(\d+(?:\.\d+)?)\s*TB$/);
  if (tb) return Math.round(Number.parseFloat(tb[1]) * 1024);
  const gb = raw.match(/^(\d+(?:\.\d+)?)\s*GB$/);
  if (gb) return Math.round(Number.parseFloat(gb[1]));
  const bare = Number.parseInt(raw, 10);
  return Number.isFinite(bare) ? bare : 0;
}

export function formatBuyStorage(size: string, storageGb: number): string {
  if (storageGb >= 1024 && storageGb % 1024 === 0) {
    return `${storageGb / 1024} TB`;
  }
  if (storageGb > 0) return `${storageGb} GB`;
  return size.trim() || "—";
}

function listingKey(product: RawProduct, modelName: string): string {
  return [
    modelName.toLowerCase(),
    product.size.trim().toLowerCase(),
    product.color.trim().toLowerCase(),
  ].join("|");
}

function toListings(products: RawProduct[]): BuyListing[] {
  const groups = new Map<
    string,
    { product: RawProduct; modelName: string; count: number }
  >();

  for (const product of products) {
    if (!isIphoneProduct(product) || !isInStock(product)) continue;
    if (!product.affiliateUrl || !product.id) continue;

    const modelName = normalizeIphoneModelName(product.name);
    if (!modelName.toLowerCase().includes("iphone")) continue;

    const key = listingKey(product, modelName);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { product, modelName, count: 1 });
      continue;
    }
    existing.count += 1;
    if (product.priceDkk < existing.product.priceDkk) {
      existing.product = product;
    }
  }

  const listings: BuyListing[] = [];
  for (const { product, modelName, count } of groups.values()) {
    const storageGb = parseStorageGb(product.size);
    listings.push({
      id: product.id,
      modelName,
      modelKey: modelName,
      storageLabel: formatBuyStorage(product.size, storageGb),
      storageGb,
      color: product.color.trim() || "—",
      priceFromDkk: Math.round(product.priceDkk),
      imageUrl: product.imageUrl,
      affiliateUrl: product.affiliateUrl,
      deliveryDays: product.deliveryDays.trim(),
      shippingDkk: product.shippingDkk,
      variantCount: count,
      partnerLabel: "Green",
    });
  }

  listings.sort((a, b) => {
    const modelCmp = a.modelName.localeCompare(b.modelName, "da");
    if (modelCmp !== 0) return modelCmp;
    if (a.storageGb !== b.storageGb) return a.storageGb - b.storageGb;
    if (a.priceFromDkk !== b.priceFromDkk) return a.priceFromDkk - b.priceFromDkk;
    return a.color.localeCompare(b.color, "da");
  });

  return listings;
}

async function fetchFeedXml(): Promise<string> {
  const response = await fetch(GREEN_PRODUCT_FEED_URL, {
    next: { revalidate: FEED_REVALIDATE_SECONDS },
    headers: {
      Accept: "application/xml, text/xml, */*",
      "User-Agent": "iBud.dk buy-catalog/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Green feed HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  // Partner-Ads feed er deklareret som iso-8859-1
  return new TextDecoder("iso-8859-1").decode(buffer);
}

/** Hent iPhone-listings fra Green product feed (cached via Next fetch revalidate). */
export async function getGreenIphoneCatalog(): Promise<BuyCatalogSnapshot> {
  const xml = await fetchFeedXml();
  const listings = toListings(parseFeedXml(xml));
  return {
    listings,
    fetchedAt: new Date().toISOString(),
    source: "green",
  };
}
