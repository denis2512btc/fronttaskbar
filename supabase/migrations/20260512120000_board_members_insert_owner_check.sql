-- INSERT в board_members: подзапрос к boards под RLS иногда не проходит при INSERT (создание доски + участник-владелец).
-- Проверка владельца в SECURITY DEFINER обходит RLS на boards, по-прежнему сравнивая owner_id с auth.uid().

create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boards b
    where b.id = p_board_id
      and b.owner_id = (select auth.uid())
  );
$$;

revoke all on function public.is_board_owner(uuid) from public;
grant execute on function public.is_board_owner(uuid) to authenticated;

drop policy if exists board_members_insert_owner on public.board_members;

create policy board_members_insert_owner
on public.board_members
for insert
to authenticated
with check (public.is_board_owner(board_id));
