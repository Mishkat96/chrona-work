"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CheckSquare, Calendar, Users, BarChart3,
  MessageSquareMore, Settings, Zap, ChevronDown, RotateCcw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/store-context";

export function Sidebar() {
  const pathname = usePathname();
  const { visibleTasks, currentUser, users, resetDemo, switchUser } = useTasks();

  const blockedCount = visibleTasks.filter((t) => t.status === "blocked").length;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks",     href: "/tasks",     icon: CheckSquare,      count: blockedCount > 0 ? blockedCount : undefined, countColor: "bg-red-500" },
    { label: "Planner",   href: "/planner",   icon: Calendar },
    { label: "Team",      href: "/team",       icon: Users },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Assistant", href: "/assistant", icon: MessageSquareMore, badge: "AI" },
    { label: "Settings",  href: "/settings",  icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-white overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-white" fill="currentColor" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Chrona <span className="text-indigo-600">Work</span>
          </span>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 py-3 border-b border-border">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Acme Corp</p>
            <p className="text-xs text-muted-foreground">Growth plan</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, badge, count, countColor }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-indigo-600" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 font-bold">
                    {badge}
                  </Badge>
                )}
                {count !== undefined && (
                  <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${countColor ?? "bg-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Current user + dev switcher */}
      <div className="px-3 py-3 border-t border-border space-y-1.5">
        {/* Dev user switcher */}
        {users.length > 0 && (
          <div className="px-1">
            <p className="text-[10px] font-medium text-muted-foreground mb-1 px-1.5">
              Dev: viewing as
            </p>
            <Select value={currentUser?.id ?? ""} onValueChange={switchUser}>
              <SelectTrigger className="h-8 text-xs border-border bg-muted/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        u.role === "admin"   ? "bg-indigo-100 text-indigo-700" :
                        u.role === "manager" ? "bg-violet-100 text-violet-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{u.role}</span>
                      {u.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <button
          onClick={resetDemo}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Reset all tasks back to demo seed data"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          Reset demo data
        </button>
      </div>
    </aside>
  );
}
