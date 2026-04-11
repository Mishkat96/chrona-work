"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  weeklyCompletionData, workloadDistributionData, taskStatusBreakdown,
  departmentVelocity
} from "@/lib/mock-data";

const summaryStats = [
  { label: "Avg completion rate", value: "84%", delta: "+4%", up: true, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Avg task duration", value: "2.8d", delta: "-0.4d", up: true, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "Delayed tasks", value: "5", delta: "-2 vs prev", up: true, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Active contributors", value: "8", delta: "Full team", up: true, icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
];

const COLORS = taskStatusBreakdown.map((d) => d.color);

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Performance, velocity, and workload insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 px-3 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>Last 10 weeks</option>
            <option>Last quarter</option>
            <option>Last 6 months</option>
          </select>
          <Badge variant="success" className="text-xs font-medium">Live data</Badge>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, delta, up, icon: Icon, color, bg }) => (
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
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {delta}
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

        <TabsContent value="overview">
          <div className="grid grid-cols-12 gap-5">
            {/* Completion trend */}
            <Card className="col-span-12 lg:col-span-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Task Completion Trend</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Created vs completed · 10 weeks</p>
                  </div>
                  <Badge variant="success">+18% velocity</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weeklyCompletionData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="created" stroke="#a78bfa" strokeWidth={2} fill="url(#grad2)" name="Created" dot={false} />
                    <Area type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} fill="url(#grad1)" name="Completed" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status breakdown */}
            <Card className="col-span-12 lg:col-span-4">
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">Across all active projects</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={taskStatusBreakdown}
                      cx="50%" cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskStatusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-2">
                  {taskStatusBreakdown.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-xs text-muted-foreground">{name}</span>
                      <span className="text-xs font-semibold text-foreground ml-auto">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workload">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Team Workload Distribution</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Current capacity utilisation per team member</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workloadDistributionData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(val) => [`${val}%`, "Workload"]}
                    />
                    <Bar dataKey="workload" radius={[0, 6, 6, 0]} maxBarSize={24}>
                      {workloadDistributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.workload >= 85 ? "#f87171" : entry.workload >= 70 ? "#fbbf24" : "#4f46e5"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-3">
                  {[
                    { color: "#f87171", label: "Overloaded (85%+)" },
                    { color: "#fbbf24", label: "High (70–85%)" },
                    { color: "#4f46e5", label: "Healthy (<70%)" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="velocity">
          <div className="grid grid-cols-12 gap-5">
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Department Velocity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Velocity score vs target · current sprint</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentVelocity} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                    <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="velocity" name="Velocity" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    <Bar dataKey="target" name="Target" fill="#e5e7f0" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-5 mt-3">
                  {[{ color: "#4f46e5", label: "Velocity" }, { color: "#e5e7f0", label: "Target" }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
