-- =============================================================================
-- Chrona Work — Phase 7 Security Migration
-- Run in the Supabase SQL editor AFTER schema.sql + seed.sql + schema-v5.sql + schema-v6.sql
-- =============================================================================

-- ── Helper: does the current manager manage the target user? ──────────────────
-- Used to scope manager access in schedule_blocks to their own teams only.

create or replace function _chrona_manages_user(target_user_id uuid)
returns boolean
  language sql security definer stable as $$
    select exists (
      select 1
      from   teams       t
      join   team_members tm on tm.team_id = t.id
      where  t.manager_id           = _chrona_user_id()
        and  tm.user_id             = target_user_id
        and  t.workspace_id         = _chrona_workspace_id()
    )
  $$;

-- =============================================================================
-- Fix 1: Tighten schedule_blocks RLS so managers only see their own teams
-- =============================================================================

drop policy if exists "sb_select" on schedule_blocks;
drop policy if exists "sb_insert" on schedule_blocks;
drop policy if exists "sb_update" on schedule_blocks;
drop policy if exists "sb_delete" on schedule_blocks;

-- SELECT: admin = all workspace blocks; manager = own + managed team blocks; employee = own only
create policy "sb_select" on schedule_blocks
  for select using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or user_id = _chrona_user_id()
      or (
        _chrona_user_role() = 'manager'
        and _chrona_manages_user(user_id)
      )
    )
  );

-- INSERT: same scope — managers can create blocks for their team members
create policy "sb_insert" on schedule_blocks
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or user_id = _chrona_user_id()
      or (
        _chrona_user_role() = 'manager'
        and _chrona_manages_user(user_id)
      )
    )
  );

-- UPDATE
create policy "sb_update" on schedule_blocks
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or user_id = _chrona_user_id()
      or (
        _chrona_user_role() = 'manager'
        and _chrona_manages_user(user_id)
      )
    )
  );

-- DELETE
create policy "sb_delete" on schedule_blocks
  for delete using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or user_id = _chrona_user_id()
      or (
        _chrona_user_role() = 'manager'
        and _chrona_manages_user(user_id)
      )
    )
  );

-- =============================================================================
-- Fix 2: Enable RLS on all core tables
-- =============================================================================

-- ── workspaces ────────────────────────────────────────────────────────────────
-- Users may only see the workspace they belong to.
-- Workspace creation/deletion is done via service role (not client), so no
-- INSERT/UPDATE/DELETE policies are needed here.

alter table workspaces enable row level security;

create policy "ws_select" on workspaces
  for select using (
    id = _chrona_workspace_id()
  );

-- ── users ─────────────────────────────────────────────────────────────────────
-- Everyone in a workspace can read the user list (needed for task assignment,
-- planner, team views). Only admins or the user themselves can update a row.

alter table users enable row level security;

create policy "users_select" on users
  for select using (
    workspace_id = _chrona_workspace_id()
  );

-- Inserting users is done via the invite/sign-up flow using a service role key.
-- No client-side INSERT policy is needed.

create policy "users_update" on users
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or id = _chrona_user_id()
    )
  );

-- ── teams ─────────────────────────────────────────────────────────────────────
-- All workspace members can read teams.
-- Only admins may create or delete teams.
-- Admins and the team's own manager may update a team.

alter table teams enable row level security;

create policy "teams_select" on teams
  for select using (
    workspace_id = _chrona_workspace_id()
  );

create policy "teams_insert" on teams
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  );

create policy "teams_update" on teams
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or (
        _chrona_user_role() = 'manager'
        and manager_id = _chrona_user_id()
      )
    )
  );

create policy "teams_delete" on teams
  for delete using (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  );

-- ── team_members ──────────────────────────────────────────────────────────────
-- All workspace members can read team membership.
-- Admins or the team's manager may add/remove members.

alter table team_members enable row level security;

create policy "tm_select" on team_members
  for select using (
    exists (
      select 1 from teams t
      where  t.id           = team_members.team_id
        and  t.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tm_insert" on team_members
  for insert with check (
    exists (
      select 1 from teams t
      where  t.id           = team_members.team_id
        and  t.workspace_id = _chrona_workspace_id()
        and  (
          _chrona_user_role() = 'admin'
          or (
            _chrona_user_role() = 'manager'
            and t.manager_id = _chrona_user_id()
          )
        )
    )
  );

create policy "tm_delete" on team_members
  for delete using (
    exists (
      select 1 from teams t
      where  t.id           = team_members.team_id
        and  t.workspace_id = _chrona_workspace_id()
        and  (
          _chrona_user_role() = 'admin'
          or (
            _chrona_user_role() = 'manager'
            and t.manager_id = _chrona_user_id()
          )
        )
    )
  );

-- ── projects ──────────────────────────────────────────────────────────────────
-- All workspace members can read projects.
-- Admins or the team's manager may create / update.
-- Only admins may delete.
-- projects has a direct workspace_id column, so no join needed.

alter table projects enable row level security;

create policy "projects_select" on projects
  for select using (
    workspace_id = _chrona_workspace_id()
  );

create policy "projects_insert" on projects
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or (
        _chrona_user_role() = 'manager'
        and exists (
          select 1 from teams t
          where  t.id           = projects.team_id
            and  t.workspace_id = _chrona_workspace_id()
            and  t.manager_id   = _chrona_user_id()
        )
      )
    )
  );

create policy "projects_update" on projects
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or (
        _chrona_user_role() = 'manager'
        and exists (
          select 1 from teams t
          where  t.id           = projects.team_id
            and  t.workspace_id = _chrona_workspace_id()
            and  t.manager_id   = _chrona_user_id()
        )
      )
    )
  );

create policy "projects_delete" on projects
  for delete using (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  );

-- ── tasks ─────────────────────────────────────────────────────────────────────
-- All workspace members can read tasks (cross-team visibility is intentional
-- for a small-team product — tasks have to be assignable across teams).
-- Any workspace member may create a task for themselves.
-- Admins, managers, the primary owner, and collaborators may update.
-- Only admins and the creator may delete.

alter table tasks enable row level security;

create policy "tasks_select" on tasks
  for select using (
    workspace_id = _chrona_workspace_id()
  );

create policy "tasks_insert" on tasks
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and creator_id = _chrona_user_id()
  );

create policy "tasks_update" on tasks
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() in ('admin', 'manager')
      or primary_owner_id = _chrona_user_id()
      or exists (
        select 1 from task_collaborators tc
        where  tc.task_id = tasks.id
          and  tc.user_id = _chrona_user_id()
      )
    )
  );

create policy "tasks_delete" on tasks
  for delete using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or creator_id = _chrona_user_id()
    )
  );

-- ── task_collaborators ────────────────────────────────────────────────────────
-- All workspace members can read collaborator links.
-- Admins, managers, and the task's primary owner may add/remove collaborators.

alter table task_collaborators enable row level security;

create policy "tc_select" on task_collaborators
  for select using (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_collaborators.task_id
        and  ta.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tc_insert" on task_collaborators
  for insert with check (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_collaborators.task_id
        and  ta.workspace_id = _chrona_workspace_id()
        and  (
          _chrona_user_role() in ('admin', 'manager')
          or ta.primary_owner_id = _chrona_user_id()
        )
    )
  );

create policy "tc_delete" on task_collaborators
  for delete using (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_collaborators.task_id
        and  ta.workspace_id = _chrona_workspace_id()
        and  (
          _chrona_user_role() in ('admin', 'manager')
          or ta.primary_owner_id = _chrona_user_id()
        )
    )
  );

-- ── task_comments ─────────────────────────────────────────────────────────────
-- All workspace members can read comments.
-- Any workspace member may create a comment (enforces author_id = self).
-- Only the author or an admin may update/delete their comment.

alter table task_comments enable row level security;

create policy "tcom_select" on task_comments
  for select using (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_comments.task_id
        and  ta.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tcom_insert" on task_comments
  for insert with check (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_comments.task_id
        and  ta.workspace_id = _chrona_workspace_id()
    )
    and author_id = _chrona_user_id()
  );

create policy "tcom_update" on task_comments
  for update using (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_comments.task_id
        and  ta.workspace_id = _chrona_workspace_id()
    )
    and (
      _chrona_user_role() = 'admin'
      or author_id = _chrona_user_id()
    )
  );

create policy "tcom_delete" on task_comments
  for delete using (
    exists (
      select 1 from tasks ta
      where  ta.id           = task_comments.task_id
        and  ta.workspace_id = _chrona_workspace_id()
    )
    and (
      _chrona_user_role() = 'admin'
      or author_id = _chrona_user_id()
    )
  );
