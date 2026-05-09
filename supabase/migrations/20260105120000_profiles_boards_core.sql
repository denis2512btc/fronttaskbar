-- Базовые таблицы для приложения (новый пустой проект Supabase).
-- Выполните все файлы из supabase/migrations по порядку или: supabase db push

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null check (
    char_length(title) >= 1
    and char_length(title) <= 120
  ),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index boards_owner_id_idx on public.boards (owner_id);

create table public.board_members (
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index board_members_user_id_idx on public.board_members (user_id);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;

-- Профили: чтение для коллаба на досках; запись только своей строки
create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (true);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Доски: владелец или участник
create policy boards_select_access
on public.boards
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.board_members m
    where m.board_id = boards.id
      and m.user_id = (select auth.uid())
  )
);

create policy boards_insert_owner
on public.boards
for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy boards_update_owner
on public.boards
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy boards_delete_owner
on public.boards
for delete
to authenticated
using (owner_id = (select auth.uid()));

-- Участники доски
create policy board_members_select_access
on public.board_members
for select
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_members.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m2
          where m2.board_id = b.id
            and m2.user_id = (select auth.uid())
        )
      )
  )
);

create policy board_members_insert_owner
on public.board_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_members.board_id
      and b.owner_id = (select auth.uid())
  )
);

create policy board_members_delete_owner_or_self
on public.board_members
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.boards b
    where b.id = board_members.board_id
      and b.owner_id = (select auth.uid())
  )
);

create or replace function public.boards_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger boards_updated_at
before update on public.boards
for each row
execute function public.boards_set_updated_at();
