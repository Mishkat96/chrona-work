"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { OnlineStatus } from "@/lib/mock-data";

const dotColor: Record<OnlineStatus, string> = {
  online:  "bg-emerald-400",
  away:    "bg-amber-400",
  offline: "bg-slate-300",
};

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<AvatarSize, { avatar: string; dot: string }> = {
  xs: { avatar: "w-4 h-4 text-[8px]",  dot: "w-1.5 h-1.5" },
  sm: { avatar: "w-6 h-6 text-[10px]", dot: "w-2 h-2"     },
  md: { avatar: "w-8 h-8 text-xs",     dot: "w-2.5 h-2.5" },
  lg: { avatar: "w-16 h-16 text-xl",   dot: "w-4 h-4"     },
};

interface Props {
  initials: string;
  /** When provided, renders an online-status dot. Omit to hide the dot entirely. */
  onlineStatus?: OnlineStatus;
  size?: AvatarSize;
  className?: string;
}

export function UserAvatar({ initials, onlineStatus, size = "sm", className }: Props) {
  const s = sizeMap[size];

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className={s.avatar}>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {onlineStatus && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white",
            s.dot,
            dotColor[onlineStatus]
          )}
        />
      )}
    </div>
  );
}
