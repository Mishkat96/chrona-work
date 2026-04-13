"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Mail, MoreHorizontal, CheckCircle2,
  Clock, AlertTriangle, X, ChevronDown, Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/app/UserAvatar";
import { PriorityBadge } from "@/components/app/PriorityBadge";
import { useTasks, type TeamDraft } from "@/lib/store-context";
import { type Team, type User, type OnlineStatus } from "@/lib/mock-data";
import { canManageTeam, canManageWorkspace } from "@/lib/permissions";
import { getUserOpenTaskCount, getTeamTasks, getOverdueTasks, getBlockedTasks } from "@/lib/selectors";
import { todayStr } from "@/lib/store";

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusLabel: Record<OnlineStatus, string> = {
  online: "Online", away: "Away", offline: "Offline",
};

const deptColors: Record<string, string> = {
  Design:      "bg-violet-100 text-violet-700",
  Engineering: "bg-indigo-100 text-indigo-700",
  Product:     "bg-blue-100 text-blue-700",
  Marketing:   "bg-amber-100 text-amber-700",
  Analytics:   "bg-emerald-100 text-emerald-700",
  CS:          "bg-rose-100 text-rose-700",
  Operations:  "bg-slate-100 text-slate-700",
};

function WorkloadBadge({ workload }: { workload: number }) {
  if (workload >= 85) return <Badge variant="danger"  className="text-[10px]">Overloaded</Badge>;
  if (workload >= 70) return <Badge variant="warning" className="text-[10px]">High</Badge>;
  if (workload >= 40) return <Badge variant="success" className="text-[10px]">Healthy</Badge>;
  return <Badge variant="ghost" className="text-[10px]">Under</Badge>;
}

// ── Team form (create / edit) ──────────────────────────────────────────────────

function TeamFormDialog({
  initial,
  users,
  onSave,
  onClose,
}: {
  initial?: Team;
  users: User[];
  onSave: (draft: TeamDraft) => void;
  onClose: () => void;
}) {
  const [name,       setName]       = useState(initial?.name       ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [managerId,  setManagerId]  = useState(initial?.managerId  ?? "");

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), department: department.trim(), managerId });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            {initial ? "Edit team" : "New team"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Team name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Manager</label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u.role === "admin" || u.role === "manager")
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={u.initials} size="xs" />
                        {u.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            {initial ? "Save changes" : "Create team"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add member dialog ──────────────────────────────────────────────────────────

function AddMemberDialog({
  team,
  users,
  onAdd,
  onClose,
}: {
  team: Team;
  users: User[];
  onAdd: (userId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const eligible = users.filter(
    (u) => !team.memberIds.includes(u.id) &&
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Add member</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {eligible.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? "No users match." : "All users already added."}
            </p>
          )}
          {eligible.map((u) => (
            <button
              key={u.id}
              onClick={() => { onAdd(u.id); onClose(); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/60 transition-colors border-b border-border last:border-0"
            >
              <UserAvatar initials={u.initials} onlineStatus={u.onlineStatus} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.jobTitle}</p>
              </div>
              <span className="text-xs text-indigo-600 font-semibold">Add</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { tasks, users, teams, projects, currentUser, loading,
          createTeam, updateTeam, addTeamMember, removeTeamMember } = useTasks();

  const today = todayStr();

  const [search,         setSearch]         = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showTeamForm,   setShowTeamForm]   = useState(false);
  const [editingTeam,    setEditingTeam]    = useState<Team | null>(null);
  const [showAddMember,  setShowAddMember]  = useState(false);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? filteredTeams[0] ?? null;

  const canManage = currentUser
    ? canManageWorkspace(currentUser) ||
      (selectedTeam ? canManageTeam(currentUser, selectedTeam.id, teams) : false)
    : false;

  const teamMembers = useMemo(
    () =>
      (selectedTeam?.memberIds ?? [])
        .map((id) => users.find((u) => u.id === id))
        .filter(Boolean) as User[],
    [selectedTeam, users]
  );

  const teamTasks    = selectedTeam ? getTeamTasks(tasks, selectedTeam.id) : [];
  const overdueTasks = getOverdueTasks(teamTasks, today);
  const blockedTasks = getBlockedTasks(teamTasks);
  const manager      = selectedTeam ? users.find((u) => u.id === selectedTeam.managerId) : null;

  async function handleCreateTeam(draft: TeamDraft) {
    await createTeam(draft);
  }

  async function handleUpdateTeam(draft: TeamDraft) {
    if (!editingTeam) return;
    await updateTeam({ id: editingTeam.id, ...draft });
  }

  async function handleAddMember(userId: string) {
    if (!selectedTeam) return;
    await addTeamMember(selectedTeam.id, userId);
  }

  async function handleRemoveMember(userId: string) {
    if (!selectedTeam) return;
    await removeTeamMember(selectedTeam.id, userId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-88px)]">
        <div className="text-sm text-muted-foreground">Loading team…</div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {(showTeamForm || editingTeam) && (
          <TeamFormDialog
            key="team-form"
            initial={editingTeam ?? undefined}
            users={users}
            onSave={editingTeam ? handleUpdateTeam : handleCreateTeam}
            onClose={() => { setShowTeamForm(false); setEditingTeam(null); }}
          />
        )}
        {showAddMember && selectedTeam && (
          <AddMemberDialog
            key="add-member"
            team={selectedTeam}
            users={users}
            onAdd={handleAddMember}
            onClose={() => setShowAddMember(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-5 h-[calc(100vh-88px)] max-w-[1400px]">

        {/* ── Team list ──────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams…"
                className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            {currentUser && canManageWorkspace(currentUser) && (
              <Button size="sm" onClick={() => setShowTeamForm(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Card className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {filteredTeams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No teams found.</p>
              )}
              {filteredTeams.map((team) => {
                const tt      = getTeamTasks(tasks, team.id);
                const isSelected = selectedTeam?.id === team.id;
                const mgr     = users.find((u) => u.id === team.managerId);
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full flex items-start gap-3 p-3.5 text-left transition-colors ${
                      isSelected ? "bg-indigo-50" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      deptColors[team.department]?.split(" ")[0] ?? "bg-indigo-500"
                    } bg-indigo-500`}>
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {team.memberIds.length} member{team.memberIds.length !== 1 ? "s" : ""}
                        {mgr ? ` · ${mgr.name.split(" ")[0]}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">{tt.filter((t) => t.status !== "done").length}</p>
                      <p className="text-[10px] text-muted-foreground">open</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Team detail ────────────────────────────────────────────── */}
        {!selectedTeam ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a team to view details.</p>
          </div>
        ) : (
          <motion.div
            key={selectedTeam.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-w-0 space-y-4 overflow-y-auto"
          >
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedTeam.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedTeam.department}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${deptColors[selectedTeam.department] ?? "bg-muted text-muted-foreground"}`}>
                        {selectedTeam.department}
                      </span>
                      {manager && (
                        <span className="text-xs text-muted-foreground">
                          Lead: <span className="font-medium text-foreground">{manager.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setEditingTeam(selectedTeam)}
                      >
                        <Pencil className="w-4 h-4" /> Edit team
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
                  {[
                    { label: "Members",     value: teamMembers.length },
                    { label: "Open tasks",  value: teamTasks.filter((t) => t.status !== "done").length },
                    { label: "Blocked",     value: blockedTasks.length },
                    { label: "Overdue",     value: overdueTasks.length },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className={`text-xl font-bold ${
                        label === "Blocked" && value > 0  ? "text-red-500" :
                        label === "Overdue" && value > 0  ? "text-amber-500" :
                        "text-foreground"
                      }`}>{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Members ({teamMembers.length})</CardTitle>
                  {canManage && (
                    <Button size="sm" onClick={() => setShowAddMember(true)}>
                      <Plus className="w-4 h-4" /> Add member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No members yet.</p>
                )}
                <div className="space-y-3">
                  {teamMembers.map((member) => {
                    const openCount   = getUserOpenTaskCount(teamTasks, member.id);
                    const memberOver  = getOverdueTasks(
                      teamTasks.filter((t) => t.primaryOwnerId === member.id), today
                    ).length;
                    const isManager   = member.id === selectedTeam.managerId;
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                        <UserAvatar initials={member.initials} onlineStatus={member.onlineStatus} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                            {isManager && (
                              <Badge variant="default" className="text-[10px] py-0">Lead</Badge>
                            )}
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${
                              member.role === "admin"   ? "border-indigo-200 text-indigo-700 bg-indigo-50" :
                              member.role === "manager" ? "border-violet-200 text-violet-700 bg-violet-50" :
                              "border-slate-200 text-slate-600 bg-slate-50"
                            }`}>{member.role}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">{member.jobTitle} · {statusLabel[member.onlineStatus]}</p>
                          <Progress
                            value={member.workload}
                            className="h-1.5"
                            indicatorClassName={
                              member.workload >= 85 ? "bg-red-400" :
                              member.workload >= 70 ? "bg-amber-400" : "bg-emerald-400"
                            }
                          />
                        </div>
                        <div className="text-right shrink-0 min-w-[60px]">
                          <p className={`text-sm font-bold ${
                            member.workload >= 85 ? "text-red-500" :
                            member.workload >= 70 ? "text-amber-500" : "text-emerald-500"
                          }`}>{member.workload}%</p>
                          <p className="text-[10px] text-muted-foreground">{openCount} open</p>
                          {memberOver > 0 && (
                            <p className="text-[10px] text-red-500 font-medium">{memberOver} overdue</p>
                          )}
                        </div>
                        {canManage && member.id !== selectedTeam.managerId && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            title="Remove from team"
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Team tasks */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Team Tasks ({teamTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList className="mb-4">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="blocked">
                      Blocked {blockedTasks.length > 0 && `(${blockedTasks.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active">
                    <div className="space-y-2">
                      {teamTasks.filter((t) => t.status !== "done" && t.status !== "blocked").map((task) => {
                        const owner   = users.find((u) => u.id === task.primaryOwnerId);
                        const project = projects.find((p) => p.id === task.projectId);
                        const isOver  = task.dueDate && task.dueDate < today;
                        return (
                          <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                            isOver ? "border-red-200 bg-red-50/30" : "border-border hover:bg-muted/40"
                          }`}>
                            {task.status === "in_progress"
                              ? <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                              : <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Due {task.dueDate || "—"} · {project?.name ?? "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <PriorityBadge priority={task.priority} className="text-[10px]" />
                              {owner && <UserAvatar initials={owner.initials} onlineStatus={owner.onlineStatus} size="sm" />}
                            </div>
                          </div>
                        );
                      })}
                      {teamTasks.filter((t) => t.status !== "done" && t.status !== "blocked").length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6">No active tasks.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="blocked">
                    <div className="space-y-2">
                      {blockedTasks.map((task) => {
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
                            {owner && <UserAvatar initials={owner.initials} size="sm" />}
                          </div>
                        );
                      })}
                      {blockedTasks.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6">No blocked tasks.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="all">
                    <div className="space-y-2">
                      {teamTasks.map((task) => {
                        const owner   = users.find((u) => u.id === task.primaryOwnerId);
                        const project = projects.find((p) => p.id === task.projectId);
                        return (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                            {task.status === "done"
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              : task.status === "blocked"
                              ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                              : <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due {task.dueDate || "—"} · {project?.name ?? "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <PriorityBadge priority={task.priority} className="text-[10px]" />
                              {owner && <UserAvatar initials={owner.initials} size="sm" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
}
