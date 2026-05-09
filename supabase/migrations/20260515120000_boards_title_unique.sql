-- Глобальная уникальность названия доски (все пользователи).
-- Перед применением удалите дубликаты по normalized title вручную, иначе CREATE UNIQUE INDEX завершится ошибкой.

create unique index boards_title_normalized_uidx
on public.boards ((lower(trim(title))));
