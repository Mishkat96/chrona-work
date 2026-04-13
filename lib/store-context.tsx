"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type Task,
  type User,
  type Project,
  type Team,
  type Comment,
  type UserRole,
  // Static seed data kept as fallback if Supabase is unreachable
  users   as mockUsers,
  projects as mockProjects,
  teams   as mockTeams,
  tasks   as mockTasks,
} from "./mock-data";

import {
  fetchTasks,
  createTaskInDb,
  updateTaskInDb,
  deleteTaskInDb,
  insertComment,
  deleteAllTasksInWorkspace,
} from "./repositories/tasks";
import { fetchUsers, updateUserRoleInDb }    from "./repositories/users";
import { fetchProjects }                     from "./repositories/projects";
import {
  fetchTeams,
  createTeamInDb,
  updateTeamInDb,
  addTeamMemberInDb,
  removeTeamMemberInDb,
} from "./repositories/teams";

import {
  WORKSPACE_ID,
  DEV_USER_ID,
  USER_ID_MAP,
  TEAM_ID_MAP,
  PROJECT_ID_MAP,
} from "./supabase/config";
import { genId, todayStr, nowIso } from "./store";
import { getVisibleTasks } from "./permissions";

// ── Dev user persistence ───────────────────────────────────────────────────────
// Stores the active dev user ID so role switching survives page refreshes.
// Replaced by real auth in Phase 5.

const DEV_USER_KEY = "chrona:dev:userId";

function getDevUserId(): string {
  if (typeof window === "undefined") return DEV_USER_ID;
  return localStorage.getItem(DEV_USER_KEY) ?? DEV_USER_ID;
}

function saveDevUserId(id: string): void {
  if (typeof window !== "undefined") localStorage.setItem(DEV_USER_KEY, id);
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type NewTaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">;

export interface TeamDraft {
  name: string;
  department: string;
  managerId: string;
}

interface ContextValue {
  // ─ Data
  tasks:        Task[];
  /** Role-filtered task list — employees see only their own work. */
  visibleTasks: Task[];
  users:        User[];
  projects:     Project[];
  teams:        Team[];
  currentUser:  User | null;
  loading:      boolean;
  error:        string | null;

  // ─ Task CRUD
  createTask:  (draft: NewTaskDraft) => Promise<Task | null>;
  updateTask:  (updated: Task, activityMessage?: string) => Promise<void>;
  deleteTask:  (id: string) => Promise<void>;
  addComment:  (taskId: string, body: string) => Promise<void>;
  logActivity: (taskId: string, message: string) => Promise<void>;
  resetDemo:   () => Promise<void>;

  // ─ Team CRUD
  createTeam:       (draft: TeamDraft) => Promise<Team | null>;
  updateTeam:       (team: { id: string } & TeamDraft) => Promise<void>;
  addTeamMember:    (teamId: string, userId: string) => Promise<void>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;

  // ─ User management
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  /** Dev-only: switch the active user without real auth. */
  switchUser: (userId: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const TasksCtx = createContext<ContextValue | null>(null);

export function useTasks(): ContextValue {
  const ctx = useContext(TasksCtx);
  if (!ctx) throw new Error("useTasks must be used inside <TasksProvider>");
  return ctx;
}

// ── Mock-data fallback ─────────────────────────────────────────────────────────
// Maps mock-data short IDs to the Supabase UUIDs so the fallback users/projects
// still look right when rendered alongside real DB data.

function buildMockFallback() {
  const mappedUsers = mockUsers.map((u) => ({
    ...u,
    id: USER_ID_MAP[u.id] ?? u.id,
  }));
  const mappedProjects = mockProjects.map((p) => ({
    ...p,
    id:     PROJECT_ID_MAP[p.id] ?? p.id,
    teamId: TEAM_ID_MAP[p.teamId] ?? p.teamId,
  }));
  const mappedTeams = mockTeams.map((t) => ({
    ...t,
    id:        TEAM_ID_MAP[t.id]              ?? t.id,
    managerId: USER_ID_MAP[t.managerId]       ?? t.managerId,
    memberIds: t.memberIds.map((mid) => USER_ID_MAP[mid] ?? mid),
  }));
  return { mappedUsers, mappedProjects, mappedTeams };
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [users,       setUsers]       = useState<User[]>([]);
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [teams,       setTeams]       = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // ── Initial fetch ───────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      try {
        const [dbTasks, dbUsers, dbProjects, dbTeams] = await Promise.all([
          fetchTasks(WORKSPACE_ID),
          fetchUsers(WORKSPACE_ID),
          fetchProjects(WORKSPACE_ID),
          fetchTeams(WORKSPACE_ID),
        ]);

        setTasks(dbTasks);
        setUsers(dbUsers);
        setProjects(dbProjects);
        setTeams(dbTeams);

        const me = dbUsers.find((u) => u.id === getDevUserId()) ?? dbUsers[0] ?? null;
        setCurrentUser(me);
      } catch (err) {
        console.warn(
          "Supabase unavailable — falling back to mock data. " +
          "Run supabase/schema.sql and supabase/seed.sql to enable real persistence.",
          err
        );

        const { mappedUsers, mappedProjects, mappedTeams } = buildMockFallback();
        setUsers(mappedUsers);
        setProjects(mappedProjects);
        setTeams(mappedTeams);

        const mappedTasks: Task[] = mockTasks.map((t) => ({
          ...t,
          id:              genId("t"),
          primaryOwnerId:  USER_ID_MAP[t.primaryOwnerId]  ?? t.primaryOwnerId,
          collaboratorIds: t.collaboratorIds.map((id) => USER_ID_MAP[id] ?? id),
          creatorId:       USER_ID_MAP[t.creatorId]       ?? t.creatorId,
          teamId:          TEAM_ID_MAP[t.teamId]           ?? t.teamId,
          projectId:       PROJECT_ID_MAP[t.projectId]    ?? t.projectId,
          comments:        [],
        }));
        setTasks(mappedTasks);

        const me =
          mappedUsers.find((u) => u.id === DEV_USER_ID) ?? mappedUsers[0] ?? null;
        setCurrentUser(me);

        setError("Using local mock data — Supabase connection failed.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // ── Derived: role-filtered task view ───────────────────────────────────────

  const visibleTasks = useMemo(() => {
    if (!currentUser) return tasks;
    return getVisibleTasks(currentUser, tasks, teams);
  }, [tasks, currentUser, teams]);

  // ── createTask ──────────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (draft: NewTaskDraft): Promise<Task | null> => {
      if (!currentUser) return null;

      const optimisticId = genId("t");
      const now = todayStr();
      const optimistic: Task = {
        ...draft,
        id:       optimisticId,
        comments: [
          {
            id:        genId("c"),
            authorId:  currentUser.id,
            body:      "Task created.",
            type:      "activity",
            createdAt: nowIso(),
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [optimistic, ...prev]);

      try {
        const real = await createTaskInDb(draft, WORKSPACE_ID, currentUser.id);
        setTasks((prev) =>
          prev.map((t) => (t.id === optimisticId ? real : t))
        );
        return real;
      } catch (err) {
        console.error("createTask failed:", err);
        return optimistic;
      }
    },
    [currentUser]
  );

  // ── updateTask ──────────────────────────────────────────────────────────────

  const updateTask = useCallback(
    async (updated: Task, activityMessage?: string): Promise<void> => {
      if (!currentUser) return;

      const optimisticComment: Comment | null = activityMessage
        ? {
            id:        genId("c"),
            authorId:  currentUser.id,
            body:      activityMessage,
            type:      "activity",
            createdAt: nowIso(),
          }
        : null;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === updated.id
            ? {
                ...updated,
                updatedAt: todayStr(),
                comments:  optimisticComment
                  ? [...updated.comments, optimisticComment]
                  : updated.comments,
              }
            : t
        )
      );

      try {
        await updateTaskInDb(updated);
        if (activityMessage && optimisticComment) {
          const real = await insertComment(
            updated.id,
            currentUser.id,
            activityMessage,
            "activity"
          );
          setTasks((prev) =>
            prev.map((t) => {
              if (t.id !== updated.id) return t;
              return {
                ...t,
                comments: t.comments.map((c) =>
                  c.id === optimisticComment.id ? real : c
                ),
              };
            })
          );
        }
      } catch (err) {
        console.error("updateTask failed:", err);
      }
    },
    [currentUser]
  );

  // ── deleteTask ──────────────────────────────────────────────────────────────

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTaskInDb(id);
    } catch (err) {
      console.error("deleteTask failed:", err);
    }
  }, []);

  // ── addComment ──────────────────────────────────────────────────────────────

  const addComment = useCallback(
    async (taskId: string, body: string): Promise<void> => {
      if (!currentUser || !body.trim()) return;

      const optimistic: Comment = {
        id:        genId("c"),
        authorId:  currentUser.id,
        body:      body.trim(),
        type:      "comment",
        createdAt: nowIso(),
      };

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, comments: [...t.comments, optimistic] }
            : t
        )
      );

      try {
        const real = await insertComment(
          taskId,
          currentUser.id,
          body.trim(),
          "comment"
        );
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              comments: t.comments.map((c) =>
                c.id === optimistic.id ? real : c
              ),
            };
          })
        );
      } catch (err) {
        console.error("addComment failed:", err);
      }
    },
    [currentUser]
  );

  // ── logActivity ─────────────────────────────────────────────────────────────

  const logActivity = useCallback(
    async (taskId: string, message: string): Promise<void> => {
      if (!currentUser) return;

      const optimistic: Comment = {
        id:        genId("c"),
        authorId:  currentUser.id,
        body:      message,
        type:      "activity",
        createdAt: nowIso(),
      };

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, comments: [...t.comments, optimistic] }
            : t
        )
      );

      try {
        const real = await insertComment(
          taskId,
          currentUser.id,
          message,
          "activity"
        );
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              comments: t.comments.map((c) =>
                c.id === optimistic.id ? real : c
              ),
            };
          })
        );
      } catch (err) {
        console.error("logActivity failed:", err);
      }
    },
    [currentUser]
  );

  // ── resetDemo ───────────────────────────────────────────────────────────────

  const resetDemo = useCallback(async (): Promise<void> => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await deleteAllTasksInWorkspace(WORKSPACE_ID);

      const seedResults: Task[] = [];
      for (const t of mockTasks) {
        const mapped: NewTaskDraft = {
          title:           t.title,
          description:     t.description,
          status:          t.status,
          priority:        t.priority,
          dueDate:         t.dueDate,
          primaryOwnerId:  USER_ID_MAP[t.primaryOwnerId]  ?? t.primaryOwnerId,
          collaboratorIds: t.collaboratorIds.map((id) => USER_ID_MAP[id] ?? id),
          creatorId:       USER_ID_MAP[t.creatorId]       ?? t.creatorId,
          teamId:          TEAM_ID_MAP[t.teamId]           ?? t.teamId,
          projectId:       PROJECT_ID_MAP[t.projectId]    ?? t.projectId,
          blockedReason:   t.blockedReason,
          tags:            t.tags,
          estimatedHours:  t.estimatedHours,
          loggedHours:     t.loggedHours,
        };
        const created = await createTaskInDb(mapped, WORKSPACE_ID, currentUser.id);
        seedResults.push(created);
      }
      setTasks(seedResults);
    } catch (err) {
      console.error("resetDemo failed:", err);
      const { mappedUsers, mappedProjects, mappedTeams } = buildMockFallback();
      void mappedUsers; void mappedProjects; void mappedTeams;
      const mappedTasks: Task[] = mockTasks.map((t) => ({
        ...t,
        id:              genId("t"),
        primaryOwnerId:  USER_ID_MAP[t.primaryOwnerId]  ?? t.primaryOwnerId,
        collaboratorIds: t.collaboratorIds.map((id) => USER_ID_MAP[id] ?? id),
        creatorId:       USER_ID_MAP[t.creatorId]       ?? t.creatorId,
        teamId:          TEAM_ID_MAP[t.teamId]           ?? t.teamId,
        projectId:       PROJECT_ID_MAP[t.projectId]    ?? t.projectId,
        comments:        [],
      }));
      setTasks(mappedTasks);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ── createTeam ──────────────────────────────────────────────────────────────

  const createTeam = useCallback(
    async (draft: TeamDraft): Promise<Team | null> => {
      try {
        const team = await createTeamInDb(draft, WORKSPACE_ID);
        setTeams((prev) => [...prev, team].sort((a, b) => a.name.localeCompare(b.name)));
        return team;
      } catch (err) {
        console.error("createTeam failed:", err);
        return null;
      }
    },
    []
  );

  // ── updateTeam ──────────────────────────────────────────────────────────────

  const updateTeam = useCallback(
    async (team: { id: string } & TeamDraft): Promise<void> => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === team.id
            ? { ...t, name: team.name, department: team.department, managerId: team.managerId }
            : t
        )
      );
      try {
        await updateTeamInDb(team);
      } catch (err) {
        console.error("updateTeam failed:", err);
      }
    },
    []
  );

  // ── addTeamMember ───────────────────────────────────────────────────────────

  const addTeamMember = useCallback(
    async (teamId: string, userId: string): Promise<void> => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId && !t.memberIds.includes(userId)
            ? { ...t, memberIds: [...t.memberIds, userId] }
            : t
        )
      );
      try {
        await addTeamMemberInDb(teamId, userId);
      } catch (err) {
        console.error("addTeamMember failed:", err);
      }
    },
    []
  );

  // ── removeTeamMember ────────────────────────────────────────────────────────

  const removeTeamMember = useCallback(
    async (teamId: string, userId: string): Promise<void> => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId) }
            : t
        )
      );
      try {
        await removeTeamMemberInDb(teamId, userId);
      } catch (err) {
        console.error("removeTeamMember failed:", err);
      }
    },
    []
  );

  // ── switchUser (dev-only) ───────────────────────────────────────────────────

  const switchUser = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      saveDevUserId(userId);
      setCurrentUser(user);
    },
    [users]
  );

  // ── updateUserRole ──────────────────────────────────────────────────────────

  const updateUserRole = useCallback(
    async (userId: string, role: UserRole): Promise<void> => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, role } : prev));
      }
      try {
        await updateUserRoleInDb(userId, role);
      } catch (err) {
        console.error("updateUserRole failed:", err);
      }
    },
    [currentUser]
  );

  // ── Context value ───────────────────────────────────────────────────────────

  return (
    <TasksCtx.Provider
      value={{
        tasks,
        visibleTasks,
        users,
        projects,
        teams,
        currentUser,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        logActivity,
        resetDemo,
        createTeam,
        updateTeam,
        addTeamMember,
        removeTeamMember,
        updateUserRole,
        switchUser,
      }}
    >
      {children}
    </TasksCtx.Provider>
  );
}
