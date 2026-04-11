"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, ChevronDown, Clock, Calendar,
  MoreHorizontal, Zap, CheckCircle2, Circle, XCircle, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { tasks, teamMembers, type Task } from "@/lib/mock-data";

const priorityConfig = {
  critical: { label: "Critical", variant: "danger" as const, dot: "bg-red-500" },
  high: { label: "High", variant: "warning" as const, dot: "bg-amber-500" },
  medium: { label: "Medium", variant: "info" as const, dot: "bg-blue-500" },
  low: { label: "Low", variant: "ghost" as const, dot: "bg-slate-400" },
};

const statusConfig = {
  todo: { label: "To Do", icon: Circle, className: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, className: "text-indigo-500" },
  review: { label: "Review", icon: Eye, className: "text-amber-500" },
  done: { label: "Done", icon: CheckCircle2, className: "text-emerald-500" },
  blocked: { label: "Blocked", icon: XCircle, className: "text-red-500" },
};

const statusGroups = ["todo", "in_progress", "review", "blocked", "done"] as const;

function TaskRow({ task, selected, onClick }: { task: Task; selected: boolean; onClick: () => void }) {
  const member = teamMembers.find((m) => m.id === task.assignee);
  const pConfig = priorityConfig[task.priority];
  const sConfig = statusConfig[task.status];
  const StatusIcon = sConfig.icon;
  const progress = task.estimatedHours > 0 ? Math.round((task.loggedHours / task.estimatedHours) * 100) : 0;

  return (
    <tr
      onClick={onClick}
      className={`border-b border-border last:border-0 cursor-pointer transition-colors ${selected ? "bg-indigo-50/60" : "hover:bg-muted/40"}`}
    >
      <td className="py-3 pl-4 pr-2 w-8">
        <div className={`w-2 h-2 rounded-full ${pConfig.dot}`} />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 shrink-0 ${sConfig.className}`} />
          <span className="text-sm font-medium text-foreground">{task.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 ml-6">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </td>
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{task.project}</span>
      </td>
      <td className="py-3 pr-4 hidden lg:table-cell">
        <Badge variant={pConfig.variant} className="text-[10px]">{pConfig.label}</Badge>
      </td>
      <td className="py-3 pr-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {task.dueDate}
        </div>
      </td>
      <td className="py-3 pr-4 hidden xl:table-cell">
        <div className="flex items-center gap-2 w-28">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <Avatar className="w-6 h-6 text-[10px]">
          <AvatarFallback>{member?.initials}</AvatarFallback>
        </Avatar>
      </td>
      <td className="py-3 pr-3">
        <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-muted transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );
}

function TaskDetailPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const member = teamMembers.find((m) => m.id === task.assignee);
  const pConfig = priorityConfig[task.priority];
  const sConfig = statusConfig[task.status];
  const progress = task.estimatedHours > 0 ? Math.round((task.loggedHours / task.estimatedHours) * 100) : 0;

  return (
    <motion.div
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-80 shrink-0 bg-white border-l border-border flex flex-col h-full overflow-y-auto"
    >
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Task detail</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <XCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="p-5 space-y-5 flex-1">
        <div>
          <h4 className="text-base font-semibold text-foreground mb-1">{task.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: "Status", value: sConfig.label },
            { label: "Priority", value: pConfig.label },
            { label: "Due date", value: task.dueDate },
            { label: "Project", value: task.project },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground mb-0.5">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Assigned to</p>
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 text-xs">
              <AvatarFallback>{member?.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{member?.name}</p>
              <p className="text-xs text-muted-foreground">{member?.role}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{task.loggedHours}h / {task.estimatedHours}h</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-border space-y-2">
          <Button className="w-full" size="sm">Log time</Button>
          <Button variant="outline" className="w-full" size="sm">Change status</Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const statusCounts = statusGroups.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-5 h-[calc(100vh-88px)] max-w-[1400px]">
      {/* Main panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {/* Status summary */}
        <div className="grid grid-cols-5 gap-3">
          {statusGroups.map((s) => {
            const sConfig = statusConfig[s];
            const Icon = sConfig.icon;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${filterStatus === s ? "border-indigo-300 bg-indigo-50" : "border-border bg-card hover:bg-muted"}`}
              >
                <Icon className={`w-4 h-4 ${sConfig.className}`} />
                <div>
                  <div className="text-xs font-semibold text-foreground">{statusCounts[s]}</div>
                  <div className="text-[10px] text-muted-foreground">{sConfig.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Task table */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                />
              </div>
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Filter className="w-3.5 h-3.5" /> Priority <ChevronDown className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Filter className="w-3.5 h-3.5" /> Assignee <ChevronDown className="w-3 h-3" />
              </button>
              <Button size="sm">
                <Plus className="w-4 h-4" /> New task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
                <tr className="border-b border-border">
                  <th className="py-2.5 pl-4 pr-2 w-8" />
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground">Task</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Project</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Priority</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Due</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">Progress</th>
                  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground">Who</th>
                  <th className="py-2.5 pr-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    selected={selectedTask?.id === task.id}
                    onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                      No tasks match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Detail panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
