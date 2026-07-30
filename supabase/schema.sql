-- Quote cache for Brugt (Sælg din iPhone)
-- Run in Supabase SQL editor, then set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

create table if not exists quote_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  partner_id text not null,
  model_id text not null,
  storage_gb integer not null,
  condition_hash text not null,
  amount_dkk integer,
  deep_link text not null,
  raw_notes text,
  error text,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists quote_cache_expires_idx on quote_cache (expires_at);
create index if not exists quote_cache_lookup_idx on quote_cache (partner_id, model_id, storage_gb, condition_hash);

create table if not exists quote_runs (
  id uuid primary key default gen_random_uuid(),
  request_fingerprint text not null,
  model_id text not null,
  storage_gb integer not null,
  condition jsonb not null,
  results jsonb not null,
  winner_partner_id text,
  created_at timestamptz not null default now()
);

create index if not exists quote_runs_created_idx on quote_runs (created_at desc);

alter table quote_cache enable row level security;
alter table quote_runs enable row level security;

-- Service role bypasses RLS; no public policies needed for MVP.
