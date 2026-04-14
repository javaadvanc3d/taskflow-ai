create type task_priority as enum ('low', 'medium', 'high', 'critical');
create type task_status   as enum ('todo', 'in_progress', 'done', 'archived');

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  description text,
  priority    task_priority not null default 'medium',
  status      task_status   not null default 'todo',
  position    integer       not null default 0,
  due_date    timestamptz,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

create index tasks_user_status_idx on tasks (user_id, status);

alter table tasks enable row level security;
