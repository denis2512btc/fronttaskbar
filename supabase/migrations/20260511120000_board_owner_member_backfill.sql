-- Владелец доски как участник с competency_role_id (роль на доске)
-- Идемпотентно: только если ещё нет строки (board_id, owner_id)

insert into public.board_members (board_id, user_id, competency_role_id)
select
  b.id,
  b.owner_id,
  coalesce(
    (
      select pc.role_id
      from public.profile_competencies pc
      where pc.profile_id = b.owner_id
        and pc.is_primary = true
      limit 1
    ),
    (
      select pc.role_id
      from public.profile_competencies pc
      where pc.profile_id = b.owner_id
      order by pc.is_primary desc, pc.role_id
      limit 1
    ),
    (select id from public.competency_roles order by sort_order asc limit 1)
  )
from public.boards b
where not exists (
  select 1
  from public.board_members m
  where m.board_id = b.id
    and m.user_id = b.owner_id
);
