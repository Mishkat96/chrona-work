// ─── Primitive types ──────────────────────────────────────────────────────────

export type UserRole     = "admin" | "manager" | "employee";
export type OnlineStatus = "online" | "away" | "offline";
export type Priority     = "critical" | "high" | "medium" | "low";
export type TaskStatus   = "not_started" | "in_progress" | "blocked" | "done";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  /** Structured app role — drives permissions in future phases. */
  role: UserRole;
  /** Human-readable job title, e.g. "Product Designer". */
  jobTitle: string;
  department: string;
  initials: string;
  onlineStatus: OnlineStatus;
  workload: number;       // 0–100 — percentage of capacity currently used
  tasksAssigned: number;
  tasksCompleted: number;
  availability: number;   // scheduled hours per week
  email: string;
  /** Supabase auth.users.id — populated after first sign-in (Phase 5). */
  authId?: string;
}

export const users: User[] = [
  // ── u0: logged-in admin (Sarah Chen) ───────────────────────────────────────
  {
    id: "u0",
    name: "Sarah Chen",
    role: "admin",
    jobTitle: "Head of Operations",
    department: "Operations",
    initials: "SC",
    onlineStatus: "online",
    workload: 45,
    tasksAssigned: 3,
    tasksCompleted: 2,
    availability: 40,
    email: "s.chen@acmecorp.com",
  },
  // ── u1–u8: team members ────────────────────────────────────────────────────
  {
    id: "u1",
    name: "Olivia Chen",
    role: "employee",
    jobTitle: "Product Designer",
    department: "Design",
    initials: "OC",
    onlineStatus: "online",
    workload: 92,
    tasksAssigned: 14,
    tasksCompleted: 9,
    availability: 40,
    email: "o.chen@company.com",
  },
  {
    id: "u2",
    name: "James Kwon",
    role: "manager",
    jobTitle: "Engineering Lead",
    department: "Engineering",
    initials: "JK",
    onlineStatus: "online",
    workload: 78,
    tasksAssigned: 11,
    tasksCompleted: 7,
    availability: 40,
    email: "j.kwon@company.com",
  },
  {
    id: "u3",
    name: "Priya Nair",
    role: "manager",
    jobTitle: "Product Manager",
    department: "Product",
    initials: "PN",
    onlineStatus: "away",
    workload: 55,
    tasksAssigned: 8,
    tasksCompleted: 6,
    availability: 32,
    email: "p.nair@company.com",
  },
  {
    id: "u4",
    name: "Marcus Reid",
    role: "manager",
    jobTitle: "Marketing Lead",
    department: "Marketing",
    initials: "MR",
    onlineStatus: "online",
    workload: 38,
    tasksAssigned: 6,
    tasksCompleted: 5,
    availability: 40,
    email: "m.reid@company.com",
  },
  {
    id: "u5",
    name: "Sofia Alvarez",
    role: "employee",
    jobTitle: "Frontend Engineer",
    department: "Engineering",
    initials: "SA",
    onlineStatus: "online",
    workload: 67,
    tasksAssigned: 9,
    tasksCompleted: 5,
    availability: 40,
    email: "s.alvarez@company.com",
  },
  {
    id: "u6",
    name: "Ethan Brooks",
    role: "employee",
    jobTitle: "Data Analyst",
    department: "Analytics",
    initials: "EB",
    onlineStatus: "offline",
    workload: 44,
    tasksAssigned: 7,
    tasksCompleted: 6,
    availability: 32,
    email: "e.brooks@company.com",
  },
  {
    id: "u7",
    name: "Aisha Okafor",
    role: "employee",
    jobTitle: "Backend Engineer",
    department: "Engineering",
    initials: "AO",
    onlineStatus: "online",
    workload: 81,
    tasksAssigned: 12,
    tasksCompleted: 8,
    availability: 40,
    email: "a.okafor@company.com",
  },
  {
    id: "u8",
    name: "David Park",
    role: "employee",
    jobTitle: "Customer Success",
    department: "CS",
    initials: "DP",
    onlineStatus: "away",
    workload: 60,
    tasksAssigned: 9,
    tasksCompleted: 7,
    availability: 40,
    email: "d.park@company.com",
  },
];

/**
 * Backwards-compatibility alias.
 * planner/page.tsx imports `teamMembers` and only accesses id, name, initials —
 * all of which are unchanged. This alias keeps that page working without edits.
 */
export const teamMembers = users.filter((u) => u.id !== "u0");

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  department: string;
  memberIds: string[];
  managerId: string;
}

export const teams: Team[] = [
  {
    id: "team-eng",
    name: "Engineering",
    department: "Engineering",
    memberIds: ["u2", "u5", "u7"],
    managerId: "u2",
  },
  {
    id: "team-design",
    name: "Design",
    department: "Design",
    memberIds: ["u1"],
    managerId: "u1",
  },
  {
    id: "team-product",
    name: "Product",
    department: "Product",
    memberIds: ["u3"],
    managerId: "u3",
  },
  {
    id: "team-mkt",
    name: "Marketing",
    department: "Marketing",
    memberIds: ["u4"],
    managerId: "u4",
  },
  {
    id: "team-data",
    name: "Analytics",
    department: "Analytics",
    memberIds: ["u6"],
    managerId: "u6",
  },
  {
    id: "team-cs",
    name: "Customer Success",
    department: "CS",
    memberIds: ["u8"],
    managerId: "u8",
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;  // Tailwind colour key, e.g. "indigo"
  status: "active" | "paused" | "completed";
}

export const projects: Project[] = [
  {
    id: "proj-platform-v24",
    name: "Platform v2.4",
    description: "Core platform stability and feature work for Q2.",
    color: "indigo",
    status: "active",
  },
  {
    id: "proj-platform-sec",
    name: "Platform Security",
    description: "Security hardening: rate limiting, auth modernisation.",
    color: "red",
    status: "active",
  },
  {
    id: "proj-product-v24",
    name: "Product v2.4",
    description: "Onboarding and UX improvements for v2.4.",
    color: "violet",
    status: "active",
  },
  {
    id: "proj-design-sys",
    name: "Design System",
    description: "Component audit and documentation.",
    color: "purple",
    status: "active",
  },
  {
    id: "proj-q-plan",
    name: "Quarterly Planning",
    description: "Q2 roadmap, competitive analysis.",
    color: "blue",
    status: "active",
  },
  {
    id: "proj-mkt-q2",
    name: "Marketing Q2",
    description: "Spring campaigns and content.",
    color: "amber",
    status: "active",
  },
  {
    id: "proj-data-plat",
    name: "Data Platform",
    description: "Internal analytics tooling.",
    color: "emerald",
    status: "active",
  },
  {
    id: "proj-cs-q2",
    name: "CS Q2",
    description: "Customer success and retention.",
    color: "rose",
    status: "active",
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  /** "comment" = user-written note; "activity" = system-generated event log */
  type?: "comment" | "activity";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  /** The single person responsible for delivering this task. */
  primaryOwnerId: string;
  /** Others actively working on or reviewing this task. */
  collaboratorIds: string[];
  /** Who created the task. */
  creatorId: string;
  teamId: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  /** Required when status === "blocked". Explains the blocker. */
  blockedReason?: string;
  tags: string[];
  estimatedHours: number;
  loggedHours: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Redesign onboarding flow",
    description: "Rework the user onboarding screens to improve activation rate.",
    primaryOwnerId: "u1",
    collaboratorIds: ["u3"],
    creatorId: "u3",
    teamId: "team-design",
    projectId: "proj-product-v24",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-15",
    tags: ["design", "ux"],
    estimatedHours: 16,
    loggedHours: 9,
    comments: [],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-11",
  },
  {
    id: "t2",
    title: "API rate limiting implementation",
    description: "Add per-tenant rate limiting middleware to the gateway.",
    primaryOwnerId: "u2",
    collaboratorIds: ["u7"],
    creatorId: "u2",
    teamId: "team-eng",
    projectId: "proj-platform-sec",
    status: "in_progress",
    priority: "critical",
    dueDate: "2026-04-13",
    tags: ["engineering", "infra"],
    estimatedHours: 8,
    loggedHours: 3,
    comments: [],
    createdAt: "2026-04-02",
    updatedAt: "2026-04-10",
  },
  {
    id: "t3",
    title: "Q2 roadmap presentation",
    description: "Prepare slides for the Q2 roadmap board presentation.",
    primaryOwnerId: "u3",
    collaboratorIds: [],
    creatorId: "u3",
    teamId: "team-product",
    projectId: "proj-q-plan",
    status: "in_progress",  // was: "review" — merged into in_progress
    priority: "high",
    dueDate: "2026-04-14",
    tags: ["product", "strategy"],
    estimatedHours: 6,
    loggedHours: 5,
    comments: [],
    createdAt: "2026-04-03",
    updatedAt: "2026-04-11",
  },
  {
    id: "t4",
    title: "Launch email campaign — Spring promo",
    description: "Set up and QA the Spring promotional email sequence.",
    primaryOwnerId: "u4",
    collaboratorIds: [],
    creatorId: "u4",
    teamId: "team-mkt",
    projectId: "proj-mkt-q2",
    status: "not_started",  // was: "todo"
    priority: "medium",
    dueDate: "2026-04-18",
    tags: ["marketing", "email"],
    estimatedHours: 5,
    loggedHours: 0,
    comments: [],
    createdAt: "2026-04-04",
    updatedAt: "2026-04-04",
  },
  {
    id: "t5",
    title: "Fix dashboard chart render bug",
    description: "Charts flicker on load in Safari. Traced to hydration mismatch.",
    primaryOwnerId: "u5",
    collaboratorIds: ["u2"],
    creatorId: "u5",
    teamId: "team-eng",
    projectId: "proj-platform-v24",
    status: "blocked",
    priority: "critical",
    dueDate: "2026-04-12",
    blockedReason: "Waiting on Safari reproduction environment from DevOps.",
    tags: ["engineering", "bug"],
    estimatedHours: 4,
    loggedHours: 2,
    comments: [],
    createdAt: "2026-04-05",
    updatedAt: "2026-04-10",
  },
  {
    id: "t6",
    title: "Usage analytics dashboard",
    description: "Build internal dashboard to track feature adoption metrics.",
    primaryOwnerId: "u6",
    collaboratorIds: [],
    creatorId: "u6",
    teamId: "team-data",
    projectId: "proj-data-plat",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-04-20",
    tags: ["analytics", "data"],
    estimatedHours: 12,
    loggedHours: 4,
    comments: [],
    createdAt: "2026-04-02",
    updatedAt: "2026-04-10",
  },
  {
    id: "t7",
    title: "Migrate auth service to new JWT library",
    description: "Replace legacy auth library with jose for better edge support.",
    primaryOwnerId: "u7",
    collaboratorIds: [],
    creatorId: "u2",
    teamId: "team-eng",
    projectId: "proj-platform-sec",
    status: "not_started",  // was: "todo"
    priority: "high",
    dueDate: "2026-04-22",
    tags: ["engineering", "auth"],
    estimatedHours: 10,
    loggedHours: 0,
    comments: [],
    createdAt: "2026-04-06",
    updatedAt: "2026-04-06",
  },
  {
    id: "t8",
    title: "Churn risk follow-up calls",
    description: "Reach out to 12 at-risk accounts identified in last week's review.",
    primaryOwnerId: "u8",
    collaboratorIds: [],
    creatorId: "u8",
    teamId: "team-cs",
    projectId: "proj-cs-q2",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-13",
    tags: ["customer-success", "retention"],
    estimatedHours: 6,
    loggedHours: 2,
    comments: [],
    createdAt: "2026-04-07",
    updatedAt: "2026-04-10",
  },
  {
    id: "t9",
    title: "Design system component audit",
    description: "Document all inconsistencies across the design system.",
    primaryOwnerId: "u1",
    collaboratorIds: [],
    creatorId: "u1",
    teamId: "team-design",
    projectId: "proj-design-sys",
    status: "not_started",  // was: "todo"
    priority: "medium",
    dueDate: "2026-04-25",
    tags: ["design", "system"],
    estimatedHours: 8,
    loggedHours: 0,
    comments: [],
    createdAt: "2026-04-06",
    updatedAt: "2026-04-06",
  },
  {
    id: "t10",
    title: "Set up CI/CD for new microservice",
    description: "Configure GitHub Actions pipeline for the new notifications service.",
    primaryOwnerId: "u2",
    collaboratorIds: [],
    creatorId: "u2",
    teamId: "team-eng",
    projectId: "proj-platform-v24",
    status: "done",
    priority: "high",
    dueDate: "2026-04-10",
    tags: ["engineering", "devops"],
    estimatedHours: 5,
    loggedHours: 5,
    comments: [],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-10",
  },
  {
    id: "t11",
    title: "Competitor feature analysis",
    description: "Map competitors' new feature releases against our roadmap gaps.",
    primaryOwnerId: "u3",
    collaboratorIds: [],
    creatorId: "u3",
    teamId: "team-product",
    projectId: "proj-q-plan",
    status: "not_started",  // was: "todo"
    priority: "low",
    dueDate: "2026-04-28",
    tags: ["product", "research"],
    estimatedHours: 6,
    loggedHours: 0,
    comments: [],
    createdAt: "2026-04-07",
    updatedAt: "2026-04-07",
  },
  {
    id: "t12",
    title: "Refactor billing module",
    description: "Decompose the monolithic billing code into discrete service calls.",
    primaryOwnerId: "u7",
    collaboratorIds: ["u5"],
    creatorId: "u7",
    teamId: "team-eng",
    projectId: "proj-platform-v24",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-04-24",
    tags: ["engineering", "refactor"],
    estimatedHours: 14,
    loggedHours: 5,
    comments: [],
    createdAt: "2026-04-03",
    updatedAt: "2026-04-10",
  },
];

// ─── AI Insights ──────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  type: "warning" | "suggestion" | "info" | "success";
  title: string;
  body: string;
  action?: string;
  affectedMember?: string;
}

export const aiInsights: AIInsight[] = [
  {
    id: "ai1",
    type: "warning",
    title: "Olivia is overloaded this week",
    body: "Olivia has 14 active tasks and 92% workload. Two non-critical tasks can be moved to next week without impacting deadlines.",
    action: "Rebalance tasks",
    affectedMember: "u1",
  },
  {
    id: "ai2",
    type: "suggestion",
    title: "Move design review to Thursday",
    body: "The design review on Wednesday conflicts with 3 attendees' deep-work blocks. Thursday 2–3 PM has full team availability.",
    action: "Reschedule",
  },
  {
    id: "ai3",
    type: "info",
    title: "Marketing team has unused capacity",
    body: "Marcus has 40% capacity available this week. Consider assigning the social campaign brief that's currently unowned.",
    action: "Assign task",
    affectedMember: "u4",
  },
  {
    id: "ai4",
    type: "warning",
    title: "2 tasks at risk of missing deadline",
    body: "The Safari bug fix and API rate limiter are both due within 48 hours with less than 50% progress logged.",
    action: "View tasks",
  },
  {
    id: "ai5",
    type: "success",
    title: "Engineering velocity up 18% this sprint",
    body: "The team shipped 9 tasks vs 7.6 average. The new async standup format is correlating with faster unblocking.",
  },
  {
    id: "ai6",
    type: "suggestion",
    title: "Consider pairing Aisha and Sofia",
    body: "The billing refactor and frontend integration are tightly coupled. Pairing these engineers could reduce rework by ~30%.",
    action: "Create pair session",
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "task_assigned"
  | "task_status_changed"
  | "comment_added";

export interface Notification {
  id: string;
  workspaceId: string;
  /** Recipient user ID. */
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const weeklyCompletionData = [
  { week: "Feb W1", completed: 18, created: 22 },
  { week: "Feb W2", completed: 24, created: 20 },
  { week: "Feb W3", completed: 21, created: 25 },
  { week: "Feb W4", completed: 28, created: 26 },
  { week: "Mar W1", completed: 22, created: 24 },
  { week: "Mar W2", completed: 30, created: 27 },
  { week: "Mar W3", completed: 27, created: 23 },
  { week: "Mar W4", completed: 33, created: 30 },
  { week: "Apr W1", completed: 29, created: 28 },
  { week: "Apr W2", completed: 35, created: 31 },
];

// ─── Planner / Schedule ───────────────────────────────────────────────────────
// Real schedule blocks are stored in Supabase (schedule_blocks table).
// This type represents the app-layer shape after mapping from the DB row.

export type BlockKind = "task" | "focus" | "meeting" | "blocked";

export interface ScheduleBlock {
  id: string;
  workspaceId: string;
  userId: string;
  taskId?: string;
  teamId?: string;
  kind: BlockKind;
  title: string;
  startsAt: string; // ISO 8601 timestamp (UTC)
  endsAt: string;   // ISO 8601 timestamp (UTC)
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonials = [
  {
    quote: "Chrona Work cut our planning overhead by half. We stopped running on gut feeling and started running on data.",
    name: "Rachel Torres",
    title: "VP of Engineering",
    company: "Meridian Health",
    initials: "RT",
  },
  {
    quote: "The AI insights surface things our managers would miss. It flagged a workload imbalance that was quietly burning out two of our best engineers.",
    name: "Samuel Greene",
    title: "CTO",
    company: "Nexlayer",
    initials: "SG",
  },
  {
    quote: "We evaluated six tools. Chrona Work was the only one that understood time as a resource, not just a label on a task card.",
    name: "Jenna Malik",
    title: "Head of Operations",
    company: "Clearbridge Capital",
    initials: "JM",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const pricingPlans = [
  {
    name: "Starter",
    price: 12,
    description: "For small teams getting started with AI-assisted planning.",
    features: [
      "Up to 10 team members",
      "AI task assignment",
      "Weekly workload reports",
      "Planner & calendar",
      "Email support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: 28,
    description: "For scaling teams that need full AI visibility across projects.",
    features: [
      "Up to 50 team members",
      "Everything in Starter",
      "AI scheduling & rebalancing",
      "Advanced analytics",
      "Slack & calendar integrations",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "Custom deployments for large organisations and complex workflows.",
    features: [
      "Unlimited team members",
      "Everything in Growth",
      "SSO & SAML",
      "Custom AI models",
      "Dedicated success manager",
      "SLA & compliance",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];
