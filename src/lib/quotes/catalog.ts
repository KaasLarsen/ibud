import type { IphoneModel, PartnerId } from "./types";

function m(
  id: string,
  name: string,
  storageOptions: number[],
  swappieSlug?: string,
): IphoneModel {
  return {
    id,
    name,
    storageOptions,
    swappieSlug: swappieSlug ?? id,
  };
}

/** Alle iPhone-modeller vi understøtter (kun iPhone). */
export const IPHONE_MODELS: IphoneModel[] = [
  // SE
  m("iphone-se-2020", "iPhone SE (2020)", [64, 128, 256], "iphone-se-2020"),
  m("iphone-se-2022", "iPhone SE (2022)", [64, 128, 256], "iphone-se-3"),
  // X-generationen
  m("iphone-x", "iPhone X", [64, 256]),
  m("iphone-xr", "iPhone XR", [64, 128, 256]),
  m("iphone-xs", "iPhone XS", [64, 256, 512]),
  m("iphone-xs-max", "iPhone XS Max", [64, 256, 512]),
  // 11
  m("iphone-11", "iPhone 11", [64, 128, 256]),
  m("iphone-11-pro", "iPhone 11 Pro", [64, 256, 512]),
  m("iphone-11-pro-max", "iPhone 11 Pro Max", [64, 256, 512]),
  // 12
  m("iphone-12-mini", "iPhone 12 mini", [64, 128, 256]),
  m("iphone-12", "iPhone 12", [64, 128, 256]),
  m("iphone-12-pro", "iPhone 12 Pro", [128, 256, 512]),
  m("iphone-12-pro-max", "iPhone 12 Pro Max", [128, 256, 512]),
  // 13
  m("iphone-13-mini", "iPhone 13 mini", [128, 256, 512]),
  m("iphone-13", "iPhone 13", [128, 256, 512]),
  m("iphone-13-pro", "iPhone 13 Pro", [128, 256, 512, 1024]),
  m("iphone-13-pro-max", "iPhone 13 Pro Max", [128, 256, 512, 1024]),
  // 14
  m("iphone-14", "iPhone 14", [128, 256, 512]),
  m("iphone-14-plus", "iPhone 14 Plus", [128, 256, 512]),
  m("iphone-14-pro", "iPhone 14 Pro", [128, 256, 512, 1024]),
  m("iphone-14-pro-max", "iPhone 14 Pro Max", [128, 256, 512, 1024]),
  // 15
  m("iphone-15", "iPhone 15", [128, 256, 512]),
  m("iphone-15-plus", "iPhone 15 Plus", [128, 256, 512]),
  m("iphone-15-pro", "iPhone 15 Pro", [128, 256, 512, 1024]),
  m("iphone-15-pro-max", "iPhone 15 Pro Max", [256, 512, 1024]),
  // 16
  m("iphone-16e", "iPhone 16e", [128, 256, 512]),
  m("iphone-16", "iPhone 16", [128, 256, 512]),
  m("iphone-16-plus", "iPhone 16 Plus", [128, 256, 512]),
  m("iphone-16-pro", "iPhone 16 Pro", [128, 256, 512, 1024]),
  m("iphone-16-pro-max", "iPhone 16 Pro Max", [256, 512, 1024]),
  // 17
  m("iphone-17", "iPhone 17", [128, 256, 512]),
  m("iphone-17-air", "iPhone 17 Air", [256, 512, 1024]),
  m("iphone-17-pro", "iPhone 17 Pro", [256, 512, 1024]),
  m("iphone-17-pro-max", "iPhone 17 Pro Max", [256, 512, 1024]),
];

export const POPULAR_MODELS = [
  "iphone-16",
  "iphone-16-pro",
  "iphone-15",
  "iphone-15-pro",
  "iphone-14",
  "iphone-13",
];

export function getModelById(id: string): IphoneModel | undefined {
  return IPHONE_MODELS.find((m) => m.id === id);
}

export function searchModels(query: string, limit = 8): IphoneModel[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const q = raw
    .replace(/iphone/g, " ")
    .replace(/pro\s*max/g, "promax")
    .replace(/\s+/g, " ")
    .trim();

  const scored = IPHONE_MODELS.map((model) => {
    const name = model.name.toLowerCase();
    const compact = name.replace(/\s+/g, "").replace("promax", "promax");
    const hay = `${name} ${compact} ${model.id}`;
    let score = 0;

    if (name === raw || compact === raw.replace(/\s/g, "")) score += 100;
    if (name.startsWith(raw) || name.includes(`iphone ${q}`)) score += 50;
    if (hay.includes(q.replace(/\s/g, ""))) score += 30;
    if (q.split(" ").every((part) => part && hay.includes(part))) score += 20;
    if (model.id.includes(q.replace(/\s/g, "-"))) score += 15;

    // Number boost: "14" → prefer 14 over 14 Pro unless pro typed
    const num = q.match(/\d{1,2}/)?.[0];
    if (num && name.includes(num)) score += 10;
    if (q.includes("pro") && name.includes("pro")) score += 12;
    if (q.includes("max") && name.includes("max")) score += 12;
    if (q.includes("mini") && name.includes("mini")) score += 12;
    if (q.includes("plus") && name.includes("plus")) score += 12;
    if (q.includes("air") && name.includes("air")) score += 12;
    if (q.includes("se") && name.includes("se")) score += 12;

    return { model, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.model.name.localeCompare(b.model.name));

  return scored.slice(0, limit).map((x) => x.model);
}

/** Scraping policy efter robots.txt / ToS-gennemgang (se docs/legal/partner-tos-review.md). */
export type ScrapingPolicy = "allowed" | "caution" | "disabled";

export type PartnerMeta = {
  id: PartnerId;
  name: string;
  notes: string;
  sellBaseUrl: string;
  /** Path under /public for partner mark */
  logoSrc: string;
  /** Background behind transparent logos */
  logoBg: string;
  /** How the mark should sit in the chip */
  logoFit: "cover" | "contain";
  scrapingPolicy: ScrapingPolicy;
};

export const PARTNERS: Record<PartnerId, PartnerMeta> = {
  green: {
    id: "green",
    name: "Green",
    notes: "Dansk butik · gratis fragt · Partner-Ads",
    sellBaseUrl: "https://green.dk/pages/saelg-iphone",
    logoSrc: "/partners/green.png",
    logoBg: "#1d4943",
    logoFit: "cover",
    scrapingPolicy: "caution",
  },
  swappie: {
    id: "swappie",
    name: "Swappie",
    notes: "Gratis forsendelse · pris låses 14 dage",
    sellBaseUrl: "https://swappie.com/dk/saelg/iphone/",
    logoSrc: "/partners/swappie.png",
    logoBg: "#ffccf2",
    logoFit: "cover",
    scrapingPolicy: "allowed",
  },
  greenmind: {
    id: "greenmind",
    name: "GreenMind",
    notes: "18 butikker i DK · vurdering i butik",
    sellBaseUrl: "https://greenmind.dk/saelg-din-enhed",
    logoSrc: "/partners/greenmind.png",
    logoBg: "#0a0a0a",
    logoFit: "contain",
    scrapingPolicy: "allowed",
  },
  phonehero: {
    id: "phonehero",
    name: "PhoneHero",
    notes: "Online vurdering · gratis forsendelse",
    sellBaseUrl: "https://phonehero.dk/saelg-din-gamle-mobil-til-os",
    logoSrc: "/partners/phonehero.svg",
    logoBg: "#ffffff",
    logoFit: "cover",
    scrapingPolicy: "caution",
  },
  phonetrade: {
    id: "phonetrade",
    name: "Phonetrade",
    notes: "København · online eller butik",
    sellBaseUrl: "https://phonetrade.dk/pages/saelg-iphone",
    logoSrc: "/partners/phonetrade.svg",
    logoBg: "#ffffff",
    logoFit: "contain",
    scrapingPolicy: "caution",
  },
  miphone: {
    id: "miphone",
    name: "MiPhone",
    notes: "Apple-fokus · hurtig udbetaling",
    sellBaseUrl: "https://miphone.dk/saelg/saelg-din-iphone/",
    logoSrc: "/partners/miphone.png",
    logoBg: "#0b1a12",
    logoFit: "contain",
    scrapingPolicy: "allowed",
  },
};

export function isScrapingEnabled(partnerId: PartnerId): boolean {
  return PARTNERS[partnerId].scrapingPolicy !== "disabled";
}

export const PARTNER_IDS = Object.keys(PARTNERS) as PartnerId[];

export const CACHE_TTL_HOURS = 8;
export const ADAPTER_TIMEOUT_MS = 45_000;
