import { useAnalytics } from "../hooks/useAnalytics";
import { StatCard } from "../components/StatCard";
import { CalendarHeatmap } from "../components/CalendarHeatmap";
import { EmptyState } from "../components/EmptyState";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Target, Zap, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export function Dashboard() {
  const analytics = useAnalytics();

  if (analytics.totalTrades === 0) {
    return (
      <div className="h-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="Welcome to TradeMind" 
            description="Add your first trade to unlock powerful AI insights and analytics."
          />
        </div>
      </div>
    );
  }

  const chartData = analytics.profitTrend.map(d => ({
    ...d,
    date: d.date.split('-').slice(1).join('/') // MM/DD
  }));

  const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--card-border))',
    borderRadius: '0.5rem',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your trading performance.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Trades" value={analytics.totalTrades} icon={<Activity className="w-4 h-4" />} />
        <StatCard 
          title="Net P&L" 
          value={Math.abs(analytics.totalPnl)} 
          prefix={analytics.totalPnl >= 0 ? "+₹" : "-₹"} 
          color={analytics.totalPnl >= 0 ? "success" : "danger"}
          icon={analytics.totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />} 
        />
        <StatCard title="Win Rate" value={analytics.winRate} suffix="%" color={analytics.winRate > 50 ? "success" : "default"} icon={<Target className="w-4 h-4" />} />
        <StatCard title="Loss Rate" value={analytics.lossRate} suffix="%" />
        <StatCard title="Win Streak" value={analytics.currentWinStreak} color={analytics.currentWinStreak > 0 ? "success" : "default"} icon={<Zap className="w-4 h-4 text-emerald-400" />} />
        <StatCard title="Lose Streak" value={analytics.currentLoseStreak} color={analytics.currentLoseStreak > 0 ? "danger" : "default"} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/40 border border-card-border p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Today's P&L</p>
            <p className={`text-xl font-bold font-mono ${analytics.todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {analytics.todayPnl >= 0 ? "+" : "-"}₹{Math.abs(analytics.todayPnl)}
            </p>
          </div>
          <Clock className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <div className="bg-card/40 border border-card-border p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Weekly P&L</p>
            <p className={`text-xl font-bold font-mono ${analytics.weekPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {analytics.weekPnl >= 0 ? "+" : "-"}₹{Math.abs(analytics.weekPnl)}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <div className="bg-card/40 border border-card-border p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly P&L</p>
            <p className={`text-xl font-bold font-mono ${analytics.monthPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {analytics.monthPnl >= 0 ? "+" : "-"}₹{Math.abs(analytics.monthPnl)}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Equity Curve</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.equityCurve}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} />
                <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Daily Profit/Loss (30 Days)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-6">Activity Heatmap</h3>
        <CalendarHeatmap data={analytics.calendarData} />
      </div>

      {/* Quick AI Insights */}
      {analytics.aiInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.aiInsights.slice(0,3).map((insight, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3"
            >
              <Zap className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-primary/90 leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}