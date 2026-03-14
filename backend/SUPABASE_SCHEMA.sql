-- VoiceBot Database Schema for Supabase
-- Paste this entire file into Supabase SQL Editor

create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  hashed_password text not null,
  state text,
  acres numeric,
  created_at timestamptz default now()
);

create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  n numeric, p numeric, k numeric,
  ph numeric, temperature numeric,
  humidity numeric, rainfall numeric,
  recommended_crop text,
  confidence numeric,
  created_at timestamptz default now()
);

create table public.fertilizer_logs (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  nutrient text,
  fertilizer_name text,
  dosage text,
  status text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.scans enable row level security;
alter table public.fertilizer_logs enable row level security;

create policy "allow all for service role" on public.users for all using (true);
create policy "allow all for service role" on public.scans for all using (true);
create policy "allow all for service role" on public.fertilizer_logs for all using (true);
