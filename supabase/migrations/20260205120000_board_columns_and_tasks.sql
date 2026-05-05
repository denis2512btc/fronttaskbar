-- Kanban: колонки и задачи с RLS по доступу к доске (владелец или board_members)

create table public.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null check (
    char_length(title) >= 1
    and char_length(title) <= 80
  ),
  color text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index board_columns_board_id_idx on public.board_columns (board_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  column_id uuid not null references public.board_columns (id) on delete cascade,
  title text not null check (
    char_length(title) >= 1
    and char_length(title) <= 200
  ),
  description text not null default '',
  color text not null,
  assignee_id uuid references public.profiles (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_board_id_idx on public.tasks (board_id);
create index tasks_column_id_idx on public.tasks (column_id);

create or replace function public.tasks_set_updated_at()
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

create trigger tasks_updated_at
before update on public.tasks
for each row
execute function public.tasks_set_updated_at();

alter table public.board_columns enable row level security;
alter table public.tasks enable row level security;

-- Доступ к строкам board_id, если пользователь владелец доски или участник
create policy board_columns_select on public.board_columns
for select using (
  exists (
    select 1
    from public.boards b
    where b.id = board_columns.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy board_columns_insert on public.board_columns
for insert
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_columns.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy board_columns_update on public.board_columns
for update
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_columns.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_columns.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy board_columns_delete on public.board_columns
for delete using (
  exists (
    select 1
    from public.boards b
    where b.id = board_columns.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy tasks_select on public.tasks
for select using (
  exists (
    select 1
    from public.boards b
    where b.id = tasks.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy tasks_insert on public.tasks
for insert
with check (
  exists (
    select 1
    from public.boards b
    where b.id = tasks.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy tasks_update on public.tasks
for update
using (
  exists (
    select 1
    from public.boards b
    where b.id = tasks.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.boards b
    where b.id = tasks.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);

create policy tasks_delete on public.tasks
for delete using (
  exists (
    select 1
    from public.boards b
    where b.id = tasks.board_id
      and (
        b.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.board_members m
          where m.board_id = b.id
            and m.user_id = (select auth.uid())
        )
      )
  )
);
