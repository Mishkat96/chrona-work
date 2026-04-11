"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Mail, MoreHorizontal, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { teamMembers, tasks } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const statusDot: Record<string, string> = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  offline: "bg-slate-300",
};

const statusLabel: Record<string, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

const deptColors: Record<string, string> = {
  Design: "bg-violet-100 text-violet-700",
  Engineering: "bg-indigo-100 text-indigo-700",
  Product: "bg-blue-100 text-blue-700",
  Marketing: "bg-amber-100 text-amber-700",
  Analytics: "bg-emerald-100 text-emerald-700",
  CS: "bg-rose-100 text-rose-700",
};

function WorkloadBadge({ workload }: { workload: number }) {
  if (workload >= 85) return <Badge variant="danger" className="text-[10px]">Overloaded</Badge>;
  if (workload >= 70) return <Badge variant="warning" className="text-[10px]">High</Badge>;
  if (workload >= 40) return <Badge variant="success" className="text-[10px]">Healthy</Badge>;
  return <Badge variant="ghost" className="text-[10px]">Under</Badge>;
}

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(teamMembers[0]);

  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  const memberTasks = tasks.filter((t) => t.assignee === selected.id);

  return (
    <div className="flex gap-5 h-[calc(100vh-88px)] max-w-[1400px]">
      {/* Member list */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team..."
              className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Card className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border">
            {filtered.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors ${selected.id === member.id ? "bg-indigo-50" : "hover:bg-muted/50"}`}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-8 h-8 text-xs">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusDot[member.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
                <div className="shrink-0">
                  <span className={`text-xs font-bold ${member.workload >= 85 ? "text-red-500" : member.workload >= 70 ? "text-amber-500" : "text-emerald-500"}`}>
                    {member.workload}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Member detail */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <Avatar className="w-16 h-16 text-xl">
                    <AvatarFallback>{selected.initials}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusDot[selected.status]}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.role}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${deptColors[selected.department] ?? "bg-muted text-muted-foreground"}`}>
                          {selected.department}
                        </span>
                        <span className="text-xs text-muted-foreground">{statusLabel[selected.status]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" /> Message
                      </Button>
                      <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{selected.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
                {[
                  { label: "Tasks assigned", value: selected.tasksAssigned },
                  { label: "Completed", value: selected.tasksCompleted },
                  { label: "Availability", value: `${selected.availability}h/wk` },
                  { label: "Workload", value: `${selected.workload}%` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workload bar */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Current workload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on active tasks and scheduled hours</p>
                </div>
                <WorkloadBadge workload={selected.workload} />
              </div>
              <Progress
                value={selected.workload}
                className="h-3 rounded-full"
                indicatorClassName={selected.workload >= 85 ? "bg-red-400" : selected.workload >= 70 ? "bg-amber-400" : "bg-emerald-400"}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>0%</span>
                <span className="text-amber-500 font-medium">Optimal: 60–80%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Assigned Tasks ({memberTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <div className="space-y-2">
                    {memberTasks.filter((t) => t.status !== "done").map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                        {task.status === "blocked" ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : task.status === "in_progress" ? (
                          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">Due {task.dueDate} · {task.project}</p>
                        </div>
                        <Badge
                          variant={task.priority === "critical" ? "danger" : task.priority === "high" ? "warning" : "ghost"}
                          className="text-[10px] shrink-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                    {memberTasks.filter((t) => t.status !== "done").length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No active tasks</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="space-y-2">
                    {memberTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                        {task.status === "done" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : task.status === "blocked" ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                          <p className="text-xs text-muted-foreground">Due {task.dueDate} · {task.project}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
