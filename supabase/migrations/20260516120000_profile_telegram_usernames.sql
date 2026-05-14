-- Telegram usernames permitted for a profile (SaaS settings UI).
create table public.profile_telegram_usernames (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profile_telegram_usernames_username_format check (username ~ '^[a-z0-9_]{5,32}$'),
  constraint profile_telegram_usernames_profile_username_unique unique (profile_id, username)
);

create index profile_telegram_usernames_profile_id_idx on public.profile_telegram_usernames(profile_id);

alter table public.profile_telegram_usernames enable row level security;

create policy "profile_telegram_usernames_select_own"
  on public.profile_telegram_usernames
  for select
  to authenticated
  using ((select auth.uid()) = profile_id);

create policy "profile_telegram_usernames_insert_own"
  on public.profile_telegram_usernames
  for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "profile_telegram_usernames_delete_own"
  on public.profile_telegram_usernames
  for delete
  to authenticated
  using ((select auth.uid()) = profile_id);
