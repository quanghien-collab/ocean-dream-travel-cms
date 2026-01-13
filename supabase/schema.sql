-- =========================
-- Ocean Dream Travel CMS
-- =========================

-- 1) PROFILES (admin role)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now()
);

-- 2) SITE SETTINGS (singleton row)
create table if not exists public.site_settings (
  id text primary key,
  brand_name text not null default 'Ocean Dream Travel',
  hero_title text not null default 'Chạm vào giấc mơ biển xanh',
  hero_subtitle text,
  hero_image_url text,
  theme_rgb text not null default '15 76 129',
  hotline text,
  zalo text,
  email text,
  updated_at timestamptz not null default now()
);

-- Ensure singleton exists
insert into public.site_settings (id)
values ('singleton')
on conflict (id) do nothing;

-- 3) TOURS
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  location text,
  duration text,
  price_vnd bigint,
  cover_url text,
  content_html text,
  visible boolean not null default true,
  sort_order int default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists tours_visible_idx on public.tours (visible);
create index if not exists tours_sort_order_idx on public.tours (sort_order);

-- 4) Enable RLS
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.tours enable row level security;

-- Helper: is admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- PROFILES policies
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write"
on public.profiles for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- SITE SETTINGS policies

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "site_settings admin insert" on public.site_settings;
create policy "site_settings admin insert"
on public.site_settings for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "site_settings admin update" on public.site_settings;
create policy "site_settings admin update"
on public.site_settings for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "site_settings admin delete" on public.site_settings;
create policy "site_settings admin delete"
on public.site_settings for delete
to authenticated
using (public.is_admin(auth.uid()));

-- TOURS policies
drop policy if exists "tours public read visible" on public.tours;
create policy "tours public read visible"
on public.tours for select
to anon, authenticated
using (visible = true);

drop policy if exists "tours admin write" on public.tours;
create policy "tours admin write"
on public.tours
for all -- Thay vì viết rời rạc insert, update, delete
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Optional: allow admins to read all tours (including invisible)
drop policy if exists "tours admin read all" on public.tours;
create policy "tours admin read all"
on public.tours for select
to authenticated
using (public.is_admin(auth.uid()) or visible = true);

-- 5) Realtime (Supabase)
-- Supabase UI: Database → Replication → enable Realtime for tables:
-- - site_settings
-- - tours
