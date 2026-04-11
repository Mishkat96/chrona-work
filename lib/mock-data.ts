// ─── Team Members ────────────────────────────────────────────────────────────

export type Status = "online" | "away" | "offline";
export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  initials: string;
  status: Status;
  workload: number; // 0-100
  tasksAssigned: number;
  tasksCompleted: number;
  availability: number; // hours per week
  email: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "tm1",
    name: "Olivia Chen",
    role: "Product Designer",
    department: "Design",
    avatar: "",
    initials: "OC",
    status: "online",
    workload: 92,
    tasksAssigned: 14,
    tasksCompleted: 9,
    availability: 40,
    email: "o.chen@company.com",
  },
  {
    id: "tm2",
    name: "James Kwon",
    role: "Engineering Lead",
    department: "Engineering",
    avatar: "",
    initials: "JK",
    status: "online",
    workload: 78,
    tasksAssigned: 11,
    tasksCompleted: 7,
    availability: 40,
    email: "j.kwon@company.com",
  },
  {
    id: "tm3",
    name: "Priya Nair",
    role: "Product Manager",
    department: "Product",
    avatar: "",
    initials: "PN",
    status: "away",
    workload: 55,
    tasksAssigned: 8,
    tasksCompleted: 6,
    availability: 32,
    email: "p.nair@company.com",
  },
  {
    id: "tm4",
    name: "Marcus Reid",
    role: "Marketing Lead",
    department: "Marketing",
    avatar: "",
    initials: "MR",
    status: "online",
    workload: 38,
    tasksAssigned: 6,
    tasksCompleted: 5,
    availability: 40,
    email: "m.reid@company.com",
  },
  {
    id: "tm5",
    name: "Sofia Alvarez",
    role: "Frontend Engineer",
    department: "Engineering",
    avatar: "",
    initials: "SA",
    status: "online",
    workload: 67,
    tasksAssigned: 9,
    tasksCompleted: 5,
    availability: 40,
    email: "s.alvarez@company.com",
  },
  {
    id: "tm6",
    name: "Ethan Brooks",
    role: "Data Analyst",
    department: "Analytics",
    avatar: "",
    initials: "EB",
    status: "offline",
    workload: 44,
    tasksAssigned: 7,
    tasksCompleted: 6,
    availability: 32,
    email: "e.brooks@company.com",
  },
  {
    id: "tm7",
    name: "Aisha Okafor",
    role: "Backend Engineer",
    department: "Engineering",
    avatar: "",
    initials: "AO",
    status: "online",
    workload: 81,
    tasksAssigned: 12,
    tasksCompleted: 8,
    availability: 40,
    email: "a.okafor@company.com",
  },
  {
    id: "tm8",
    name: "David Park",
    role: "Customer Success",
    department: "CS",
    avatar: "",
    initials: "DP",
    status: "away",
    workload: 60,
    tasksAssigned: 9,
    tasksCompleted: 7,
    availability: 40,
    email: "d.park@company.com",
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string; // TeamMember id
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
  estimatedHours: number;
  loggedHours: number;
  project: string;
  createdAt: string;
}

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Redesign onboarding flow",
    description: "Rework the user onboarding screens to improve activation rate.",
    assignee: "tm1",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-04-15",
    tags: ["design", "ux"],
    estimatedHours: 16,
    loggedHours: 9,
    project: "Product v2.4",
    createdAt: "2026-04-01",
  },
  {
    id: "t2",
    title: "API rate limiting implementation",
    description: "Add per-tenant rate limiting middleware to the gateway.",
    assignee: "tm2",
    priority: "critical",
    status: "in_progress",
    dueDate: "2026-04-13",
    tags: ["engineering", "infra"],
    estimatedHours: 8,
    loggedHours: 3,
    project: "Platform Security",
    createdAt: "2026-04-02",
  },
  {
    id: "t3",
    title: "Q2 roadmap presentation",
    description: "Prepare slides for the Q2 roadmap board presentation.",
    assignee: "tm3",
    priority: "high",
    status: "review",
    dueDate: "2026-04-14",
    tags: ["product", "strategy"],
    estimatedHours: 6,
    loggedHours: 5,
    project: "Quarterly Planning",
    createdAt: "2026-04-03",
  },
  {
    id: "t4",
    title: "Launch email campaign — Spring promo",
    description: "Set up and QA the Spring promotional email sequence.",
    assignee: "tm4",
    priority: "medium",
    status: "todo",
    dueDate: "2026-04-18",
    tags: ["marketing", "email"],
    estimatedHours: 5,
    loggedHours: 0,
    project: "Marketing Q2",
    createdAt: "2026-04-04",
  },
  {
    id: "t5",
    title: "Fix dashboard chart render bug",
    description: "Charts flicker on load in Safari. Traced to hydration mismatch.",
    assignee: "tm5",
    priority: "critical",
    status: "blocked",
    dueDate: "2026-04-12",
    tags: ["engineering", "bug"],
    estimatedHours: 4,
    loggedHours: 2,
    project: "Platform v2.4",
    createdAt: "2026-04-05",
  },
  {
    id: "t6",
    title: "Usage analytics dashboard",
    description: "Build internal dashboard to track feature adoption metrics.",
    assignee: "tm6",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-04-20",
    tags: ["analytics", "data"],
    estimatedHours: 12,
    loggedHours: 4,
    project: "Data Platform",
    createdAt: "2026-04-02",
  },
  {
    id: "t7",
    title: "Migrate auth service to new JWT library",
    description: "Replace legacy auth library with jose for better edge support.",
    assignee: "tm7",
    priority: "high",
    status: "todo",
    dueDate: "2026-04-22",
    tags: ["engineering", "auth"],
    estimatedHours: 10,
    loggedHours: 0,
    project: "Platform Security",
    createdAt: "2026-04-06",
  },
  {
    id: "t8",
    title: "Churn risk follow-up calls",
    description: "Reach out to 12 at-risk accounts identified in last week's review.",
    assignee: "tm8",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-04-13",
    tags: ["customer-success", "retention"],
    estimatedHours: 6,
    loggedHours: 2,
    project: "CS Q2",
    createdAt: "2026-04-07",
  },
  {
    id: "t9",
    title: "Design system component audit",
    description: "Document all inconsistencies across the design system.",
    assignee: "tm1",
    priority: "medium",
    status: "todo",
    dueDate: "2026-04-25",
    tags: ["design", "system"],
    estimatedHours: 8,
    loggedHours: 0,
    project: "Design System",
    createdAt: "2026-04-06",
  },
  {
    id: "t10",
    title: "Set up CI/CD for new microservice",
    description: "Configure GitHub Actions pipeline for the new notifications service.",
    assignee: "tm2",
    priority: "high",
    status: "done",
    dueDate: "2026-04-10",
    tags: ["engineering", "devops"],
    estimatedHours: 5,
    loggedHours: 5,
    project: "Platform v2.4",
    createdAt: "2026-04-01",
  },
  {
    id: "t11",
    title: "Competitor feature analysis",
    description: "Map competitors' new feature releases against our roadmap gaps.",
    assignee: "tm3",
    priority: "low",
    status: "todo",
    dueDate: "2026-04-28",
    tags: ["product", "research"],
    estimatedHours: 6,
    loggedHours: 0,
    project: "Quarterly Planning",
    createdAt: "2026-04-07",
  },
  {
    id: "t12",
    title: "Refactor billing module",
    description: "Decompose the monolithic billing code into discrete service calls.",
    assignee: "tm7",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-04-24",
    tags: ["engineering", "refactor"],
    estimatedHours: 14,
    loggedHours: 5,
    project: "Platform v2.4",
    createdAt: "2026-04-03",
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
    affectedMember: "tm1",
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
    affectedMember: "tm4",
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

// ─── Activity Feed ────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "task" | "comment" | "assign" | "complete" | "create";
}

export const activityFeed: ActivityItem[] = [
  { id: "a1", actor: "James Kwon", action: "completed", target: "Set up CI/CD pipeline", time: "2026-04-11T08:14:00", type: "complete" },
  { id: "a2", actor: "Priya Nair", action: "moved to review", target: "Q2 roadmap presentation", time: "2026-04-11T07:50:00", type: "task" },
  { id: "a3", actor: "Olivia Chen", action: "logged 3h on", target: "Redesign onboarding flow", time: "2026-04-11T07:30:00", type: "task" },
  { id: "a4", actor: "Aisha Okafor", action: "created task", target: "Refactor billing module", time: "2026-04-10T17:20:00", type: "create" },
  { id: "a5", actor: "Marcus Reid", action: "commented on", target: "Spring promo campaign", time: "2026-04-10T16:45:00", type: "comment" },
  { id: "a6", actor: "Sofia Alvarez", action: "assigned to herself", target: "Fix dashboard chart bug", time: "2026-04-10T15:10:00", type: "assign" },
  { id: "a7", actor: "David Park", action: "updated status on", target: "Churn risk follow-up calls", time: "2026-04-10T14:00:00", type: "task" },
  { id: "a8", actor: "Ethan Brooks", action: "logged 2h on", target: "Usage analytics dashboard", time: "2026-04-10T13:30:00", type: "task" },
];

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

export const workloadDistributionData = [
  { name: "Olivia Chen", workload: 92, tasks: 14 },
  { name: "James Kwon", workload: 78, tasks: 11 },
  { name: "Aisha Okafor", workload: 81, tasks: 12 },
  { name: "Sofia Alvarez", workload: 67, tasks: 9 },
  { name: "David Park", workload: 60, tasks: 9 },
  { name: "Priya Nair", workload: 55, tasks: 8 },
  { name: "Ethan Brooks", workload: 44, tasks: 7 },
  { name: "Marcus Reid", workload: 38, tasks: 6 },
];

export const taskStatusBreakdown = [
  { name: "Done", value: 14, color: "#10b981" },
  { name: "In Progress", value: 28, color: "#4f46e5" },
  { name: "Review", value: 8, color: "#f59e0b" },
  { name: "Blocked", value: 5, color: "#ef4444" },
  { name: "To Do", value: 17, color: "#94a3b8" },
];

export const departmentVelocity = [
  { dept: "Engineering", velocity: 87, target: 80 },
  { dept: "Design", velocity: 72, target: 75 },
  { dept: "Product", velocity: 91, target: 85 },
  { dept: "Marketing", velocity: 65, target: 70 },
  { dept: "Analytics", velocity: 78, target: 75 },
  { dept: "CS", velocity: 84, target: 80 },
];

// ─── Planner / Schedule ───────────────────────────────────────────────────────

export interface ScheduleBlock {
  id: string;
  title: string;
  member: string;
  day: number; // 0=Mon … 4=Fri
  startHour: number;
  duration: number; // hours
  type: "task" | "meeting" | "focus" | "blocked";
  color: string;
}

export const scheduleBlocks: ScheduleBlock[] = [
  { id: "sb1", title: "Onboarding redesign", member: "tm1", day: 0, startHour: 9, duration: 3, type: "task", color: "indigo" },
  { id: "sb2", title: "Design review", member: "tm1", day: 2, startHour: 14, duration: 1, type: "meeting", color: "violet" },
  { id: "sb3", title: "Component audit", member: "tm1", day: 4, startHour: 10, duration: 2, type: "task", color: "indigo" },
  { id: "sb4", title: "API rate limiting", member: "tm2", day: 0, startHour: 10, duration: 4, type: "focus", color: "blue" },
  { id: "sb5", title: "CI/CD setup", member: "tm2", day: 1, startHour: 9, duration: 3, type: "task", color: "blue" },
  { id: "sb6", title: "Eng sync", member: "tm2", day: 2, startHour: 10, duration: 1, type: "meeting", color: "violet" },
  { id: "sb7", title: "Roadmap prep", member: "tm3", day: 0, startHour: 9, duration: 2, type: "task", color: "indigo" },
  { id: "sb8", title: "Stakeholder 1:1", member: "tm3", day: 1, startHour: 14, duration: 1, type: "meeting", color: "violet" },
  { id: "sb9", title: "Spring campaign", member: "tm4", day: 1, startHour: 10, duration: 3, type: "task", color: "indigo" },
  { id: "sb10", title: "Chart bug fix", member: "tm5", day: 0, startHour: 14, duration: 2, type: "task", color: "red" },
  { id: "sb11", title: "Frontend deep work", member: "tm5", day: 2, startHour: 9, duration: 4, type: "focus", color: "blue" },
  { id: "sb12", title: "Analytics build", member: "tm6", day: 0, startHour: 13, duration: 3, type: "task", color: "indigo" },
  { id: "sb13", title: "Auth migration", member: "tm7", day: 1, startHour: 9, duration: 4, type: "focus", color: "blue" },
  { id: "sb14", title: "Billing refactor", member: "tm7", day: 3, startHour: 10, duration: 4, type: "task", color: "indigo" },
  { id: "sb15", title: "Churn follow-ups", member: "tm8", day: 0, startHour: 10, duration: 2, type: "task", color: "indigo" },
  { id: "sb16", title: "CS team standup", member: "tm8", day: 2, startHour: 9, duration: 1, type: "meeting", color: "violet" },
];

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
