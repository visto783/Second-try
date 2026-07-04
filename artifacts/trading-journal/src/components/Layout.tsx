import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, BookOpen, BarChart2, Brain, FileText, Menu, X, Plus, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddTradeModal } from "./AddTradeModal";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: BookOpen, label: "Journal", href: "/journal" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Brain, label: "AI Coach", href: "/ai-coach" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-400">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
            TradeMind
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar/90 backdrop-blur-md border-b border-sidebar-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-cyan-400">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">TradeMind</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-30 bg-background/95 backdrop-blur-xl md:hidden pt-20 px-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const active = location === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-4 p-4 rounded-xl ${active ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground"}`}>
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="min-h-full p-6 md:p-8">
          {children}
        </motion.div>
      </main>

      {/* Floating Add Button */}
      <button 
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-primary via-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 transition-transform z-30 animate-pulse"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {addModalOpen && <AddTradeModal onClose={() => setAddModalOpen(false)} />}
    </div>
  );
}