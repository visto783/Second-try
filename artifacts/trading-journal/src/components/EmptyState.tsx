import { motion } from "framer-motion";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-card/20 border border-dashed border-card-border rounded-3xl"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-500 animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </motion.div>
  );
}