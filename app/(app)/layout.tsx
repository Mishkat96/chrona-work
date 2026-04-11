"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, Calendar, Users, BarChart3,
  MessageSquareMore, Settings, Zap, Bell, Search, ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Planner", href: "/planner", icon: Calendar },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Assistant", href: "/assistant", icon: MessageSquareMore, badge: "AI" },
  { label: "Settings", href: "/settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();

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
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Acme Corp</p>
            <p className="text-xs text-muted-foreground">Growth plan</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <span className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-indigo-600" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 font-bold">{badge}</Badge>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <Avatar className="w-7 h-7 text-[11px]">
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const pathname = usePathname();
  const current = navItems.find((n) => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href)));

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-white sticky top-0 z-30">
      <div>
        <h1 className="text-sm font-semibold text-foreground">{current?.label ?? "Chrona Work"}</h1>
      </div>
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
