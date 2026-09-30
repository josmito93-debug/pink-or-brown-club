-- ==============================================================================
-- PINK OR BROWN · CLUB — FULL PRODUCTION SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE (Linked to Supabase Auth)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  handle text unique not null,
  email text unique not null,
  team text not null check (team in ('pink', 'brown')),
  dob date not null,
  lifetime_points integer default 0,
  balance_points integer default 0,
  ig_linked boolean default false,
  ig_code text,
  badges text[] default '{}',
  blocked_users uuid[] default '{}',
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_profiles_handle on public.profiles(handle);
create index if not exists idx_profiles_lifetime_points on public.profiles(lifetime_points desc);

-- ==============================================================================
-- 3. POINT LOGS TABLE (Ledger of all earned and spent points)
-- ==============================================================================
create table if not exists public.point_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('signup', 'link', 'story', 'post', 'challenge', 'selfcheck', 'referral', 'redeem', 'purchase', 'spend', 'refund')),
  pts integer not null,
  note text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_point_logs_user_id on public.point_logs(user_id);
create index if not exists idx_point_logs_created_at on public.point_logs(created_at desc);

-- ==============================================================================
-- 4. SUBMISSIONS TABLE (User photos/stories submitted for points & challenges)
-- ==============================================================================
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('story', 'post', 'challenge')),
  url text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_submissions_status on public.submissions(status);
create index if not exists idx_submissions_user_id on public.submissions(user_id);

-- ==============================================================================
-- 5. SNAPS TABLE (Public community gallery approved items)
-- ==============================================================================
create table if not exists public.snaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  image_url text not null,
  likes_count integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_snaps_created_at on public.snaps(created_at desc);

-- Likes join table
create table if not exists public.snap_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  snap_id uuid not null references public.snaps(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (user_id, snap_id)
);

-- ==============================================================================
-- 6. REWARDS & REDEMPTIONS TABLE
-- ==============================================================================
create table if not exists public.rewards (
  id text primary key,
  name text not null,
  cost integer not null,
  description text,
  kind text not null check (kind in ('code', 'ship', 'ticket')),
  applies text,
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id text not null references public.rewards(id),
  name text not null,
  code text unique not null,
  used_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_redemptions_user_id on public.redemptions(user_id);
create index if not exists idx_redemptions_code on public.redemptions(code);

-- ==============================================================================
-- 7. REVEALS & VOTES (Hot Reveals contest)
-- ==============================================================================
create table if not exists public.reveals (
  id text primary key,
  handle text not null,
  pink_votes integer default 0,
  brown_votes integer default 0,
  image_url text,
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.reveal_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  reveal_id text not null references public.reveals(id) on delete cascade,
  vote text not null check (vote in ('pink', 'brown')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (user_id, reveal_id)
);

-- ==============================================================================
-- 8. REALTIME MESSAGES (Member-to-member direct messaging)
-- ==============================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_messages_conversation on public.messages(sender_id, recipient_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);

-- ==============================================================================
-- 9. ORDERS TABLE (Merch store orders linked to Stripe)
-- ==============================================================================
create table if not exists public.orders (
  id text primary key, -- e.g. 'PB1024'
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  points_discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  total numeric(10,2) not null,
  points_used integer default 0,
  points_earned integer default 0,
  stripe_session_id text,
  payment_status text default 'paid',
  shipping_address jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_email on public.orders(email);

-- ==============================================================================
-- 10. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- A. Auto-create Profile and award 100 points on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_meta jsonb;
  user_name text;
  user_handle text;
  user_team text;
  user_dob date;
  user_ref text;
  ref_user_id uuid;
begin
  raw_meta := new.raw_user_meta_data;
  user_name := coalesce(raw_meta->>'name', 'Member');
  user_handle := lower(coalesce(raw_meta->>'handle', 'member_' || substr(new.id::text, 1, 6)));
  user_team := coalesce(raw_meta->>'team', 'pink');
  user_dob := coalesce((raw_meta->>'dob')::date, '2000-01-01'::date);
  user_ref := lower(raw_meta->>'referral');

  -- Insert profile
  insert into public.profiles (id, name, handle, email, team, dob, ig_code)
  values (
    new.id,
    user_name,
    user_handle,
    new.email,
    user_team,
    user_dob,
    'POB-' || upper(substr(md5(random()::text), 1, 4))
  );

  -- Award 100 welcome points
  insert into public.point_logs (user_id, type, pts, note)
  values (new.id, 'signup', 100, 'Welcome bonus');

  -- If referral code provided and exists, award 150 points to referrer
  if user_ref is not null and user_ref <> '' then
    select id into ref_user_id from public.profiles where handle = user_ref limit 1;
    if ref_user_id is not null then
      insert into public.point_logs (user_id, type, pts, note)
      values (ref_user_id, 'referral', 150, 'Referral: @' || user_handle);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- B. Auto-update Profile Balance & Lifetime points when point_logs inserted
create or replace function public.update_profile_points_on_log()
returns trigger as $$
begin
  update public.profiles
  set 
    balance_points = balance_points + new.pts,
    lifetime_points = case 
      when new.pts > 0 and new.type <> 'refund' then lifetime_points + new.pts 
      else lifetime_points 
    end,
    updated_at = timezone('utc'::text, now())
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_point_log_created on public.point_logs;
create trigger on_point_log_created
  after insert on public.point_logs
  for each row execute function public.update_profile_points_on_log();

-- C. Auto-increment/decrement snap likes count
create or replace function public.handle_snap_like()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.snaps set likes_count = likes_count + 1 where id = new.snap_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.snaps set likes_count = greatest(0, likes_count - 1) where id = old.snap_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

drop trigger if exists on_snap_like_change on public.snap_likes;
create trigger on_snap_like_change
  after insert or delete on public.snap_likes
  for each row execute function public.handle_snap_like();

-- D. Auto-update reveal votes count
create or replace function public.handle_reveal_vote()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if (new.vote = 'pink') then
      update public.reveals set pink_votes = pink_votes + 1 where id = new.reveal_id;
    else
      update public.reveals set brown_votes = brown_votes + 1 where id = new.reveal_id;
    end if;
    return new;
  end if;
end;
$$ language plpgsql security definer;

drop trigger if exists on_reveal_vote_change on public.reveal_votes;
create trigger on_reveal_vote_change
  after insert on public.reveal_votes
  for each row execute function public.handle_reveal_vote();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.point_logs enable row level security;
alter table public.submissions enable row level security;
alter table public.snaps enable row level security;
alter table public.snap_likes enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.reveals enable row level security;
alter table public.reveal_votes enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Point logs policies
create policy "Users can view their own point logs" on public.point_logs
  for select using (auth.uid() = user_id);

-- Submissions policies
create policy "Users can view their own submissions" on public.submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own submissions" on public.submissions
  for insert with check (auth.uid() = user_id);

-- Snaps & Likes policies
create policy "Snaps are viewable by anyone" on public.snaps
  for select using (true);

create policy "Users can like snaps" on public.snap_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their snap likes" on public.snap_likes
  for delete using (auth.uid() = user_id);

create policy "Snap likes are viewable by anyone" on public.snap_likes
  for select using (true);

-- Rewards & Redemptions policies
create policy "Rewards catalog is viewable by anyone" on public.rewards
  for select using (active = true);

create policy "Users can view their own redemptions" on public.redemptions
  for select using (auth.uid() = user_id);

create policy "Users can insert redemptions" on public.redemptions
  for insert with check (auth.uid() = user_id);

-- Reveals & Votes
create policy "Reveals are viewable by anyone" on public.reveals
  for select using (active = true);

create policy "Users can view their own reveal votes" on public.reveal_votes
  for select using (auth.uid() = user_id);

create policy "Users can cast reveal votes" on public.reveal_votes
  for insert with check (auth.uid() = user_id);

-- Messages (Direct Messaging)
create policy "Users can view messages sent to or by them" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "Recipients can update message read status" on public.messages
  for update using (auth.uid() = recipient_id);

-- Orders policies
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

-- ==============================================================================
-- 12. ENABLE REALTIME PUBLICATION
-- ==============================================================================
begin;
  -- Add messages and reveals to supabase_realtime
  alter publication supabase_realtime add table public.messages;
  alter publication supabase_realtime add table public.reveals;
commit;

-- ==============================================================================
-- 13. SEED DEFAULT REWARDS & REVEALS
-- ==============================================================================
insert into public.rewards (id, name, cost, description, kind, applies) values
  ('off10', '10% off your next order', 300, 'Single-use code for the store.', 'code', 'all'),
  ('stick', 'Sticker pack', 400, 'Physical sticker sheet, shipped free.', 'ship', null),
  ('cap', 'Free hat', 1200, 'Any hat in the store, one unit.', 'code', 'hat'),
  ('tee', 'Free tee or tank', 1500, 'Any shirt or tank, one unit.', 'code', 'top'),
  ('event', 'Event ticket', 2000, 'General entry to the next live event.', 'ticket', null),
  ('vip', 'VIP event pass', 4000, 'Backstage and VIP table access.', 'ticket', null)
on conflict (id) do nothing;

insert into public.reveals (id, handle, pink_votes, brown_votes) values
  ('r1', 'sofi.rdz', 412, 188),
  ('r2', 'niabrowne', 203, 377),
  ('r3', 'cami.t', 290, 301)
on conflict (id) do nothing;
