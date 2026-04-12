"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks",     href: "/tasks"     },
  { label: "Planner",   href: "/planner"   },
  { label: "Team",      href: "/team"      },
  { label: "Analytics", href: "/analytics" },
  { label: "Assistant", href: "/assistant" },
  { label: "Settings",  href: "/settings"  },
];

export function Topbar() {
  const pathname = usePathname();
  const current = navItems.find(
    (n) => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
  );

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-white sticky top-0 z-30">
      <h1 className="text-sm font-semibold text-foreground">
        {current?.label ?? "Chrona Work"}
      </h1>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted text-xs text-muted-foreground hover:bg-accent transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-1 text-[10px] bg-white border border-border rounded px-1">⌘K</kbd>
        </button>

        <button className="relative w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        <Avatar className="w-8 h-8 cursor-pointer text-xs">
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
