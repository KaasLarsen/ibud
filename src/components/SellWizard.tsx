"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  getModelById,
  IPHONE_MODELS,
  PARTNER_IDS,
  PARTNERS,
  POPULAR_MODELS,
  searchModels,
} from "@/lib/quotes/catalog";
import type {
  NormalizedCondition,
  PartnerId,
  QuoteResponse,
  QuoteResult,
} from "@/lib/quotes/types";
import { formatDkk, formatStorage } from "@/lib/quotes/format";
import { pickWinner } from "@/lib/quotes/format";
import { PartnerLogo } from "@/components/PartnerLogo";

type Step = "model" | "storage" | "condition" | "loading";

type PartnerStatus = {
  partnerId: PartnerId;
  state: "waiting" | "loading" | "done";
  quote?: QuoteResult;
};

const defaultCondition: NormalizedCondition = {
  worksNormally: true,
  screenIntact: true,
  cosmetic: "fine",
  battery: "ok",
};

export function SellWizard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("model");
  const [query, setQuery] = useState("");
  const [modelId, setModelId] = useState<string | null>(null);
  const [storageGb, setStorageGb] = useState<number | null>(null);
  const [condition, setCondition] =
    useState<NormalizedCondition>(defaultCondition);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus[]>([]);

  const model = useMemo(
    () => (modelId ? getModelById(modelId) ?? null : null),
    [modelId],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return POPULAR_MODELS.map((id) => getModelById(id)!).filter(Boolean);
    }
    return searchModels(query, 8);
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, step]);

  useEffect(() => {
    if (step === "model") inputRef.current?.focus();
  }, [step]);

  function selectModel(id: string) {
    const selected = getModelById(id);
    if (!selected) return;
    setModelId(id);
    setQuery(selected.name);
    setStorageGb(null);
    setOpen(false);
    setStep("storage");
    setError(null);
  }

  function selectStorage(gb: number) {
    setStorageGb(gb);
    setStep("condition");
    setError(null);
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(suggestions.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter" && suggestions[highlight]) {
      e.preventDefault();
      selectModel(suggestions[highlight].id);
    }
    if (e.key === "Escape") setOpen(false);
  }

  function submit() {
    if (!modelId || !storageGb) return;
    setError(null);
    setStep("loading");
    setPartnerStatus(
      PARTNER_IDS.map((partnerId) => ({ partnerId, state: "waiting" })),
    );

    startTransition(async () => {
      const payload = { modelId, storageGb, condition };
      const quotes: QuoteResult[] = [];

      // One place at a time — takes real time, and avoids 6 browsere på én gang
      for (const partnerId of PARTNER_IDS) {
        setPartnerStatus((prev) =>
          prev.map((p) =>
            p.partnerId === partnerId ? { ...p, state: "loading" } : p,
          ),
        );

        try {
          const res = await fetch("/api/quotes/partner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, partnerId }),
          });
          const data = (await res.json()) as QuoteResult;
          if (!res.ok) throw new Error("fail");
          quotes.push(data);
          setPartnerStatus((prev) =>
            prev.map((p) =>
              p.partnerId === partnerId
                ? { ...p, state: "done", quote: data }
                : p,
            ),
          );
        } catch {
          const fallback: QuoteResult = {
            partnerId,
            amountDkk: null,
            currency: "DKK",
            deepLink: PARTNERS[partnerId].sellBaseUrl,
            fetchedAt: new Date().toISOString(),
            error: "Kunne ikke hentes",
          };
          quotes.push(fallback);
          setPartnerStatus((prev) =>
            prev.map((p) =>
              p.partnerId === partnerId
                ? { ...p, state: "done", quote: fallback }
                : p,
            ),
          );
        }
      }

      const response: QuoteResponse = {
        request: payload,
        quotes,
        winner: pickWinner(quotes),
        fetchedAt: new Date().toISOString(),
      };
      sessionStorage.setItem("ibud-quote", JSON.stringify(response));

      // Short beat so user sees the completed list
      await new Promise((r) => setTimeout(r, 600));
      router.push("/resultat");
    });
  }

  return (
    <div className="wizard">
      {step === "model" && (
        <div className="wizard-panel search-hero-panel">
          <div className="search-wrap">
            <div className="search-bar">
              <svg
                className="search-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder="Søg efter din iPhone — fx 15 Pro"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setModelId(null);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  // delay so click on suggestion registers
                  window.setTimeout(() => setOpen(false), 140);
                }}
                onKeyDown={onSearchKeyDown}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Søg efter iPhone-model"
                aria-autocomplete="list"
                aria-expanded={open && suggestions.length > 0}
              />
            </div>

            {open && suggestions.length > 0 && (
              <ul className="search-results" role="listbox">
                {!query.trim() && (
                  <li className="search-hint">Populære modeller</li>
                )}
                {suggestions.map((m, index) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === highlight}
                      className={`search-result ${index === highlight ? "active" : ""}`}
                      onMouseEnter={() => setHighlight(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectModel(m.id)}
                    >
                      <span>{m.name}</span>
                      <span className="search-meta">iPhone</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.trim() && suggestions.length === 0 && (
              <p className="search-empty">
                Ingen model matcher. Prøv fx “14 Pro” eller “SE”.
              </p>
            )}
          </div>

          <p className="search-foot">
            Kun iPhones · {IPHONE_MODELS.length} modeller · {PARTNER_IDS.length}{" "}
            steder
          </p>
        </div>
      )}

      {step === "storage" && model && (
        <div className="wizard-panel">
          <button
            type="button"
            className="back"
            onClick={() => {
              setStep("model");
              setModelId(null);
              setOpen(true);
            }}
          >
            ← Skift model
          </button>
          <h2>{model.name}</h2>
          <p className="muted">Vælg lagerstørrelse</p>
          <div className="option-row option-row-center">
            {model.storageOptions.map((gb) => (
              <button
                key={gb}
                type="button"
                className="option"
                onClick={() => selectStorage(gb)}
              >
                {formatStorage(gb)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "condition" && model && storageGb && (
        <div className="wizard-panel">
          <button
            type="button"
            className="back"
            onClick={() => setStep("storage")}
          >
            ← Tilbage
          </button>
          <h2>Stand på din {model.name}</h2>
          <p className="muted">
            Ærlige svar = mere præcist bud. Den endelige pris bekræftes efter
            inspektion.
          </p>

          <fieldset className="field">
            <legend>Fungerer telefonen normalt?</legend>
            <div className="option-row option-row-center">
              <button
                type="button"
                className={`option ${condition.worksNormally ? "selected" : ""}`}
                onClick={() =>
                  setCondition((c) => ({ ...c, worksNormally: true }))
                }
              >
                Ja
              </button>
              <button
                type="button"
                className={`option ${!condition.worksNormally ? "selected" : ""}`}
                onClick={() =>
                  setCondition((c) => ({ ...c, worksNormally: false }))
                }
              >
                Nej
              </button>
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Er skærmen uden revner?</legend>
            <div className="option-row option-row-center">
              <button
                type="button"
                className={`option ${condition.screenIntact ? "selected" : ""}`}
                onClick={() =>
                  setCondition((c) => ({ ...c, screenIntact: true }))
                }
              >
                Ja
              </button>
              <button
                type="button"
                className={`option ${!condition.screenIntact ? "selected" : ""}`}
                onClick={() =>
                  setCondition((c) => ({ ...c, screenIntact: false }))
                }
              >
                Nej
              </button>
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Kosmetik</legend>
            <div className="option-row option-row-center">
              {(
                [
                  ["fine", "Fin"],
                  ["scratches", "Ridser"],
                  ["damaged", "Skadet"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`option ${condition.cosmetic === value ? "selected" : ""}`}
                  onClick={() =>
                    setCondition((c) => ({ ...c, cosmetic: value }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Batteri</legend>
            <div className="option-row option-row-center">
              <button
                type="button"
                className={`option ${condition.battery === "ok" ? "selected" : ""}`}
                onClick={() => setCondition((c) => ({ ...c, battery: "ok" }))}
              >
                OK
              </button>
              <button
                type="button"
                className={`option ${condition.battery === "poor" ? "selected" : ""}`}
                onClick={() => setCondition((c) => ({ ...c, battery: "poor" }))}
              >
                Dårligt
              </button>
            </div>
          </fieldset>

          {error && <p className="error">{error}</p>}

          <button
            type="button"
            className="cta"
            onClick={submit}
            disabled={isPending}
          >
            Find bedste bud
          </button>
        </div>
      )}

      {step === "loading" && (
        <div className="wizard-panel loading-panel">
          <h2>Finder bud…</h2>
          <p className="muted">
            Det tager lidt tid — vi tjekker hvert sted for din{" "}
            {model?.name ?? "iPhone"}.
          </p>
          <ul className="scan-list">
            {partnerStatus.map((p) => (
              <li key={p.partnerId} className={`scan-item scan-${p.state}`}>
                <PartnerLogo partnerId={p.partnerId} size={36} />
                <span className="scan-name">{PARTNERS[p.partnerId].name}</span>
                <span className="scan-state">
                  {p.state === "waiting" && "Venter"}
                  {p.state === "loading" && "Henter…"}
                  {p.state === "done" &&
                    (p.quote?.amountDkk != null
                      ? formatDkk(p.quote.amountDkk)
                      : "—")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
