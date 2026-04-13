-- =============================================================================
-- Chrona Work — Phase 6: Schedule Blocks
-- Run in Supabase SQL editor after schema-v5.sql.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE.
-- =============================================================================

-- ── Table ─────────────────────────────────────────────────────────────────────

create table if not exists schedule_blocks (
  id            uuid        primary key default gen_random_uuid(),
  workspace_id  uuid        not null references workspaces(id) on delete cascade,
  user_id       uuid        not null references users(id) on delete cascade,
  task_id       uuid        references tasks(id) on delete set null,
  team_id       uuid        references teams(id) on delete set null,
  kind          text        not null default 'task'
                            check (kind in ('task', 'focus', 'meeting', 'blocked')),
  title         text        not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  created_by    uuid        references users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ends_after_starts check (ends_at > starts_at)
);

-- Indexes for common queries
create index if not exists sb_workspace_idx    on schedule_blocks (workspace_id);
create index if not exists sb_user_time_idx    on schedule_blocks (user_id, starts_at, ends_at);
create index if not exists sb_task_idx         on schedule_blocks (task_id) where task_id is not null;
create index if not exists sb_week_range_idx   on schedule_blocks (workspace_id, starts_at, ends_at);

-- ── RLS helpers ───────────────────────────────────────────────────────────────
-- These functions resolve the calling Supabase auth user's workspace and role
-- by joining through the users.auth_id column (set during Phase 5 sign-in).

create or replace function _chrona_workspace_id() returns uuid
  language sql security definer stable as $$
    select workspace_id from users where auth_id = auth.uid()::text limit 1
  $$;

create or replace function _chrona_user_id() returns uuid
  language sql security definer stable as $$
    select id from users where auth_id = auth.uid()::text limit 1
  $$;

create or replace function _chrona_user_role() returns text
  language sql security definer stable as $$
    select role from users where auth_id = auth.uid()::text limit 1
  $$;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table schedule_blocks enable row level security;

-- SELECT
-- Admin / Manager : see all schedule blocks in their workspace.
-- Employee         : see only their own blocks.
create policy "sb_select" on schedule_blocks
  for select using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() in ('admin', 'manager')
      or user_id = _chrona_user_id()
    )
  );

-- INSERT
-- Admin / Manager : can create blocks for any user in the same workspace.
-- Employee         : can only create blocks for themselves.
create policy "sb_insert" on schedule_blocks
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() in ('admin', 'manager')
      or user_id = _chrona_user_id()
    )
  );

-- UPDATE
-- Admin / Manager : can update any block in the workspace.
-- Employee         : can only update their own blocks.
create policy "sb_update" on schedule_blocks
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() in ('admin', 'manager')
      or user_id = _chrona_user_id()
    )
  );

-- DELETE
-- Same rules as UPDATE.
create policy "sb_delete" on schedule_blocks
  for delete using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() in ('admin', 'manager')
      or user_id = _chrona_user_id()
    )
  );
