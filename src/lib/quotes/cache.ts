import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CACHE_TTL_HOURS } from "./catalog";
import type { PartnerId, QuoteRequest, QuoteResult } from "./types";
import { cacheKey, conditionHash } from "./utils";

type CacheRow = {
  cache_key: string;
  partner_id: string;
  model_id: string;
  storage_gb: number;
  condition_hash: string;
  amount_dkk: number | null;
  deep_link: string;
  raw_notes: string | null;
  error: string | null;
  fetched_at: string;
  expires_at: string;
};

const memoryCache = new Map<string, { result: QuoteResult; expiresAt: number }>();

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function rowToResult(row: CacheRow): QuoteResult {
  return {
    partnerId: row.partner_id as PartnerId,
    amountDkk: row.amount_dkk,
    currency: "DKK",
    deepLink: row.deep_link,
    fetchedAt: row.fetched_at,
    cached: true,
    error: row.error ?? undefined,
    rawNotes: row.raw_notes ?? undefined,
  };
}

export async function getCachedQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
): Promise<QuoteResult | null> {
  const key = cacheKey(partnerId, request);
  const now = Date.now();

  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) {
    return { ...mem.result, cached: true };
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("quote_cache")
    .select("*")
    .eq("cache_key", key)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  const result = rowToResult(data as CacheRow);
  memoryCache.set(key, {
    result,
    expiresAt: new Date((data as CacheRow).expires_at).getTime(),
  });
  return result;
}

export async function setCachedQuote(
  partnerId: PartnerId,
  request: QuoteRequest,
  result: QuoteResult,
): Promise<void> {
  const key = cacheKey(partnerId, request);
  const fetchedAt = result.fetchedAt || new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString();

  memoryCache.set(key, {
    result: { ...result, cached: true },
    expiresAt: new Date(expiresAt).getTime(),
  });

  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("quote_cache").upsert(
    {
      cache_key: key,
      partner_id: partnerId,
      model_id: request.modelId,
      storage_gb: request.storageGb,
      condition_hash: conditionHash(request.condition),
      amount_dkk: result.amountDkk,
      deep_link: result.deepLink,
      raw_notes: result.rawNotes ?? null,
      error: result.error ?? null,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    },
    { onConflict: "cache_key" },
  );
}

export async function logQuoteRun(
  request: QuoteRequest,
  quotes: QuoteResult[],
  winnerPartnerId: string | null,
  fingerprint: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("quote_runs").insert({
    request_fingerprint: fingerprint,
    model_id: request.modelId,
    storage_gb: request.storageGb,
    condition: request.condition,
    results: quotes,
    winner_partner_id: winnerPartnerId,
  });
}
