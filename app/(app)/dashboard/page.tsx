"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Zap, Activity, Users, BarChart3, ChevronRight,
  AlertCircle, Building2, UserCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge } from "@/components/app/TaskStatusBadge";
import { PriorityBadge } from "@/components/app/PriorityBadge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { aiInsights, weeklyCompletionData } from "@/lib/mock-data";
import { useTasks } from "@/lib/store-context";
import { todayStr } from "@/lib/store";
import { formatRelative } from "@/lib/utils";
import {
  getWorkspaceStats,
  getTeamStats,
  getOverdueTasks,
  getBlockedTasks,
  getDueThisWeek,
  getMyTasks,
  getOwnedTasks,
  getCollaboratingTasks,
  getUserOpenTaskCount,
  getManagedTeamTasks,
} from "@/lib/selectors";
import Link from "next/link";

// ── Shared helpers ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, delta, trend, icon: Icon, color, bg, delay = 0,
}: {
  label: string; value: string; delta: string;
  trend: "up" | "warn" | "ok";
  icon: React.ElementType; color: string; bg: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
          <div className={`text-xs font-medium ${
            trend === "up"   ? "text-emerald-600" :
            trend === "warn" ? "text-amber-600"   : "text-muted-foreground"
          }`}>
            {delta}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const activityTypeIcon = {
  task:     Activity,
  comment:  Activity,
  assign:   Users,
  complete: CheckCircle2,
  create:   Zap,
};

// ── Admin Dashboard ────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { tasks, users, teams, projects, currentUser } = useTasks();
  const today = todayStr();
  const ws    = useMemo(() => getWorkspaceStats(tasks, today), [tasks, today]);

  const teamMemberUsers = users.filter((u) => u.id !== currentUser?.id);
  const topMembers      = teamMemberUsers.slice(0, 5);
  const activeTasks     = useMemo(
    () => tasks.filter((t) => t.status === "in_progress" || t.status === "blocked").slice(0, 5),
    [tasks]
  );

  const statCards = [
    {
      label: "Total Tasks",   value: String(ws.total),
      delta: `${ws.done} completed`, trend: "ok" as const,
      icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-50",
    },
    {
      label: "Users",          value: String(users.length),
      delta: `${teams.length} teams`,  trend: "ok" as const,
      icon: Users, color: "text-emerald-500", bg: "bg-emerald-50",
    },
    {
      label: "Overdue",        value: String(ws.overdue),
      delta: ws.overdue > 0 ? "Needs attention" : "On track", trend: ws.overdue > 0 ? "warn" as const : "ok" as const,
      icon: AlertCircle, color: ws.overdue > 0 ? "text-amber-500" : "text-emerald-500",
      bg:   ws.overdue > 0 ? "bg-amber-50"    : "bg-emerald-50",
    },
    {
      label: "Completion Rate", value: `${ws.completionRate}%`,
      delta: `${ws.blocked} blocked`, trend: ws.blocked > 0 ? "warn" as const : "up" as const,
      icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Good morning, {currentUser?.name?.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Workspace overview — {ws.dueToday > 0 ? `${ws.dueToday} tasks due today` : "All caught up today"}
            {ws.overdue > 0 && (
              <span className="text-red-500 font-medium"> · {ws.overdue} overdue</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/team"><Button variant="outline" size="sm"><Building2 className="w-4 h-4" /> Manage teams</Button></Link>
          <Link href="/tasks"><Button size="sm"><Zap className="w-4 h-4" /> New task</Button></Link>
        </div>
      </div>

      {ws.overdue > 0 && (
        <Link href="/tasks">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50/60 cursor-pointer hover:bg-red-50 transition-colors">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">
              {ws.overdue} task{ws.overdue !== 1 ? "s are" : " is"} past due date and not completed.
            </p>
            <span className="ml-auto text-xs font-semibold text-red-500 flex items-center gap-1">
              View overdue <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      {/* Teams overview */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Completion Trend</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Created vs completed · last 10 weeks</p>
              </div>
              <Badge variant="success" className="text-xs">+18% velocity</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyCompletionData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="created"   stroke="#a78bfa" strokeWidth={2} fill="url(#createdGrad)"   name="Created"   dot={false} />
                <Area type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} fill="url(#completedGrad)" name="Completed" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <CardTitle>AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.slice(0, 3).map((ins) => {
              const styles = {
                warning:    { border: "border-amber-200 bg-amber-50/60",   iconColor: "text-amber-500",  Icon: AlertTriangle },
                suggestion: { border: "border-indigo-200 bg-indigo-50/60", iconColor: "text-indigo-500", Icon: Sparkles },
                info:       { border: "border-blue-200 bg-blue-50/60",     iconColor: "text-blue-500",   Icon: Activity },
                success:    { border: "border-emerald-200 bg-emerald-50/60", iconColor: "text-emerald-500", Icon: CheckCircle2 },
              }[ins.type];
              return (
                <div key={ins.id} className={`rounded-xl border p-3 ${styles.border}`}>
                  <div className="flex items-start gap-2.5">
                    <styles.Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${styles.iconColor}`} />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-0.5">{ins.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active tasks */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Active Tasks</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No active tasks.</p>
              )}
              {activeTasks.map((task) => {
                const owner   = users.find((u) => u.id === task.primaryOwnerId);
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                        <PriorityBadge priority={task.priority} className="text-[10px] shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <TaskStatusBadge status={task.status} variant="pill" />
                        <span className="text-xs text-muted-foreground">{project?.name ?? "—"}</span>
                        <span className="text-xs text-muted-foreground">Due {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{task.loggedHours}/{task.estimatedHours}h</span>
                      {owner && <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team workload */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Team Workload</CardTitle>
              <Link href="/team">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  Manage <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <UserAvatar initials={member.initials} onlineStatus={member.onlineStatus} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate">{member.name}</span>
                      <span className={`text-xs font-bold ${
                        member.workload >= 85 ? "text-red-500" :
                        member.workload >= 70 ? "text-amber-500" : "text-emerald-500"
                      }`}>{member.workload}%</span>
                    </div>
                    <Progress
                      value={member.workload}
                      className="h-1.5"
                      indicatorClassName={
                        member.workload >= 85 ? "bg-red-400" :
                        member.workload >= 70 ? "bg-amber-400" : "bg-emerald-400"
                      }
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {getUserOpenTaskCount(tasks, member.id)}t
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teams summary */}
        <Card className="col-span-12">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Teams Overview</CardTitle>
              <Link href="/team">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  Manage teams <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map((team) => {
                const stats   = getTeamStats(tasks, team, users, today);
                const manager = users.find((u) => u.id === team.managerId);
                return (
                  <div key={team.id} className="p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.memberIds.length} members</p>
                      </div>
                      {stats.blocked > 0 && (
                        <Badge variant="danger" className="text-[10px]">{stats.blocked} blocked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{stats.open} open</span>
                      {stats.overdue > 0 && <span className="text-red-500 font-medium">{stats.overdue} overdue</span>}
                    </div>
                    <Progress value={stats.avgWorkload} className="h-1 mt-2" />
                    {manager && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Lead: {manager.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Manager Dashboard ──────────────────────────────────────────────────────────

function ManagerDashboard() {
  const { tasks, users, teams, projects, currentUser } = useTasks();
  const today = todayStr();

  const myTeams = teams.filter((t) => t.managerId === currentUser?.id);
  const teamTasks = useMemo(
    () => (currentUser ? getManagedTeamTasks(tasks, teams, currentUser.id) : []),
    [tasks, teams, currentUser]
  );

  const overdue  = getOverdueTasks(teamTasks, today);
  const blocked  = getBlockedTasks(teamTasks);
  const dueWeek  = getDueThisWeek(teamTasks, today);

  const statCards = [
    {
      label: "Team Tasks",     value: String(teamTasks.length),
      delta: `${teamTasks.filter((t) => t.status === "done").length} done`,
      trend: "ok" as const, icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-50",
    },
    {
      label: "Due This Week",  value: String(dueWeek.length),
      delta: "Upcoming deadlines", trend: dueWeek.length > 3 ? "warn" as const : "ok" as const,
      icon: Clock, color: dueWeek.length > 3 ? "text-amber-500" : "text-emerald-500",
      bg:   dueWeek.length > 3 ? "bg-amber-50" : "bg-emerald-50",
    },
    {
      label: "Blocked",        value: String(blocked.length),
      delta: blocked.length > 0 ? "Needs unblocking" : "All clear",
      trend: blocked.length > 0 ? "warn" as const : "ok" as const,
      icon: AlertTriangle, color: blocked.length > 0 ? "text-red-500" : "text-emerald-500",
      bg:   blocked.length > 0 ? "bg-red-50" : "bg-emerald-50",
    },
    {
      label: "Overdue",        value: String(overdue.length),
      delta: overdue.length > 0 ? "Past due date" : "On track",
      trend: overdue.length > 0 ? "warn" as const : "ok" as const,
      icon: AlertCircle, color: overdue.length > 0 ? "text-amber-500" : "text-emerald-500",
      bg:   overdue.length > 0 ? "bg-amber-50" : "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Good morning, {currentUser?.name?.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {myTeams.map((t) => t.name).join(", ")} overview
            {overdue.length > 0 && (
              <span className="text-red-500 font-medium"> · {overdue.length} overdue</span>
            )}
          </p>
        </div>
        <Link href="/tasks">
          <Button size="sm"><Zap className="w-4 h-4" /> New task</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Due this week */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Due This Week</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  All tasks <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueWeek.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks due this week.</p>
              )}
              {dueWeek.slice(0, 6).map((task) => {
                const owner   = users.find((u) => u.id === task.primaryOwnerId);
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                        <PriorityBadge priority={task.priority} className="text-[10px] shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground">Due {task.dueDate} · {project?.name ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TaskStatusBadge status={task.status} variant="pill" />
                      {owner && <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team member workload */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Team Workload</CardTitle>
              <Link href="/team">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  Manage <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTeams.flatMap((team) =>
                team.memberIds.map((uid) => users.find((u) => u.id === uid)).filter(Boolean)
              ).map((member) => {
                if (!member) return null;
                const openCount = getUserOpenTaskCount(teamTasks, member.id);
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <UserAvatar initials={member.initials} onlineStatus={member.onlineStatus} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate">{member.name}</span>
                        <span className={`text-xs font-bold ${
                          member.workload >= 85 ? "text-red-500" :
                          member.workload >= 70 ? "text-amber-500" : "text-emerald-500"
                        }`}>{member.workload}%</span>
                      </div>
                      <Progress
                        value={member.workload}
                        className="h-1.5"
                        indicatorClassName={
                          member.workload >= 85 ? "bg-red-400" :
                          member.workload >= 70 ? "bg-amber-400" : "bg-emerald-400"
                        }
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{openCount}t</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Blocked tasks */}
        {blocked.length > 0 && (
          <Card className="col-span-12">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600">Blocked Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blocked.map((task) => {
                  const owner = users.find((u) => u.id === task.primaryOwnerId);
                  return (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50/40">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {task.blockedReason && (
                          <p className="text-xs text-red-500 mt-0.5">{task.blockedReason}</p>
                        )}
                      </div>
                      {owner && (
                        <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Employee Dashboard ─────────────────────────────────────────────────────────

function EmployeeDashboard() {
  const { tasks, users, projects, currentUser } = useTasks();
  const today = todayStr();

  if (!currentUser) return null;

  const myTasks       = getMyTasks(tasks, currentUser.id);
  const owned         = getOwnedTasks(tasks, currentUser.id);
  const collaborating = getCollaboratingTasks(tasks, currentUser.id);
  const overdue       = getOverdueTasks(owned, today);
  const dueWeek       = getDueThisWeek(owned, today);
  const blocked       = getBlockedTasks(owned);
  const done          = owned.filter((t) => t.status === "done");

  const statCards = [
    {
      label: "My Tasks",      value: String(owned.length),
      delta: `${done.length} done`,
      trend: "ok" as const, icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-50",
    },
    {
      label: "Due This Week", value: String(dueWeek.length),
      delta: dueWeek.length > 0 ? "Upcoming deadlines" : "Nothing urgent",
      trend: dueWeek.length > 2 ? "warn" as const : "ok" as const,
      icon: Clock, color: dueWeek.length > 2 ? "text-amber-500" : "text-emerald-500",
      bg:   dueWeek.length > 2 ? "bg-amber-50" : "bg-emerald-50",
    },
    {
      label: "Overdue",       value: String(overdue.length),
      delta: overdue.length > 0 ? "Needs attention" : "On track",
      trend: overdue.length > 0 ? "warn" as const : "ok" as const,
      icon: AlertCircle, color: overdue.length > 0 ? "text-red-500" : "text-emerald-500",
      bg:   overdue.length > 0 ? "bg-red-50" : "bg-emerald-50",
    },
    {
      label: "Collaborating", value: String(collaborating.length),
      delta: "Tasks I support",
      trend: "ok" as const, icon: UserCheck, color: "text-violet-500", bg: "bg-violet-50",
    },
  ];

  // Recent comments on my tasks
  const recentComments = owned
    .flatMap((t) =>
      t.comments
        .filter((c) => c.type === "comment" && c.authorId !== currentUser.id)
        .map((c) => ({ ...c, taskTitle: t.title }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Good morning, {currentUser.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {myTasks.filter((t) => t.status !== "done").length} active tasks
            {overdue.length > 0 && (
              <span className="text-red-500 font-medium"> · {overdue.length} overdue</span>
            )}
          </p>
        </div>
        <Link href="/tasks">
          <Button size="sm"><CheckCircle2 className="w-4 h-4" /> My tasks</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* My active tasks */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>My Active Tasks</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  See all <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {owned.filter((t) => t.status !== "done").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No active tasks. Great work!</p>
              )}
              {owned
                .filter((t) => t.status !== "done")
                .slice(0, 6)
                .map((task) => {
                  const project  = projects.find((p) => p.id === task.projectId);
                  const isOver   = task.dueDate && task.dueDate < today;
                  return (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isOver ? "border-red-200 bg-red-50/30" : "border-border hover:bg-muted/40"
                    }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                          {isOver && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Due {task.dueDate || "—"} · {project?.name ?? "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TaskStatusBadge status={task.status} variant="pill" />
                        <PriorityBadge priority={task.priority} className="text-[10px]" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 lg:col-span-5 space-y-5">
          {/* Personal workload */}
          <Card>
            <CardHeader className="pb-2"><CardTitle>My Workload</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Capacity</span>
                <span className="font-semibold text-foreground">{currentUser.workload}%</span>
              </div>
              <Progress
                value={currentUser.workload}
                className="h-3 rounded-full"
                indicatorClassName={
                  currentUser.workload >= 85 ? "bg-red-400" :
                  currentUser.workload >= 70 ? "bg-amber-400" : "bg-emerald-400"
                }
              />
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[
                  { label: "Assigned", value: currentUser.tasksAssigned },
                  { label: "Done",     value: currentUser.tasksCompleted },
                  { label: "Hours/wk", value: `${currentUser.availability}h` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/60 rounded-lg p-2">
                    <p className="text-lg font-bold text-foreground">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collaborating on */}
          {collaborating.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle>Collaborating On</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {collaborating.slice(0, 4).map((task) => {
                    const owner = users.find((u) => u.id === task.primaryOwnerId);
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Owner: {owner?.name ?? "—"}
                          </p>
                        </div>
                        <TaskStatusBadge status={task.status} variant="pill" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent comments on my tasks */}
          {recentComments.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle>Recent Comments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentComments.map((c) => {
                    const author = users.find((u) => u.id === c.authorId);
                    return (
                      <div key={c.id} className="flex gap-2 items-start">
                        <UserAvatar initials={author?.initials ?? "?"} size="xs" className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-foreground">
                            {author?.name ?? "Unknown"}
                            <span className="font-normal text-muted-foreground"> on {c.taskTitle}</span>
                          </p>
                          <p className="text-[11px] text-foreground leading-relaxed">{c.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Role router ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser, loading } = useTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-88px)]">
        <div className="text-sm text-muted-foreground">Loading dashboard…</div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (currentUser.role === "admin")   return <AdminDashboard />;
  if (currentUser.role === "manager") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
