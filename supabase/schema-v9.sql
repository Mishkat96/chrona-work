-- =============================================================================
-- Chrona Work — Phase 7 Data Model + Notifications Migration
-- Run in the Supabase SQL editor AFTER schema-v8.sql
-- =============================================================================

-- ── 1. Remove team_id from projects ──────────────────────────────────────────
-- Projects are now workspace-scoped resources. Team membership is managed
-- through project_members. Tasks retain their own team_id.
--
-- The v7 policies projects_insert and projects_update reference team_id, so
-- they must be dropped first. They are replaced below with workspace-scoped
-- versions that match the new data model.

drop policy if exists "projects_insert" on projects;
drop policy if exists "projects_update" on projects;

alter table projects drop column if exists team_id;

-- Recreate projects_insert: admins and managers can create workspace projects
create policy "projects_insert" on projects
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() in ('admin', 'manager')
  );

-- Recreate projects_update: admins and managers can update workspace projects
create policy "projects_update" on projects
  for update using (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() in ('admin', 'manager')
  );

-- ── 2. project_members ───────────────────────────────────────────────────────
-- Tracks which users participate in a project and in what capacity.

create table if not exists project_members (
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references users(id)    on delete cascade,
  role       text not null default 'contributor',
  added_at   timestamptz not null default now(),
  primary key (project_id, user_id),
  constraint project_members_role_check check (role in ('lead', 'contributor'))
);

create index if not exists project_members_project_idx on project_members(project_id);
create index if not exists project_members_user_idx    on project_members(user_id);

alter table project_members enable row level security;

-- Any workspace member may read project membership
create policy "project_members_select" on project_members
  for select using (
    exists (
      select 1 from projects p
      where  p.id           = project_members.project_id
        and  p.workspace_id = _chrona_workspace_id()
    )
  );

-- Admins and managers can add members
create policy "project_members_insert" on project_members
  for insert with check (
    _chrona_user_role() in ('admin', 'manager')
    and exists (
      select 1 from projects p
      where  p.id           = project_members.project_id
        and  p.workspace_id = _chrona_workspace_id()
    )
  );

-- Admins and managers can remove members
create policy "project_members_delete" on project_members
  for delete using (
    _chrona_user_role() in ('admin', 'manager')
    and exists (
      select 1 from projects p
      where  p.id           = project_members.project_id
        and  p.workspace_id = _chrona_workspace_id()
    )
  );

-- ── 3. notifications ─────────────────────────────────────────────────────────
-- In-app notification feed. Created server-side or by client actions.

create table if not exists notifications (
  id           uuid        primary key default gen_random_uuid(),
  workspace_id uuid        not null references workspaces(id) on delete cascade,
  user_id      uuid        not null references users(id)      on delete cascade,
  type         text        not null,
  title        text        not null,
  body         text        not null,
  task_id      uuid        references tasks(id) on delete set null,
  read         boolean     not null default false,
  created_at   timestamptz not null default now(),
  constraint notifications_type_check check (
    type in ('task_assigned', 'task_status_changed', 'comment_added')
  )
);

create index if not exists notifications_user_idx
  on notifications(user_id, workspace_id, created_at desc);

alter table notifications enable row level security;

-- Users can only read their own notifications
create policy "notifications_select" on notifications
  for select using (
    workspace_id = _chrona_workspace_id()
    and user_id  = _chrona_user_id()
  );

-- Any authenticated workspace member may insert notifications for others
create policy "notifications_insert" on notifications
  for insert with check (
    workspace_id = _chrona_workspace_id()
  );

-- Users can only mark their own notifications as read
create policy "notifications_update" on notifications
  for update
  using (
    workspace_id = _chrona_workspace_id()
    and user_id  = _chrona_user_id()
  )
  with check (
    workspace_id = _chrona_workspace_id()
    and user_id  = _chrona_user_id()
  );
