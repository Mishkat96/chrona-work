-- =============================================================================
-- Chrona Work — Demo Seed Data (Phase 3)
-- Run this AFTER schema.sql in the Supabase SQL editor.
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- =============================================================================

-- ── Workspace ─────────────────────────────────────────────────────────────────

insert into workspaces (id, name, plan) values
  ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'growth')
on conflict (id) do nothing;

-- ── Users ─────────────────────────────────────────────────────────────────────

insert into users (id, workspace_id, name, email, role, job_title, department, initials, online_status, workload, tasks_assigned, tasks_completed, availability) values
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-111111111111', 'Sarah Chen',    's.chen@acmecorp.com',    'admin',    'Head of Operations',  'Operations',  'SC', 'online',  45, 3,  2,  40),
  ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-111111111111', 'Olivia Chen',   'o.chen@company.com',    'employee', 'Product Designer',    'Design',      'OC', 'online',  92, 14, 9,  40),
  ('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-111111111111', 'James Kwon',    'j.kwon@company.com',    'manager',  'Engineering Lead',    'Engineering', 'JK', 'online',  78, 11, 7,  40),
  ('22222222-2222-2222-2222-000000000004', '11111111-1111-1111-1111-111111111111', 'Priya Nair',    'p.nair@company.com',    'manager',  'Product Manager',     'Product',     'PN', 'away',    55, 8,  6,  32),
  ('22222222-2222-2222-2222-000000000005', '11111111-1111-1111-1111-111111111111', 'Marcus Reid',   'm.reid@company.com',    'manager',  'Marketing Lead',      'Marketing',   'MR', 'online',  38, 6,  5,  40),
  ('22222222-2222-2222-2222-000000000006', '11111111-1111-1111-1111-111111111111', 'Sofia Alvarez', 's.alvarez@company.com', 'employee', 'Frontend Engineer',   'Engineering', 'SA', 'online',  67, 9,  5,  40),
  ('22222222-2222-2222-2222-000000000007', '11111111-1111-1111-1111-111111111111', 'Ethan Brooks',  'e.brooks@company.com',  'employee', 'Data Analyst',        'Analytics',   'EB', 'offline', 44, 7,  6,  32),
  ('22222222-2222-2222-2222-000000000008', '11111111-1111-1111-1111-111111111111', 'Aisha Okafor',  'a.okafor@company.com',  'employee', 'Backend Engineer',    'Engineering', 'AO', 'online',  81, 12, 8,  40),
  ('22222222-2222-2222-2222-000000000009', '11111111-1111-1111-1111-111111111111', 'David Park',    'd.park@company.com',    'employee', 'Customer Success',    'CS',          'DP', 'away',    60, 9,  7,  40)
on conflict (id) do nothing;

-- ── Teams ─────────────────────────────────────────────────────────────────────

insert into teams (id, workspace_id, name, department, manager_id) values
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', 'Engineering',      'Engineering', '22222222-2222-2222-2222-000000000003'),
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', 'Design',           'Design',      '22222222-2222-2222-2222-000000000002'),
  ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', 'Product',          'Product',     '22222222-2222-2222-2222-000000000004'),
  ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', 'Marketing',        'Marketing',   '22222222-2222-2222-2222-000000000005'),
  ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', 'Analytics',        'Analytics',   '22222222-2222-2222-2222-000000000007'),
  ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', 'Customer Success', 'CS',          '22222222-2222-2222-2222-000000000009')
on conflict (id) do nothing;

-- ── Team members ──────────────────────────────────────────────────────────────

insert into team_members (team_id, user_id) values
  -- Engineering
  ('33333333-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000003'),
  ('33333333-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000006'),
  ('33333333-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000008'),
  -- Design
  ('33333333-3333-3333-3333-000000000002', '22222222-2222-2222-2222-000000000002'),
  -- Product
  ('33333333-3333-3333-3333-000000000003', '22222222-2222-2222-2222-000000000004'),
  -- Marketing
  ('33333333-3333-3333-3333-000000000004', '22222222-2222-2222-2222-000000000005'),
  -- Analytics
  ('33333333-3333-3333-3333-000000000005', '22222222-2222-2222-2222-000000000007'),
  -- CS
  ('33333333-3333-3333-3333-000000000006', '22222222-2222-2222-2222-000000000009')
on conflict do nothing;

-- ── Projects ─────────────────────────────────────────────────────────────────

insert into projects (id, workspace_id, team_id, name, description, color, status) values
  ('44444444-4444-4444-4444-000000000001', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000001', 'Platform v2.4',      'Core platform stability and feature work for Q2.',              'indigo',  'active'),
  ('44444444-4444-4444-4444-000000000002', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000001', 'Platform Security',  'Security hardening: rate limiting, auth modernisation.',        'red',     'active'),
  ('44444444-4444-4444-4444-000000000003', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000002', 'Product v2.4',       'Onboarding and UX improvements for v2.4.',                      'violet',  'active'),
  ('44444444-4444-4444-4444-000000000004', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000002', 'Design System',      'Component audit and documentation.',                            'purple',  'active'),
  ('44444444-4444-4444-4444-000000000005', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000003', 'Quarterly Planning', 'Q2 roadmap, competitive analysis.',                             'blue',    'active'),
  ('44444444-4444-4444-4444-000000000006', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000004', 'Marketing Q2',       'Spring campaigns and content.',                                 'amber',   'active'),
  ('44444444-4444-4444-4444-000000000007', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000005', 'Data Platform',      'Internal analytics tooling.',                                   'emerald', 'active'),
  ('44444444-4444-4444-4444-000000000008', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-000000000006', 'CS Q2',              'Customer success and retention.',                               'rose',    'active')
on conflict (id) do nothing;

-- ── Tasks ─────────────────────────────────────────────────────────────────────

insert into tasks (id, workspace_id, title, description, status, priority, due_date, primary_owner_id, creator_id, team_id, project_id, blocked_reason, tags, estimated_hours, logged_hours, created_at, updated_at) values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Redesign onboarding flow',
   'Rework the user onboarding screens to improve activation rate.',
   'in_progress', 'high', '2026-04-15',
   '22222222-2222-2222-2222-000000000002', '22222222-2222-2222-2222-000000000004',
   '33333333-3333-3333-3333-000000000002', '44444444-4444-4444-4444-000000000003',
   null, array['design','ux'], 16, 9,
   '2026-04-01 09:00:00+00', '2026-04-11 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'API rate limiting implementation',
   'Add per-tenant rate limiting middleware to the gateway.',
   'in_progress', 'critical', '2026-04-13',
   '22222222-2222-2222-2222-000000000003', '22222222-2222-2222-2222-000000000003',
   '33333333-3333-3333-3333-000000000001', '44444444-4444-4444-4444-000000000002',
   null, array['engineering','infra'], 8, 3,
   '2026-04-02 09:00:00+00', '2026-04-10 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Q2 roadmap presentation',
   'Prepare slides for the Q2 roadmap board presentation.',
   'in_progress', 'high', '2026-04-14',
   '22222222-2222-2222-2222-000000000004', '22222222-2222-2222-2222-000000000004',
   '33333333-3333-3333-3333-000000000003', '44444444-4444-4444-4444-000000000005',
   null, array['product','strategy'], 6, 5,
   '2026-04-03 09:00:00+00', '2026-04-11 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Launch email campaign — Spring promo',
   'Set up and QA the Spring promotional email sequence.',
   'not_started', 'medium', '2026-04-18',
   '22222222-2222-2222-2222-000000000005', '22222222-2222-2222-2222-000000000005',
   '33333333-3333-3333-3333-000000000004', '44444444-4444-4444-4444-000000000006',
   null, array['marketing','email'], 5, 0,
   '2026-04-04 09:00:00+00', '2026-04-04 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Fix dashboard chart render bug',
   'Charts flicker on load in Safari. Traced to hydration mismatch.',
   'blocked', 'critical', '2026-04-12',
   '22222222-2222-2222-2222-000000000006', '22222222-2222-2222-2222-000000000006',
   '33333333-3333-3333-3333-000000000001', '44444444-4444-4444-4444-000000000001',
   'Waiting on Safari reproduction environment from DevOps.',
   array['engineering','bug'], 4, 2,
   '2026-04-05 09:00:00+00', '2026-04-10 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Usage analytics dashboard',
   'Build internal dashboard to track feature adoption metrics.',
   'in_progress', 'medium', '2026-04-20',
   '22222222-2222-2222-2222-000000000007', '22222222-2222-2222-2222-000000000007',
   '33333333-3333-3333-3333-000000000005', '44444444-4444-4444-4444-000000000007',
   null, array['analytics','data'], 12, 4,
   '2026-04-02 09:00:00+00', '2026-04-10 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Migrate auth service to new JWT library',
   'Replace legacy auth library with jose for better edge support.',
   'not_started', 'high', '2026-04-22',
   '22222222-2222-2222-2222-000000000008', '22222222-2222-2222-2222-000000000003',
   '33333333-3333-3333-3333-000000000001', '44444444-4444-4444-4444-000000000002',
   null, array['engineering','auth'], 10, 0,
   '2026-04-06 09:00:00+00', '2026-04-06 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Churn risk follow-up calls',
   'Reach out to 12 at-risk accounts identified in last week''s review.',
   'in_progress', 'high', '2026-04-13',
   '22222222-2222-2222-2222-000000000009', '22222222-2222-2222-2222-000000000009',
   '33333333-3333-3333-3333-000000000006', '44444444-4444-4444-4444-000000000008',
   null, array['customer-success','retention'], 6, 2,
   '2026-04-07 09:00:00+00', '2026-04-10 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Design system component audit',
   'Document all inconsistencies across the design system.',
   'not_started', 'medium', '2026-04-25',
   '22222222-2222-2222-2222-000000000002', '22222222-2222-2222-2222-000000000002',
   '33333333-3333-3333-3333-000000000002', '44444444-4444-4444-4444-000000000004',
   null, array['design','system'], 8, 0,
   '2026-04-06 09:00:00+00', '2026-04-06 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Set up CI/CD for new microservice',
   'Configure GitHub Actions pipeline for the new notifications service.',
   'done', 'high', '2026-04-10',
   '22222222-2222-2222-2222-000000000003', '22222222-2222-2222-2222-000000000003',
   '33333333-3333-3333-3333-000000000001', '44444444-4444-4444-4444-000000000001',
   null, array['engineering','devops'], 5, 5,
   '2026-04-01 09:00:00+00', '2026-04-10 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Competitor feature analysis',
   'Map competitors'' new feature releases against our roadmap gaps.',
   'not_started', 'low', '2026-04-28',
   '22222222-2222-2222-2222-000000000004', '22222222-2222-2222-2222-000000000004',
   '33333333-3333-3333-3333-000000000003', '44444444-4444-4444-4444-000000000005',
   null, array['product','research'], 6, 0,
   '2026-04-07 09:00:00+00', '2026-04-07 09:00:00+00'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Refactor billing module',
   'Decompose the monolithic billing code into discrete service calls.',
   'in_progress', 'medium', '2026-04-24',
   '22222222-2222-2222-2222-000000000008', '22222222-2222-2222-2222-000000000008',
   '33333333-3333-3333-3333-000000000001', '44444444-4444-4444-4444-000000000001',
   null, array['engineering','refactor'], 14, 5,
   '2026-04-03 09:00:00+00', '2026-04-10 09:00:00+00');

-- ── Task collaborators ────────────────────────────────────────────────────────
-- NOTE: Since tasks use gen_random_uuid(), we reference them by title match.

insert into task_collaborators (task_id, user_id)
select t.id, '22222222-2222-2222-2222-000000000004'
from tasks t where t.title = 'Redesign onboarding flow' and t.workspace_id = '11111111-1111-1111-1111-111111111111'
on conflict do nothing;

insert into task_collaborators (task_id, user_id)
select t.id, '22222222-2222-2222-2222-000000000008'
from tasks t where t.title = 'API rate limiting implementation' and t.workspace_id = '11111111-1111-1111-1111-111111111111'
on conflict do nothing;

insert into task_collaborators (task_id, user_id)
select t.id, '22222222-2222-2222-2222-000000000003'
from tasks t where t.title = 'Fix dashboard chart render bug' and t.workspace_id = '11111111-1111-1111-1111-111111111111'
on conflict do nothing;

insert into task_collaborators (task_id, user_id)
select t.id, '22222222-2222-2222-2222-000000000006'
from tasks t where t.title = 'Refactor billing module' and t.workspace_id = '11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- ── Seed activity comments for a few tasks ────────────────────────────────────

insert into task_comments (task_id, author_id, body, type, created_at)
select t.id, '22222222-2222-2222-2222-000000000002', 'Task created.', 'activity', '2026-04-01 09:00:00+00'
from tasks t where t.title = 'Redesign onboarding flow' and t.workspace_id = '11111111-1111-1111-1111-111111111111';

insert into task_comments (task_id, author_id, body, type, created_at)
select t.id, '22222222-2222-2222-2222-000000000006', 'Logged 2h of debugging — narrowed it down to the SSR hydration boundary.', 'comment', '2026-04-10 14:00:00+00'
from tasks t where t.title = 'Fix dashboard chart render bug' and t.workspace_id = '11111111-1111-1111-1111-111111111111';

insert into task_comments (task_id, author_id, body, type, created_at)
select t.id, '22222222-2222-2222-2222-000000000006', 'Status changed from "Not Started" to "Blocked".', 'activity', '2026-04-10 15:00:00+00'
from tasks t where t.title = 'Fix dashboard chart render bug' and t.workspace_id = '11111111-1111-1111-1111-111111111111';
