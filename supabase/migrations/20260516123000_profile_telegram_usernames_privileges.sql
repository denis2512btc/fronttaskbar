-- Strict table privileges: only authenticated role may access (RLS still applies per user).
revoke all on table public.profile_telegram_usernames from anon;
grant select, insert, delete on table public.profile_telegram_usernames to authenticated;
