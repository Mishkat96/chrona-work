"use client";

import { Clock, CheckCircle2, XCircle, Circle } from "lucide-react";
import type { TaskStatus } from "@/lib/mock-data";

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  iconClassName: string;
  pillClassName: string;
}

const config: Record<TaskStatus, StatusConfig> = {
  not_started: {
    label: "Not Started",
    icon: Circle,
    iconClassName: "text-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    iconClassName: "text-indigo-500",
    pillClassName: "bg-indigo-100 text-indigo-700",
  },
  blocked: {
    label: "Blocked",
    icon: XCircle,
    iconClassName: "text-red-500",
    pillClassName: "bg-red-100 text-red-600",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    iconClassName: "text-emerald-500",
    pillClassName: "bg-emerald-100 text-emerald-700",
  },
};

interface Props {
  status: TaskStatus;
  /**
   * "pill"  — coloured rounded box (default, used in rows and cards)
   * "icon"  — small icon + text label (used in detail panels and tables)
   */
  variant?: "pill" | "icon";
  className?: string;
}

export function TaskStatusBadge({ status, variant = "pill", className }: Props) {
  const c = config[status];
  const Icon = c.icon;

  if (variant === "icon") {
    return (
      <span className={`flex items-center gap-1.5 text-xs font-medium ${c.iconClassName} ${className ?? ""}`}>
        <Icon className="w-4 h-4 shrink-0" />
        {c.label}
      </span>
    );
  }

  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${c.pillClassName} ${className ?? ""}`}>
      {c.label}
    </span>
  );
}

/** Utility: get the icon component for a status (useful when building filter UIs). */
export function getStatusIcon(status: TaskStatus) {
  return config[status].icon;
}

/** Utility: get the label for a status. */
export function getStatusLabel(status: TaskStatus) {
  return config[status].label;
}

/** Utility: get the icon className for a status. */
export function getStatusIconClassName(status: TaskStatus) {
  return config[status].iconClassName;
}
