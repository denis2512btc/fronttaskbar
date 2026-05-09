-- Чтение компетенций любого профиля для аутентифицированных пользователей
-- (приглашение на доску: выбор роли из списка компетенций пользователя).
-- Политики SELECT объединяются по OR с существующей policy «только свои».

create policy profile_competencies_select_any_authenticated
on public.profile_competencies
for select
to authenticated
using (true);
