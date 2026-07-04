import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function InsightCard({ title, children, icon, delay = 0 }: { title: string; children: ReactNode; icon?: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card/40 backdrop-blur-md border border-card-border rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-secondary rounded-lg text-primary">
          {icon || <Sparkles className="w-5 h-5" />}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="text-muted-foreground leading-relaxed relative z-10">
        {children}
      </div>
    </motion.div>
  );
}