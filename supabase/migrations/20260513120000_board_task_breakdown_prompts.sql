-- Сохранение исходного текста запроса при AI-разбиении задачи на доске

create table public.board_task_breakdown_prompts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_text text not null check (
    char_length(trim(prompt_text)) >= 1
    and char_length(prompt_text) <= 20000
  ),
  created_at timestamptz not null default now()
);

create index board_task_breakdown_prompts_board_id_idx
  on public.board_task_breakdown_prompts (board_id);
create index board_task_breakdown_prompts_user_id_idx
  on public.board_task_breakdown_prompts (user_id);

alter table public.board_task_breakdown_prompts enable row level security;

create policy board_task_breakdown_prompts_select on public.board_task_breakdown_prompts
for select using (
  exists (
    select 1
    from public.boards b
    where b.id = board_task_breakdown_prompts.board_id
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

create policy board_task_breakdown_prompts_insert on public.board_task_breakdown_prompts
for insert
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.boards b
    where b.id = board_task_breakdown_prompts.board_id
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
