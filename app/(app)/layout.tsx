"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { TasksProvider } from "@/lib/store-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
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
    </TasksProvider>
  );
}
