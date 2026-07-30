"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getModelById, PARTNERS } from "@/lib/quotes/catalog";
import type { QuoteResponse, QuoteResult } from "@/lib/quotes/types";
import { formatDkk, formatFetchedAt, formatStorage } from "@/lib/quotes/format";
import { PartnerLogo } from "@/components/PartnerLogo";

function rankQuotes(quotes: QuoteResult[]): QuoteResult[] {
  return [...quotes].sort((a, b) => {
    const av = a.amountDkk ?? -1;
    const bv = b.amountDkk ?? -1;
    return bv - av;
  });
}

export function ResultView() {
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ibud-quote");
      if (!raw) {
        setMissing(true);
        return;
      }
      setData(JSON.parse(raw) as QuoteResponse);
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div className="result-shell">
        <p>Ingen resultat fundet.</p>
        <Link href="/" className="cta">
          Start forfra
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="result-shell">
        <p className="muted">Henter resultat…</p>
      </div>
    );
  }

  const model = getModelById(data.request.modelId);
  const ranked = rankQuotes(data.quotes);
  const best = ranked.find((q) => q.amountDkk != null) ?? null;
  const withPrice = ranked.filter((q) => q.amountDkk != null).length;

  return (
    <div className="result-shell">
      <p className="eyebrow">
        {model?.name ?? data.request.modelId} ·{" "}
        {formatStorage(data.request.storageGb)}
      </p>
      <h1 className="result-title">Bedste bud først</h1>
      <p className="muted result-lede">
        Rangeret efter hvor meget du får — højest øverst.
        {data.fetchedAt && (
          <span className="result-freshness">
            {" "}
            · {formatFetchedAt(data.fetchedAt)}
          </span>
        )}
      </p>

      {withPrice < ranked.length && (
        <p className="result-warning">
          {withPrice === 0
            ? "Vi kunne ikke hente live bud lige nu. Klik videre til hvert sted for at se deres pris."
            : "Nogle steder viste ikke et bud — klik videre for at tjekke prisen der."}
        </p>
      )}

      <ol className="offer-list">
        {ranked.map((q, index) => {
          const partner = PARTNERS[q.partnerId];
          const hasPrice = q.amountDkk != null;
          const isBest = best?.partnerId === q.partnerId && hasPrice;
          return (
            <li
              key={q.partnerId}
              className={`offer-card ${isBest ? "offer-best" : ""}`}
            >
              <div className="offer-rank" aria-hidden>
                {index + 1}
              </div>
              <PartnerLogo partnerId={q.partnerId} size={48} />
              <div className="offer-body">
                <div className="offer-top">
                  <strong>{partner.name}</strong>
                  {isBest && <span className="best-pill">Bedste bud</span>}
                </div>
                <p className="offer-notes">{partner.notes}</p>
                {q.cached && hasPrice && (
                  <p className="cache-note">Fra cache · {formatFetchedAt(q.fetchedAt)}</p>
                )}
                {!q.cached && hasPrice && q.fetchedAt && (
                  <p className="cache-note">{formatFetchedAt(q.fetchedAt)}</p>
                )}
              </div>
              <div className="offer-action">
                <p className={`offer-amount ${!hasPrice ? "offer-unavailable" : ""}`}>
                  {hasPrice ? formatDkk(q.amountDkk!) : "Pris ikke tilgængelig"}
                </p>
                <a
                  className={isBest ? "cta offer-cta" : "text-link"}
                  href={q.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hasPrice ? `Gå til ${partner.name}` : `Tjek pris på ${partner.name}`}
                </a>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="disclaimer">
        Bud hentes direkte fra de steder, du kan sælge til. Endelig pris aftales
        efter deres inspektion. iBud køber ikke selv din telefon.
      </p>

      <Link href="/" className="text-link">
        Søg en anden iPhone
      </Link>
    </div>
  );
}
