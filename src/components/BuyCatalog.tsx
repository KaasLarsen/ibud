"use client";

import { useEffect, useMemo, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import type { BuyListing } from "@/lib/buy/types";
import { formatDkk, formatFetchedAt } from "@/lib/quotes/format";

type SortKey = "price-asc" | "price-desc" | "model";

const PAGE_SIZE = 24;

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "da"),
  );
}

function trackBuyClick(listing: BuyListing) {
  try {
    sendGAEvent("event", "buy_outbound_click", {
      partner: "green",
      product_id: listing.id,
      model: listing.modelName,
      storage: listing.storageLabel,
      value: listing.priceFromDkk,
      currency: "DKK",
    });
  } catch {
    // Analytics må ikke blokere klik
  }
}

export function BuyCatalog({
  listings,
  fetchedAt,
}: {
  listings: BuyListing[];
  fetchedAt: string;
}) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const models = useMemo(
    () => uniqueSorted(listings.map((l) => l.modelKey)),
    [listings],
  );
  const storages = useMemo(() => {
    const byGb = new Map<number, string>();
    for (const l of listings) {
      if (l.storageGb > 0) byGb.set(l.storageGb, l.storageLabel);
    }
    return [...byGb.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, label]) => label);
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = listings.filter((l) => {
      if (model && l.modelKey !== model) return false;
      if (storage && l.storageLabel !== storage) return false;
      if (!q) return true;
      const hay = `${l.modelName} ${l.storageLabel} ${l.color}`.toLowerCase();
      return hay.includes(q);
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "price-asc") return a.priceFromDkk - b.priceFromDkk;
      if (sort === "price-desc") return b.priceFromDkk - a.priceFromDkk;
      const modelCmp = a.modelName.localeCompare(b.modelName, "da");
      if (modelCmp !== 0) return modelCmp;
      return a.priceFromDkk - b.priceFromDkk;
    });

    return rows;
  }, [listings, model, query, sort, storage]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, model, storage, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="buy-catalog">
      <div className="buy-toolbar">
        <label className="buy-search">
          <span className="sr-only">Søg model</span>
          <input
            type="search"
            className="buy-search-input"
            placeholder="Søg model, lager eller farve…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>

        <div className="buy-filters">
          <label>
            <span className="buy-filter-label">Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="buy-select"
            >
              <option value="">Alle modeller</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="buy-filter-label">Lager</span>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="buy-select"
            >
              <option value="">Alle</option>
              {storages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="buy-filter-label">Sortér</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="buy-select"
            >
              <option value="price-asc">Pris: lav → høj</option>
              <option value="price-desc">Pris: høj → lav</option>
              <option value="model">Model</option>
            </select>
          </label>
        </div>
      </div>

      <p className="buy-meta muted">
        Viser {visible.length} af {filtered.length} telefon
        {filtered.length === 1 ? "" : "er"} hos Green
        {fetchedAt ? ` · ${formatFetchedAt(fetchedAt)}` : null}
      </p>

      {filtered.length === 0 ? (
        <p className="buy-empty">
          Ingen telefoner matcher filtrene. Prøv en anden model eller ryd søgningen.
        </p>
      ) : (
        <>
          <ul className="buy-grid">
            {visible.map((listing) => (
              <li key={listing.id}>
                <a
                  className="buy-item"
                  href={listing.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => trackBuyClick(listing)}
                >
                  <div className="buy-item-media">
                    {listing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.imageUrl}
                        alt=""
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="buy-item-placeholder" aria-hidden />
                    )}
                  </div>
                  <div className="buy-item-body">
                    <p className="buy-item-partner">{listing.partnerLabel}</p>
                    <h2 className="buy-item-title">{listing.modelName}</h2>
                    <p className="buy-item-specs">
                      {listing.storageLabel}
                      {listing.color !== "—" ? ` · ${listing.color}` : null}
                    </p>
                    <p className="buy-item-price">
                      {listing.variantCount > 1 ? "Fra " : null}
                      {formatDkk(listing.priceFromDkk)}
                    </p>
                    {listing.deliveryDays ? (
                      <p className="buy-item-ship muted">
                        Levering {listing.deliveryDays} dage
                        {listing.shippingDkk > 0
                          ? ` · fragt ${formatDkk(listing.shippingDkk)}`
                          : null}
                      </p>
                    ) : null}
                    <span className="buy-item-cta">Se hos Green →</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="buy-more">
              <button
                type="button"
                className="cta buy-more-btn"
                onClick={() =>
                  setVisibleCount((n) =>
                    Math.min(n + PAGE_SIZE, filtered.length),
                  )
                }
              >
                Vis flere
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
