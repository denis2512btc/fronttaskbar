-- Роль участника на конкретной доске (ссылка на competency_roles)

alter table public.board_members
  add column competency_role_id uuid references public.competency_roles (id) on delete restrict;

-- Существующие строки: основная компетенция пользователя
update public.board_members bm
set competency_role_id = pc.role_id
from public.profile_competencies pc
where bm.user_id = pc.profile_id
  and pc.is_primary = true
  and bm.competency_role_id is null;

-- Иначе любая компетенция профиля (приоритет основной уже учтён выше — берём одну на профиль)
update public.board_members bm
set competency_role_id = pc.role_id
from (
  select distinct on (profile_id) profile_id, role_id
  from public.profile_competencies
  order by profile_id, is_primary desc, role_id
) pc
where bm.user_id = pc.profile_id
  and bm.competency_role_id is null;

-- Fallback: первая роль из справочника
update public.board_members bm
set competency_role_id = (
  select id from public.competency_roles order by sort_order asc limit 1
)
where bm.competency_role_id is null;

alter table public.board_members
  alter column competency_role_id set not null;
