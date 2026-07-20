import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen  overflow-hidden p-6 gap-8">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden px-3">
        {/* Header - Fixed at top, doesn't scroll */}
        <Header />

        {/* Children - Only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
