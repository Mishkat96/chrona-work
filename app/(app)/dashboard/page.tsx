"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Zap, Activity, Users, BarChart3, ChevronRight,
  AlertCircle,
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
import {
  users, projects, aiInsights, activityFeed, weeklyCompletionData
} from "@/lib/mock-data";
import { useTasks } from "@/lib/store-context";
import { todayStr } from "@/lib/store";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

// ── Helpers ────────────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: typeof aiInsights[0] }) {
  const styles = {
    warning:    { border: "border-amber-200 bg-amber-50/60",   icon: AlertTriangle, iconColor: "text-amber-500",  badge: "warning"  as const },
    suggestion: { border: "border-indigo-200 bg-indigo-50/60", icon: Sparkles,      iconColor: "text-indigo-500", badge: "default"  as const },
    info:       { border: "border-blue-200 bg-blue-50/60",     icon: Activity,      iconColor: "text-blue-500",   badge: "info"     as const },
    success:    { border: "border-emerald-200 bg-emerald-50/60", icon: CheckCircle2, iconColor: "text-emerald-500", badge: "success" as const },
  }[insight.type];

  const Icon = styles.icon;
  return (
    <div className={`rounded-xl border p-4 ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground mb-0.5">{insight.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
          {insight.action && (
            <button className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              {insight.action} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const activityTypeIcon = {
  task:     Activity,
  comment:  Activity,
  assign:   Users,
  complete: CheckCircle2,
  create:   Zap,
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tasks } = useTasks();

  const today = todayStr();

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total       = tasks.length;
    const dueToday    = tasks.filter(
      (t) => t.dueDate === today && t.status !== "done"
    ).length;
    const blocked     = tasks.filter((t) => t.status === "blocked").length;
    const done        = tasks.filter((t) => t.status === "done").length;
    const overdue     = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    ).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // Average workload across team (static per user, but derived live)
    const avgWorkload = Math.round(
      users.filter((u) => u.id !== "u0").reduce((s, u) => s + u.workload, 0) /
        users.filter((u) => u.id !== "u0").length
    );

    return { total, dueToday, blocked, done, overdue, completionRate, avgWorkload };
  }, [tasks, today]);

  const statCards = [
    {
      label: "Total Tasks",
      value: String(stats.total),
      delta: `${stats.done} completed`,
      trend: "ok" as const,
      icon: CheckCircle2,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Due Today",
      value: String(stats.dueToday),
      delta: stats.overdue > 0 ? `${stats.overdue} overdue` : "On track",
      trend: stats.overdue > 0 ? ("warn" as const) : ("ok" as const),
      icon: Clock,
      color: stats.overdue > 0 ? "text-amber-500" : "text-emerald-500",
      bg: stats.overdue > 0 ? "bg-amber-50" : "bg-emerald-50",
    },
    {
      label: "Team Utilisation",
      value: `${stats.avgWorkload}%`,
      delta: stats.avgWorkload >= 85 ? "Overloaded" : stats.avgWorkload >= 70 ? "Healthy range" : "Under capacity",
      trend: "ok" as const,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      delta: `${stats.blocked} task${stats.blocked !== 1 ? "s" : ""} blocked`,
      trend: stats.blocked > 0 ? ("warn" as const) : ("up" as const),
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  // Active tasks for the table (in-progress + due today, capped at 5)
  const activeTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "in_progress" || t.status === "blocked")
        .slice(0, 5),
    [tasks]
  );

  const topMembers = users.filter((u) => u.id !== "u0").slice(0, 5);
  const recentActivity = activityFeed.slice(0, 6);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Good morning, Sarah</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.dueToday > 0
              ? `${stats.dueToday} task${stats.dueToday !== 1 ? "s" : ""} need${stats.dueToday === 1 ? "s" : ""} attention today`
              : "All caught up for today"}
            {stats.overdue > 0 && (
              <span className="text-red-500 font-medium">
                {" "}· {stats.overdue} overdue
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4" /> Export report
          </Button>
          <Link href="/tasks">
            <Button size="sm">
              <Zap className="w-4 h-4" /> New task
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue banner */}
      {stats.overdue > 0 && (
        <Link href="/tasks">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50/60 cursor-pointer hover:bg-red-50 transition-colors">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">
              {stats.overdue} task{stats.overdue !== 1 ? "s are" : " is"} past due date and not completed.
            </p>
            <span className="ml-auto text-xs font-semibold text-red-500 flex items-center gap-1">
              View overdue <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, delta, trend, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
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
                <div
                  className={`text-xs font-medium ${
                    trend === "up"   ? "text-emerald-600" :
                    trend === "warn" ? "text-amber-600"   :
                    "text-muted-foreground"
                  }`}
                >
                  {delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-5">

        {/* Completion trend chart */}
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
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  itemStyle={{ color: "#374151" }}
                />
                <Area type="monotone" dataKey="created"   stroke="#a78bfa" strokeWidth={2} fill="url(#createdGrad)"   name="Created"   dot={false} />
                <Area type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} fill="url(#completedGrad)" name="Completed" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-2">
              {[{ color: "#4f46e5", label: "Completed" }, { color: "#a78bfa", label: "Created" }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <CardTitle>AI Insights</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Recommendations for today</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.slice(0, 4).map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
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
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active tasks right now.
                </p>
              )}
              {activeTasks.map((task) => {
                const owner   = users.find((u) => u.id === task.primaryOwnerId);
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer">
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
                      <div className="text-xs text-muted-foreground">{task.loggedHours}/{task.estimatedHours}h</div>
                      {owner && (
                        <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />
                      )}
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
                      <span
                        className={`text-xs font-bold ${
                          member.workload >= 85 ? "text-red-500" :
                          member.workload >= 70 ? "text-amber-500" :
                          "text-emerald-500"
                        }`}
                      >
                        {member.workload}%
                      </span>
                    </div>
                    <Progress
                      value={member.workload}
                      className="h-1.5"
                      indicatorClassName={
                        member.workload >= 85 ? "bg-red-400" :
                        member.workload >= 70 ? "bg-amber-400" :
                        "bg-emerald-400"
                      }
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {tasks.filter((t) => t.primaryOwnerId === member.id && t.status !== "done").length}t
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="col-span-12">
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentActivity.map((item) => {
                const Icon = activityTypeIcon[item.type];
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{item.actor}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelative(item.time)}
                    </span>
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
