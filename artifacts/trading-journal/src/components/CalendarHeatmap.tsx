import { format, subDays, startOfWeek, addDays, getMonth, isSameMonth } from "date-fns";

interface CalendarHeatmapProps {
  data: Record<string, number>; // date "YYYY-MM-DD" -> pnl
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  // Generate last 12 weeks of days
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 12 * 7), { weekStartsOn: 1 });
  
  const days = [];
  for (let i = 0; i < 12 * 7; i++) {
    days.push(addDays(startDate, i));
  }

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (pnl: number | undefined) => {
    if (pnl === undefined || pnl === 0) return "bg-secondary/30";
    if (pnl > 0) {
      if (pnl > 5000) return "bg-emerald-400";
      if (pnl > 2000) return "bg-emerald-500/80";
      return "bg-emerald-500/40";
    } else {
      if (pnl < -5000) return "bg-red-400";
      if (pnl < -2000) return "bg-red-500/80";
      return "bg-red-500/40";
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-1.5 min-w-max">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1.5">
            {week.map((day, dIdx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const pnl = data[dateStr];
              
              return (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-[3px] transition-colors ${getColor(pnl)}`}
                  title={`${format(day, "MMM dd, yyyy")}: ${pnl !== undefined ? `₹${pnl}` : "No trades"}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-red-400" />
          <div className="w-3 h-3 rounded-[2px] bg-red-500/40" />
          <div className="w-3 h-3 rounded-[2px] bg-secondary/30" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-500/40" />
          <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}