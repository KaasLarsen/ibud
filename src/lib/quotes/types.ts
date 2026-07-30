export type CosmeticCondition = "fine" | "scratches" | "damaged";
export type BatteryCondition = "ok" | "poor";

export type NormalizedCondition = {
  worksNormally: boolean;
  screenIntact: boolean;
  cosmetic: CosmeticCondition;
  battery: BatteryCondition;
};

export type QuoteRequest = {
  modelId: string;
  storageGb: number;
  condition: NormalizedCondition;
};

export type PartnerId =
  | "green"
  | "swappie"
  | "greenmind"
  | "phonehero"
  | "phonetrade"
  | "miphone";

export type QuoteResult = {
  partnerId: PartnerId;
  amountDkk: number | null;
  currency: "DKK";
  deepLink: string;
  fetchedAt: string;
  cached?: boolean;
  error?: string;
  rawNotes?: string;
};

export type QuoteResponse = {
  request: QuoteRequest;
  quotes: QuoteResult[];
  winner: QuoteResult | null;
  fetchedAt: string;
};

export type IphoneModel = {
  id: string;
  name: string;
  storageOptions: number[];
  /** Slug used on Swappie sell URLs */
  swappieSlug: string;
};
