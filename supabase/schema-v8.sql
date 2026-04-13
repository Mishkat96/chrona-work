-- =============================================================================
-- Chrona Work — Phase 6.5 Security Migration
-- Run in the Supabase SQL editor AFTER schema-v7.sql
-- =============================================================================

-- ── New helper: does the current manager lead the given team? ─────────────────
-- Complements _chrona_manages_user (v7). Used to scope tasks_update.

create or replace function _chrona_manages_team(target_team_id uuid)
returns boolean
  language sql security definer stable as $$
    select exists (
      select 1 from teams t
      where  t.id           = target_team_id
        and  t.manager_id   = _chrona_user_id()
        and  t.workspace_id = _chrona_workspace_id()
    )
  $$;

-- =============================================================================
-- Fix 1: Tighten tasks_update — managers scoped to their own teams
-- =============================================================================
-- Previous policy (v7) allowed ANY manager to update ANY workspace task.
-- New policy: manager may only update tasks belonging to teams they lead,
-- OR tasks where they are the primary owner or a collaborator.

drop policy if exists "tasks_update" on tasks;

create policy "tasks_update" on tasks
  for update using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or primary_owner_id = _chrona_user_id()
      or exists (
        select 1 from task_collaborators tc
        where  tc.task_id = tasks.id
          and  tc.user_id = _chrona_user_id()
      )
      or (
        _chrona_user_role() = 'manager'
        and _chrona_manages_team(team_id)
      )
    )
  );

-- =============================================================================
-- Fix 2: Prevent role escalation on users_update via WITH CHECK
-- =============================================================================
-- Previous policy (v7) had no WITH CHECK — a user updating their own row
-- could write any value to the `role` column.
-- New WITH CHECK: non-admins can only update their own row if they keep
-- the same role value they currently hold.

drop policy if exists "users_update" on users;

create policy "users_update" on users
  for update
  using (
    workspace_id = _chrona_workspace_id()
    and (
      _chrona_user_role() = 'admin'
      or id = _chrona_user_id()
    )
  )
  with check (
    workspace_id = _chrona_workspace_id()
    and (
      -- Admins may change any column, including role
      _chrona_user_role() = 'admin'
      -- Non-admins may only update their own row and must not change their role
      or (
        id        = _chrona_user_id()
        and role  = _chrona_user_role()   -- new role must equal current role
      )
    )
  );

-- =============================================================================
-- Fix 3: Enable RLS on invites — admin-only writes
-- =============================================================================
-- Previously: alter table invites disable row level security (schema-v5.sql)
-- Now: only workspace admins can read, create, or revoke invites.

alter table invites enable row level security;

-- SELECT: admins can view all pending + accepted invites for their workspace
create policy "invites_select" on invites
  for select using (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  );

-- INSERT: admin only; invited_by must be the calling user
create policy "invites_insert" on invites
  for insert with check (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
    and invited_by = _chrona_user_id()
  );

-- UPDATE: not needed (invites are accepted via sign-up flow, not client updates)

-- DELETE: admin only (for revoking pending invites)
create policy "invites_delete" on invites
  for delete using (
    workspace_id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  );
