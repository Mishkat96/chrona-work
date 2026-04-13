"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTasks } from "@/lib/store-context";

const STATUS_COLORS: Record<string, string> = {
  not_started: "#94a3b8",
  in_progress: "#4f46e5",
  blocked:     "#ef4444",
  done:        "#10b981",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked:     "Blocked",
  done:        "Done",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function AnalyticsPage() {
  const { tasks, users, teams } = useTasks();

  const today = new Date().toISOString().slice(0, 10);

  // ── Summary stats ────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const total = tasks.length;
    const done  = tasks.filter((t) => t.status === "done").length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const delayed = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    ).length;
    const activeContributors = new Set(
      [
        ...tasks.map((t) => t.primaryOwnerId),
        ...tasks.flatMap((t) => t.collaboratorIds),
      ].filter(Boolean)
    ).size;
    return { total, done, completionRate, delayed, activeContributors };
  }, [tasks, today]);

  const summaryStats = [
    {
      label: "Completion rate",
      value: summary.total > 0 ? `${summary.completionRate}%` : "—",
      note:  `${summary.done} of ${summary.total} tasks done`,
      up:    true,
      icon:  CheckCircle2,
      color: "text-emerald-500",
      bg:    "bg-emerald-50",
    },
    {
      label: "In progress",
      value: String(tasks.filter((t) => t.status === "in_progress").length),
      note:  "active tasks",
      up:    true,
      icon:  Clock,
      color: "text-indigo-500",
      bg:    "bg-indigo-50",
    },
    {
      label: "Delayed tasks",
      value: String(summary.delayed),
      note:  summary.delayed === 0 ? "All on track" : "past due date",
      up:    summary.delayed === 0,
      icon:  AlertTriangle,
      color: "text-amber-500",
      bg:    "bg-amber-50",
    },
    {
      label: "Active contributors",
      value: String(summary.activeContributors),
      note:  "with assigned tasks",
      up:    true,
      icon:  Users,
      color: "text-violet-500",
      bg:    "bg-violet-50",
    },
  ];

  // ── Status breakdown (pie) ───────────────────────────────────────────────────
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      not_started: 0,
      in_progress: 0,
      blocked:     0,
      done:        0,
    };
    for (const t of tasks) {
      if (t.status in counts) counts[t.status]++;
    }
    return Object.entries(counts)
      .map(([status, value]) => ({
        name:  STATUS_LABELS[status] ?? status,
        value,
        color: STATUS_COLORS[status] ?? "#94a3b8",
      }))
      .filter((d) => d.value > 0);
  }, [tasks]);

  // ── Workload (horizontal bar) ────────────────────────────────────────────────
  const workloadData = useMemo(() => {
    // Count active (non-done) tasks per user as workload proxy
    const taskCount: Record<string, number> = {};
    for (const t of tasks) {
      if (t.status === "done") continue;
      if (t.primaryOwnerId) {
        taskCount[t.primaryOwnerId] = (taskCount[t.primaryOwnerId] ?? 0) + 1;
      }
    }
    return users
      .filter((u) => taskCount[u.id] !== undefined)
      .map((u) => ({
        name:     u.name.split(" ")[0],
        workload: taskCount[u.id] ?? 0,
      }))
      .sort((a, b) => b.workload - a.workload);
  }, [tasks, users]);

  // ── Velocity by team ─────────────────────────────────────────────────────────
  const velocityData = useMemo(() => {
    return teams
      .map((team) => {
        const teamTasks = tasks.filter((t) => t.teamId === team.id);
        const done = teamTasks.filter((t) => t.status === "done").length;
        const velocity =
          teamTasks.length > 0 ? Math.round((done / teamTasks.length) * 100) : 0;
        return { dept: team.name, velocity, total: teamTasks.length };
      })
      .filter((d) => d.total > 0);
  }, [tasks, teams]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live insights based on your workspace tasks
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, note, up, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
              <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
                <TrendingUp className="w-3 h-3" />
                {note}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
        </TabsList>

        {/* Overview tab — status pie chart */}
        <TabsContent value="overview">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12 lg:col-span-6">
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">Across all tasks in your workspace</p>
              </CardHeader>
              <CardContent>
                {statusBreakdown.length === 0 ? (
                  <EmptyState message="No tasks yet — create some to see data here." />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7f0",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3">
                      {statusBreakdown.map(({ name, value, color }) => (
                        <div key={name} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-xs text-muted-foreground">{name}</span>
                          <span className="text-xs font-semibold text-foreground ml-auto">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-12 lg:col-span-6">
              <CardHeader>
                <CardTitle>Task Counts by Status</CardTitle>
                <p className="text-xs text-muted-foreground">Total tasks per stage</p>
              </CardHeader>
              <CardContent>
                {statusBreakdown.length === 0 ? (
                  <EmptyState message="No tasks yet." />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={statusBreakdown}
                      margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e5e7f0",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workload tab */}
        <TabsContent value="workload">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Team Workload Distribution</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Active (non-done) tasks per team member
                </p>
              </CardHeader>
              <CardContent>
                {workloadData.length === 0 ? (
                  <EmptyState message="No active tasks assigned yet." />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={Math.max(200, workloadData.length * 40)}>
                      <BarChart
                        data={workloadData}
                        margin={{ top: 4, right: 0, left: -10, bottom: 0 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#374151" }}
                          axisLine={false}
                          tickLine={false}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7f0",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(val) => [`${val} tasks`, "Active tasks"]}
                        />
                        <Bar dataKey="workload" radius={[0, 6, 6, 0]} maxBarSize={24}>
                          {workloadData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                entry.workload >= 8
                                  ? "#f87171"
                                  : entry.workload >= 5
                                  ? "#fbbf24"
                                  : "#4f46e5"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-6 mt-3">
                      {[
                        { color: "#f87171", label: "Heavy (8+ tasks)" },
                        { color: "#fbbf24", label: "Moderate (5–7)" },
                        { color: "#4f46e5", label: "Light (<5)" },
                      ].map(({ color, label }) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Velocity tab */}
        <TabsContent value="velocity">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Team Completion Rate</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Percentage of done tasks per team
                </p>
              </CardHeader>
              <CardContent>
                {velocityData.length === 0 ? (
                  <EmptyState message="No team tasks found — assign tasks to teams to see velocity." />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={velocityData}
                        margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                        <XAxis
                          dataKey="dept"
                          tick={{ fontSize: 11, fill: "#374151" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7f0",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(val) => [`${val}%`, "Completion rate"]}
                        />
                        <Bar
                          dataKey="velocity"
                          name="Completion"
                          fill="#4f46e5"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
