"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTasks } from "@/lib/store-context";
import { signOut } from "@/lib/auth";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  const pathname  = usePathname();
  const router    = useRouter();
  const {
    currentUser,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useTasks();

  const [bellOpen,    setBellOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const bellRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close bell on outside click
  useEffect(() => {
    if (!bellOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [bellOpen]);

  // Close profile on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [profileOpen]);

  const current = navItems.find(
    (n) => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
  );

  const recentNotifs = notifications.slice(0, 10);

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  const roleBadgeClass =
    currentUser?.role === "admin"
      ? "bg-indigo-100 text-indigo-700"
      : currentUser?.role === "manager"
      ? "bg-violet-100 text-violet-700"
      : "bg-slate-100 text-slate-600";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-white sticky top-0 z-30">
      <h1 className="text-sm font-semibold text-foreground">
        {current?.label ?? "Chrona Work"}
      </h1>

      <div className="flex items-center gap-2">

        {/* ── Bell ─────────────────────────────────────────────────────── */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {recentNotifs.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-muted-foreground text-center">
                    No notifications yet
                  </p>
                ) : (
                  recentNotifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                        !n.read && "bg-indigo-50/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        )}
                        <div className={cn("min-w-0", n.read && "pl-3.5")}>
                          <p className="text-xs font-medium text-foreground truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatRelative(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile avatar ────────────────────────────────────────────── */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen((o) => !o)}>
            <Avatar className="w-8 h-8 cursor-pointer text-xs">
              <AvatarFallback>{currentUser?.initials ?? "?"}</AvatarFallback>
            </Avatar>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-60 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentUser?.email}
                </p>
                <span
                  className={cn(
                    "inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium capitalize",
                    roleBadgeClass
                  )}
                >
                  {currentUser?.role}
                </span>
              </div>

              <div className="py-1">
                <a
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
