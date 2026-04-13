-- =============================================================================
-- Chrona Work — Database Schema (Phase 3)
-- Run this in the Supabase SQL editor before running seed.sql
-- =============================================================================

-- ── Workspaces ────────────────────────────────────────────────────────────────

create table if not exists workspaces (
  id          uuid        primary key,
  name        text        not null,
  plan        text        not null default 'growth',
  created_at  timestamptz not null default now()
);

alter table workspaces disable row level security;

-- ── Users ─────────────────────────────────────────────────────────────────────

create table if not exists users (
  id               uuid        primary key,
  workspace_id     uuid        not null references workspaces(id) on delete cascade,
  name             text        not null,
  email            text        not null,
  role             text        not null default 'employee'
                               check (role in ('admin', 'manager', 'employee')),
  job_title        text        not null default '',
  department       text        not null default '',
  initials         text        not null,
  online_status    text        not null default 'offline'
                               check (online_status in ('online', 'away', 'offline')),
  workload         integer     not null default 0,
  tasks_assigned   integer     not null default 0,
  tasks_completed  integer     not null default 0,
  availability     integer     not null default 40,
  created_at       timestamptz not null default now(),
  unique (workspace_id, email)
);

alter table users disable row level security;

-- ── Teams ─────────────────────────────────────────────────────────────────────

create table if not exists teams (
  id            uuid        primary key,
  workspace_id  uuid        not null references workspaces(id) on delete cascade,
  name          text        not null,
  department    text        not null default '',
  manager_id    uuid        references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table teams disable row level security;

-- ── Team members ──────────────────────────────────────────────────────────────

create table if not exists team_members (
  team_id  uuid not null references teams(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  primary key (team_id, user_id)
);

alter table team_members disable row level security;

-- ── Projects ─────────────────────────────────────────────────────────────────

create table if not exists projects (
  id            uuid        primary key,
  workspace_id  uuid        not null references workspaces(id) on delete cascade,
  team_id       uuid        references teams(id) on delete set null,
  name          text        not null,
  description   text        not null default '',
  color         text        not null default 'indigo',
  status        text        not null default 'active'
                            check (status in ('active', 'paused', 'completed')),
  created_at    timestamptz not null default now()
);

alter table projects disable row level security;

-- ── Tasks ─────────────────────────────────────────────────────────────────────

create table if not exists tasks (
  id                uuid        primary key default gen_random_uuid(),
  workspace_id      uuid        not null references workspaces(id) on delete cascade,
  title             text        not null,
  description       text        not null default '',
  status            text        not null default 'not_started'
                                check (status in ('not_started', 'in_progress', 'blocked', 'done')),
  priority          text        not null default 'medium'
                                check (priority in ('critical', 'high', 'medium', 'low')),
  due_date          date,
  primary_owner_id  uuid        references users(id) on delete set null,
  creator_id        uuid        references users(id) on delete set null,
  team_id           uuid        references teams(id) on delete set null,
  project_id        uuid        references projects(id) on delete set null,
  blocked_reason    text,
  tags              text[]      not null default '{}',
  estimated_hours   numeric     not null default 0,
  logged_hours      numeric     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table tasks disable row level security;

-- Auto-update updated_at on task rows
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ── Task collaborators ────────────────────────────────────────────────────────

create table if not exists task_collaborators (
  task_id  uuid not null references tasks(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  primary key (task_id, user_id)
);

alter table task_collaborators disable row level security;

-- ── Task comments ─────────────────────────────────────────────────────────────

create table if not exists task_comments (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references tasks(id) on delete cascade,
  author_id  uuid        references users(id) on delete set null,
  body       text        not null,
  type       text        not null default 'comment'
                         check (type in ('comment', 'activity')),
  created_at timestamptz not null default now()
);

alter table task_comments disable row level security;
