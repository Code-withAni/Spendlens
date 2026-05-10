-- Supabase Table: audits
-- create extension if not exists "pgcrypto";

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tools jsonb not null,
  team_size int,
  use_case text,
  audit_results jsonb not null,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  ai_summary text,
  email text,           -- null until lead captured
  company text,
  role text,
  lead_captured boolean default false,
  high_savings boolean default false
);

-- Enable RLS (Recommended)
-- alter table audits enable row level security;

-- Example Policy: Allow inserts (public) and selects by ID (public)
-- create policy "Allow public inserts" on audits for insert with check (true);
-- create policy "Allow public select by ID" on audits for select using (true);
