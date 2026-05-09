-- Связь задачи с записью исходного AI-запроса (разбить задачу)

alter table public.tasks
  add column breakdown_prompt_id uuid null references public.board_task_breakdown_prompts (id) on delete set null;

create index tasks_breakdown_prompt_id_idx on public.tasks (breakdown_prompt_id);
