import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <nav className="h-16 flex items-center px-8 border-b border-border bg-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Chrona <span className="text-indigo-600">Work</span>
          </span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">{children}</div>
      <footer className="h-14 flex items-center justify-center border-t border-border bg-white">
        <p className="text-xs text-muted-foreground">© 2026 Chrona, Inc. · Privacy · Terms</p>
      </footer>
    </div>
  );
}
