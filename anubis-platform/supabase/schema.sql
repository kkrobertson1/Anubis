-- ============================================
-- ANUBIS Memorial Platform — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "earthdistance" cascade;

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  avatar_url text,
  account_status text not null default 'pending' check (account_status in ('pending', 'active', 'suspended')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  slots_total integer not null default 28,
  slots_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- GRAVESITE PROFILES
-- ============================================
create table public.gravesite_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slot_category text not null check (slot_category in (
    'parent', 'grandparent', 'sibling', 'aunt', 'uncle',
    'cousin', 'friend', 'other'
  )),
  deceased_name text not null,
  cemetery_name text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  date_of_birth date,
  date_of_death date,
  bio text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- GRAVESITE MEDIA (photos, obituaries, docs)
-- ============================================
create table public.gravesite_media (
  id uuid default uuid_generate_v4() primary key,
  gravesite_id uuid references public.gravesite_profiles(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete cascade not null,
  media_type text not null check (media_type in ('photo', 'obituary', 'document')),
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- ============================================
-- GUEST BOOK ENTRIES
-- ============================================
create table public.guestbook_entries (
  id uuid default uuid_generate_v4() primary key,
  gravesite_id uuid references public.gravesite_profiles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  visitor_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- LOCATION MATCHES
-- ============================================
create table public.location_matches (
  id uuid default uuid_generate_v4() primary key,
  gravesite_id_1 uuid references public.gravesite_profiles(id) on delete cascade not null,
  gravesite_id_2 uuid references public.gravesite_profiles(id) on delete cascade not null,
  distance_meters decimal,
  notified_user_1 boolean not null default false,
  notified_user_2 boolean not null default false,
  created_at timestamptz not null default now(),
  unique(gravesite_id_1, gravesite_id_2)
);

-- ============================================
-- CONNECTION REQUESTS
-- ============================================
create table public.connection_requests (
  id uuid default uuid_generate_v4() primary key,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_id uuid references public.profiles(id) on delete cascade not null,
  gravesite_id uuid references public.gravesite_profiles(id) on delete set null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PAYMENTS
-- ============================================
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  processor text not null check (processor in ('helcim', 'paypal')),
  amount decimal(10, 2) not null,
  payment_type text not null check (payment_type in ('account_creation', 'slot_upgrade')),
  transaction_id text unique,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'location_match', 'connection_request', 'connection_accepted',
    'guestbook_entry', 'payment_confirmed'
  )),
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.gravesite_profiles enable row level security;
alter table public.gravesite_media enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.location_matches enable row level security;
alter table public.connection_requests enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Gravesite profiles: owners can CRUD, others can read public ones
create policy "Users can manage own gravesites"
  on public.gravesite_profiles for all using (auth.uid() = user_id);

create policy "Anyone can view public gravesites"
  on public.gravesite_profiles for select using (is_public = true);

-- Media: owners can upload, anyone can view media for public gravesites
create policy "Users can manage own gravesite media"
  on public.gravesite_media for all using (auth.uid() = uploaded_by);

create policy "Anyone can view media on public gravesites"
  on public.gravesite_media for select
  using (
    exists (
      select 1 from public.gravesite_profiles gp
      where gp.id = gravesite_id and gp.is_public = true
    )
  );

-- Guestbook: authenticated users can add entries, anyone can read public ones
create policy "Authenticated users can add guestbook entries"
  on public.guestbook_entries for insert
  with check (auth.uid() is not null);

create policy "Anyone can view guestbook entries"
  on public.guestbook_entries for select using (true);

-- Notifications: users see only their own
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Payments: users see only their own
create policy "Users can view own payments"
  on public.payments for select using (auth.uid() = user_id);

-- Connection requests: involved users can read
create policy "Users can view own connection requests"
  on public.connection_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send connection requests"
  on public.connection_requests for insert
  with check (auth.uid() = from_user_id);

create policy "Recipients can update connection requests"
  on public.connection_requests for update
  using (auth.uid() = to_user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at before update on public.gravesite_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at before update on public.connection_requests
  for each row execute procedure public.set_updated_at();
