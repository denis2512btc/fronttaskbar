-- Справочник компетенций и выбор пользователя (до 5 ролей, одна основная)

create table public.competency_roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) >= 1 and char_length(slug) <= 64),
  sort_order integer not null default 0
);

create table public.profile_competencies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.competency_roles (id) on delete restrict,
  is_primary boolean not null default false,
  unique (profile_id, role_id)
);

create unique index profile_competencies_one_primary_idx
  on public.profile_competencies (profile_id)
  where is_primary;

create index profile_competencies_profile_id_idx on public.profile_competencies (profile_id);

create or replace function public.profile_competencies_enforce_max5()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing int;
begin
  if tg_op = 'INSERT' then
    select count(*)::int into existing
    from public.profile_competencies
    where profile_id = new.profile_id;
    if existing >= 5 then
      raise exception 'profile_competencies_max5';
    end if;
  elsif tg_op = 'UPDATE' and new.profile_id is distinct from old.profile_id then
    select count(*)::int into existing
    from public.profile_competencies
    where profile_id = new.profile_id and id is distinct from old.id;
    if existing >= 5 then
      raise exception 'profile_competencies_max5';
    end if;
  end if;
  return new;
end;
$$;

create trigger profile_competencies_max5
before insert or update on public.profile_competencies
for each row
execute function public.profile_competencies_enforce_max5();

alter table public.competency_roles enable row level security;
alter table public.profile_competencies enable row level security;

create policy competency_roles_select_authenticated
on public.competency_roles
for select
to authenticated
using (true);

create policy profile_competencies_select_own
on public.profile_competencies
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy profile_competencies_insert_own
on public.profile_competencies
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy profile_competencies_update_own
on public.profile_competencies
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy profile_competencies_delete_own
on public.profile_competencies
for delete
to authenticated
using (profile_id = (select auth.uid()));

insert into public.competency_roles (slug, sort_order)
values
  ('developer', 10),
  ('designer', 20),
  ('pm', 30),
  ('qa', 40),
  ('analyst', 50),
  ('devops', 60),
  ('tech_lead', 70);
