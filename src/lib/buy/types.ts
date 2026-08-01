export type BuyListing = {
  id: string;
  modelName: string;
  modelKey: string;
  storageLabel: string;
  storageGb: number;
  color: string;
  priceFromDkk: number;
  imageUrl: string;
  affiliateUrl: string;
  deliveryDays: string;
  shippingDkk: number;
  variantCount: number;
  partnerLabel: string;
};

export type BuyCatalogSnapshot = {
  listings: BuyListing[];
  fetchedAt: string;
  source: "green";
};
