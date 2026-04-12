"use client";

import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/mock-data";

interface PriorityConfig {
  label: string;
  variant: "danger" | "warning" | "info" | "ghost";
  dot: string;
}

const config: Record<Priority, PriorityConfig> = {
  critical: { label: "Critical", variant: "danger",  dot: "bg-red-500"   },
  high:     { label: "High",     variant: "warning", dot: "bg-amber-500" },
  medium:   { label: "Medium",   variant: "info",    dot: "bg-blue-500"  },
  low:      { label: "Low",      variant: "ghost",   dot: "bg-slate-400" },
};

interface Props {
  priority: Priority;
  /** Render a coloured dot to the left of the badge. */
  showDot?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showDot = false, className }: Props) {
  const c = config[priority];
  return (
    <span className="inline-flex items-center gap-1.5">
      {showDot && <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />}
      <Badge variant={c.variant} className={className}>
        {c.label}
      </Badge>
    </span>
  );
}

/** Utility: get just the dot colour class for a priority (used in table rows). */
export function getPriorityDot(priority: Priority) {
  return config[priority].dot;
}
