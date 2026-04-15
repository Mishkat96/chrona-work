-- =============================================================================
-- Chrona Work — Phase 8 Security Hardening
-- Run in the Supabase SQL editor AFTER schema-v9.sql
-- =============================================================================

-- ── 1. workspaces — add INSERT + UPDATE policies ──────────────────────────────
-- schema-v7 added SELECT only. We need INSERT so the sign-up flow can create
-- a workspace from the browser client, and UPDATE so admins can rename it.
-- Deletion is intentionally not allowed from the client.

create policy "ws_insert" on workspaces
  for insert with check (
    -- Any authenticated user may create a workspace (sign-up flow)
    auth.uid() is not null
  );

create policy "ws_update" on workspaces
  for update using (
    -- Only admins of this workspace may update its details
    id = _chrona_workspace_id()
    and _chrona_user_role() = 'admin'
  )
  with check (
    id = _chrona_workspace_id()
  );

-- ── 2. users — add INSERT policy ─────────────────────────────────────────────
-- schema-v7 allows SELECT and UPDATE but not INSERT from the client.
-- The sign-up / invite-accept flows call createUserInDb from the browser,
-- so we need an INSERT policy. We require auth_id = auth.uid() to prevent
-- a user creating rows on behalf of someone else.

create policy "users_insert" on users
  for insert with check (
    auth_id = auth.uid()::text
  );

-- ── 3. task_comments — enable RLS + add policies ──────────────────────────────
-- task_comments was created in schema.sql but never had RLS enabled.
-- All workspace members may read comments on tasks they can see.
-- Only the comment author may update or delete their own comments.
-- Activity comments (type = 'activity') are written by the system but still
-- carry a valid author_id, so the same policies apply.

alter table task_comments enable row level security;

create policy "tcomments_select" on task_comments
  for select using (
    exists (
      select 1 from tasks t
      where  t.id           = task_comments.task_id
        and  t.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tcomments_insert" on task_comments
  for insert with check (
    author_id = _chrona_user_id()
    and exists (
      select 1 from tasks t
      where  t.id           = task_comments.task_id
        and  t.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tcomments_update" on task_comments
  for update using (
    author_id = _chrona_user_id()
    and exists (
      select 1 from tasks t
      where  t.id           = task_comments.task_id
        and  t.workspace_id = _chrona_workspace_id()
    )
  );

create policy "tcomments_delete" on task_comments
  for delete using (
    author_id = _chrona_user_id()
    and exists (
      select 1 from tasks t
      where  t.id           = task_comments.task_id
        and  t.workspace_id = _chrona_workspace_id()
    )
  );
