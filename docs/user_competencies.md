# Компетенции пользователя и роль на доске

Документ описывает функциональность, связанную с **компетенциями (ролями) пользователя** и **ролью участника на конкретной доске**, и порядок применения **миграций Supabase**.

---

## 1. Компетенции в профиле (после регистрации)

### Назначение

- Пользователь выбирает компетенции из **фиксированного справочника** (`competency_roles`: slug + sort order в БД, человекочитаемые названия — в i18n `competencies.roles.<slug>`).
- Можно указать **от 1 до 5 ролей**.
- **Ровно одна** роль помечается как **основная**; без основной сохранить нельзя.
- Пока у пользователя нет строки с `is_primary = true` в `profile_competencies`, доступ к основному приложению (дашборд, доски) **закрыт гейтом** — показывается шаг onboarding.

### Данные в Supabase

| Таблица | Назначение |
|--------|------------|
| `competency_roles` | Справочник ролей (id, slug, sort_order), сиды в миграции |
| `profile_competencies` | Связь профиль ↔ роль: `profile_id`, `role_id`, `is_primary`; не более 5 строк на профиль; частичный уникальный индекс «одна основная на профиль» |

### Поведение в приложении

- **Маршрут** `/onboarding/competencies` — полноэкранная форма выбора ролей (см. [`router.tsx`](../src/app/router.tsx)).
- **`CompetenciesCompleteGate`** — если настроен Supabase и у пользователя ещё нет основной роли, редирект на onboarding; при ошибках «таблицы нет» (пустой проект без миграций) гейт может пропускать дальше — см. [`competency-schema-errors.ts`](../src/features/competencies/lib/competency-schema-errors.ts).
- **Настройки** — тот же редактор компетенций на [`SettingsPage`](../src/pages/settings/SettingsPage.tsx).
- **Код фичи**: [`src/features/competencies/`](../src/features/competencies/) — API, `CompetenciesEditor`, валидация Zod, TanStack Query.

### Миграция схемы компетенций

Файл: [`supabase/migrations/20260509120000_competencies.sql`](../supabase/migrations/20260509120000_competencies.sql)

Требуется существующая таблица `profiles` (см. базовую миграцию ниже).

---

## 2. Роль участника на доске

### Назначение

При **добавлении пользователя на доску** владелец:

1. Находит пользователя по поиску.
2. Видит список **только тех компетенций**, которые у этого пользователя заданы в `profile_competencies`.
3. Выбирает **одну** роль — она сохраняется как контекст участия на **этой** доске.

При **создании доски** владелец в [`CreateBoardDialog`](../src/features/boards/components/CreateBoardDialog.tsx) также выбирает одну из **своих** компетенций; для пары (доска, владелец) создаётся строка в `board_members` с выбранным `competency_role_id`. API: [`createBoard`](../src/features/boards/api/boards-api.ts) — проверка, что роль входит в компетенции владельца (как у `addBoardMember`).

В списке участников и на канбане (исполнители, аватары в шапке) к имени участника добавляется выбранная на доске роль (локализация через те же ключи `competencies.roles.*`). У владельца подпись берётся из его строки в `board_members`, если она есть.

### Данные в Supabase

- Колонка **`board_members.competency_role_id`** — FK на `competency_roles(id)`, **NOT NULL** (для существующих строк выполняется бэктфилл в миграции).

### Доступ к чужим компетенциям (RLS)

Чтобы владелец доски мог прочитать строки `profile_competencies` приглашаемого пользователя, добавлена политика **SELECT для всех `authenticated`** на `profile_competencies` (дополнительно к политике «только свои строки» — в PostgreSQL политики для одной команды комбинируются через **OR**).

Файл: [`supabase/migrations/20260510121500_profile_competencies_public_read.sql`](../supabase/migrations/20260510121500_profile_competencies_public_read.sql).

### Поведение в приложении

- API: [`fetchProfileCompetencyRoles`](../src/features/competencies/api/competencies-api.ts), [`createBoard`](../src/features/boards/api/boards-api.ts) (роль владельца при создании), [`addBoardMember(boardId, userId, competencyRoleId)`](../src/features/boards/api/boards-api.ts) с проверкой, что `competencyRoleId` входит в список компетенций пользователя.
- UI: [`CreateBoardDialog`](../src/features/boards/components/CreateBoardDialog.tsx) — выбор компетенции владельца при создании доски; [`BoardSettingsDialog`](../src/features/boards/components/BoardSettingsDialog.tsx) — шаг выбора роли после клика по кандидату из поиска; роль владельца на доске отображается в секции владельца; в списке приглашённых участников владелец не дублируется.
- Канбан: [`BoardKanbanView`](../src/features/boards/components/BoardKanbanView.tsx) — суффикс «· роль» для участников из `board_members`.

### Миграции

- [`20260510120000_board_member_competency_role.sql`](../supabase/migrations/20260510120000_board_member_competency_role.sql) — колонка + бэктфилл + NOT NULL.
- [`20260511120000_board_owner_member_backfill.sql`](../supabase/migrations/20260511120000_board_owner_member_backfill.sql) — для существующих досок: вставка владельца в `board_members` с `competency_role_id` (основная компетенция профиля / первая / fallback из справочника), если строки ещё нет.
- [`20260512120000_board_members_insert_owner_check.sql`](../supabase/migrations/20260512120000_board_members_insert_owner_check.sql) — политика `INSERT` на `board_members` через `is_board_owner(board_id)` (`SECURITY DEFINER`), чтобы вставка участника владельцем не блокировалась RLS при чтении `boards`.

---

## 3. Зависимость от базовой схемы

Компетенции и участники досок опираются на:

- [`20260105120000_profiles_boards_core.sql`](../supabase/migrations/20260105120000_profiles_boards_core.sql) — `profiles`, `boards`, `board_members` и RLS.
- Канбан: [`20260205120000_board_columns_and_tasks.sql`](../supabase/migrations/20260205120000_board_columns_and_tasks.sql).

**Рекомендуемый порядок применения** — по префиксу даты в имени файла (см. также [`board_develop.md`](board_develop.md)).

---

## 4. Как применить миграции в Supabase

### Вариант A: SQL Editor (вручную)

Подходит для быстрого запуска без CLI.

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект.
2. Меню **SQL Editor** → **New query**.
3. По очереди откройте файлы из [`supabase/migrations/`](../supabase/migrations/) в порядке дат и **вставьте полное содержимое** каждого файла → **Run**.
4. Убедитесь, что нет ошибок (например, «relation already exists» — значит шаг уже выполняли).

### Вариант B: Supabase CLI (`db push`)

Подходит для синхронизации локальной папки `supabase/migrations` с **удалённой** базой.

**Предусловия:** установлен [Supabase CLI](https://supabase.com/docs/guides/cli), вы авторизованы (`supabase login`).

1. В корне репозитория (где лежит папка `supabase/`):

   ```bash
   npx supabase init
   ```

   (если ещё нет `supabase/config.toml`; не перезаписывайте существующие миграции).

2. Связать проект:

   ```bash
   npx supabase link --project-ref <PROJECT_REF>
   ```

   `PROJECT_REF` — фрагмент URL проекта:  
   `https://supabase.com/dashboard/project/<PROJECT_REF>`.

3. Применить миграции к связанному проекту:

   ```bash
   npx supabase db push
   ```

   Команда применит неприменённые файлы из `supabase/migrations` в порядке имени.

**Переменные окружения** для CLI при необходимости: см. [документацию](https://supabase.com/docs/guides/cli) (database password, pooler и т.д.).

### Вариант C: Локальный Supabase (`supabase start` + миграции)

Для разработки со стеком Docker: `supabase start`, затем миграции накатываются на локальную БД; подробности — в разделе [Local development](https://supabase.com/docs/guides/local-development) в документации Supabase.

### После миграций

- В клиенте приложения должны быть заданы **`VITE_SUPABASE_URL`** и **`VITE_SUPABASE_ANON_KEY`** (см. `.env.example`).
- При необходимости обновите сгенерированные типы БД под актуальную схему (в проекте типы вручную поддерживаются в [`src/types/database.ts`](../src/types/database.ts)).

---

## 5. Полезные ссылки в коде

| Область | Файлы / папки |
|--------|----------------|
| Компетенции профиля | [`src/features/competencies/`](../src/features/competencies/), [`src/pages/onboarding/CompetenciesOnboardingPage.tsx`](../src/pages/onboarding/CompetenciesOnboardingPage.tsx) |
| Гейт onboarding | [`CompetenciesCompleteGate.tsx`](../src/features/competencies/components/CompetenciesCompleteGate.tsx) |
| Доска: участники, создание доски, приглашение | [`boards-api.ts`](../src/features/boards/api/boards-api.ts), [`CreateBoardDialog.tsx`](../src/features/boards/components/CreateBoardDialog.tsx), [`BoardSettingsDialog.tsx`](../src/features/boards/components/BoardSettingsDialog.tsx) |
| Обзор всей доски и канбана | [`docs/board_develop.md`](board_develop.md) |
