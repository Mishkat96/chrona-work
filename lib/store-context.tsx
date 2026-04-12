"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { type Task, type Comment, users, tasks as seedTasks } from "./mock-data";
import { loadTasks, persistTasks, clearPersistedTasks, genId, todayStr, nowIso } from "./store";

// ── Types ──────────────────────────────────────────────────────────────────────

/** Fields required when creating a new task (id, timestamps, comments are generated). */
export type NewTaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">;

interface ContextValue {
  tasks: Task[];
  currentUser: (typeof users)[0];
  createTask: (draft: NewTaskDraft) => Task;
  updateTask: (updated: Task) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, body: string) => void;
  logActivity: (taskId: string, message: string) => void;
  resetDemo: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const TasksCtx = createContext<ContextValue | null>(null);

export function useTasks(): ContextValue {
  const ctx = useContext(TasksCtx);
  if (!ctx) throw new Error("useTasks must be used inside <TasksProvider>");
  return ctx;
}

// ── Reducer ────────────────────────────────────────────────────────────────────

type Action =
  | { type: "INIT"; tasks: Task[] }
  | { type: "CREATE"; task: Task }
  | { type: "UPDATE"; task: Task }
  | { type: "DELETE"; id: string }
  | { type: "RESET" };

function reducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case "INIT":   return action.tasks;
    case "CREATE": return [action.task, ...state];
    case "UPDATE": return state.map((t) => (t.id === action.task.id ? action.task : t));
    case "DELETE": return state.filter((t) => t.id !== action.id);
    case "RESET":  return seedTasks.map((t) => ({ ...t, comments: [] }));
    default:       return state;
  }
}

// ── Current user (fake auth — Phase 2 uses u0 Sarah Chen) ─────────────────────

const CURRENT_USER = users.find((u) => u.id === "u0")!;

// ── Provider ───────────────────────────────────────────────────────────────────

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(reducer, []);
  const initialized = useRef(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    dispatch({ type: "INIT", tasks: loadTasks() });
    initialized.current = true;
  }, []);

  // Persist on every change after initialization
  useEffect(() => {
    if (initialized.current) {
      persistTasks(tasks);
    }
  }, [tasks]);

  // ── CRUD helpers ─────────────────────────────────────────────────────────────

  const createTask = useCallback((draft: NewTaskDraft): Task => {
    const now = todayStr();
    const task: Task = {
      ...draft,
      id: genId("t"),
      comments: [
        {
          id: genId("c"),
          authorId: CURRENT_USER.id,
          body: `Task created by ${CURRENT_USER.name}.`,
          createdAt: nowIso(),
          type: "activity",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "CREATE", task });
    return task;
  }, []);

  const updateTask = useCallback((updated: Task) => {
    dispatch({ type: "UPDATE", task: { ...updated, updatedAt: todayStr() } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const addComment = useCallback(
    (taskId: string, body: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !body.trim()) return;
      const comment: Comment = {
        id: genId("c"),
        authorId: CURRENT_USER.id,
        body: body.trim(),
        createdAt: nowIso(),
        type: "comment",
      };
      dispatch({
        type: "UPDATE",
        task: {
          ...task,
          comments: [...task.comments, comment],
          updatedAt: todayStr(),
        },
      });
    },
    [tasks]
  );

  const logActivity = useCallback(
    (taskId: string, message: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const entry: Comment = {
        id: genId("c"),
        authorId: CURRENT_USER.id,
        body: message,
        createdAt: nowIso(),
        type: "activity",
      };
      dispatch({
        type: "UPDATE",
        task: {
          ...task,
          comments: [...task.comments, entry],
          updatedAt: todayStr(),
        },
      });
    },
    [tasks]
  );

  const resetDemo = useCallback(() => {
    clearPersistedTasks();
    dispatch({ type: "RESET" });
  }, []);

  return (
    <TasksCtx.Provider
      value={{
        tasks,
        currentUser: CURRENT_USER,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        logActivity,
        resetDemo,
      }}
    >
      {children}
    </TasksCtx.Provider>
  );
}
