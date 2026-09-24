-- Aether live protocol schema (Supabase / Postgres)
create extension if not exists "pgcrypto";

create table if not exists campaigns (
  id text primary key,
  project_id text not null,
  slug text unique not null,
  title text not null,
  hook text not null,
  description text not null,
  objective text not null,
  status text not null,
  priority text not null,
  zones text[] not null default '{}',
  category text not null,
  budget_lamports bigint not null,
  spent_lamports bigint not null default 0,
  reward_per_completion_lamports bigint not null,
  max_completions int not null,
  completion_count int not null default 0,
  weight int not null default 1,
  advertiser_wallet text,
  escrow_pda text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists claims (
  id text primary key,
  campaign_id text not null references campaigns(id),
  task_id text not null,
  participant text not null,
  proof_signature text,
  payout_lamports bigint not null,
  receipt_id text,
  mode text not null default 'sim',
  created_at timestamptz not null default now(),
  unique (campaign_id, participant)
);

create table if not exists delivery_events (
  id text primary key,
  type text not null,
  zone_key text not null,
  campaign_id text,
  task_id text,
  wallet text,
  at timestamptz not null default now()
);
