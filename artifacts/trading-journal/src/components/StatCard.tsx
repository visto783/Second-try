import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "success" | "danger" | "primary";
}

export function StatCard({ title, value, prefix = "", suffix = "", icon, trend, color = "default" }: StatCardProps) {
  // Simple count-up animation for numbers
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    
    let start = 0;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeOutQuart;
      
      setDisplayValue(Number.isInteger(end) ? Math.round(current) : Number(current.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const colorClasses = {
    default: "text-foreground",
    success: "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]",
    danger: "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]",
    primary: "text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]",
  };

  return (
    <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-2xl p-5 flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
      </div>
      
      <div className="mt-auto">
        <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${colorClasses[color]}`}>
          {prefix}{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
        </span>
      </div>
    </div>
  );
}