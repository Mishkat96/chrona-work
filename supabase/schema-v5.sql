-- =============================================================================
-- Chrona Work — Phase 5 Schema Migration
-- Run this in the Supabase SQL editor AFTER schema.sql + seed.sql
-- =============================================================================

-- ── Add auth_id to users ──────────────────────────────────────────────────────
-- Links our app user rows to Supabase auth.users.
-- Populated on first sign-in via the linkAuthId() repository call.

alter table users
  add column if not exists auth_id text unique;

create index if not exists users_auth_id_idx on users (auth_id);
create index if not exists users_email_idx   on users (email);

-- ── Invites ───────────────────────────────────────────────────────────────────
-- Admin creates an invite for a new team member.
-- When the invitee signs up with the matching email they are linked to this
-- workspace with the specified role / team.

create table if not exists invites (
  id            uuid        primary key default gen_random_uuid(),
  workspace_id  uuid        not null references workspaces(id) on delete cascade,
  email         text        not null,
  role          text        not null default 'employee'
                            check (role in ('admin', 'manager', 'employee')),
  team_id       uuid        references teams(id) on delete set null,
  invited_by    uuid        references users(id) on delete set null,
  accepted      boolean     not null default false,
  created_at    timestamptz not null default now(),
  unique (workspace_id, email)
);

alter table invites disable row level security;
