import { useAnalytics } from "../hooks/useAnalytics";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function Analytics() {
  const analytics = useAnalytics();

  if (analytics.totalTrades === 0) {
    return (
      <div className="h-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <EmptyState title="No data available" description="Add trades to see detailed performance analytics." />
      </div>
    );
  }

  const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--card-border))',
    borderRadius: '0.5rem',
    color: 'hsl(var(--foreground))',
  };

  const strategyData = Object.entries(analytics.strategyStats).map(([name, data]) => ({
    name,
    winRate: data.winRate,
    pnl: data.pnl,
    trades: data.trades
  })).sort((a,b) => b.trades - a.trades);

  const indexData = Object.entries(analytics.indexStats).map(([name, data]) => ({
    name,
    pnl: data.pnl
  })).sort((a,b) => b.pnl - a.pnl);

  const hourData = Object.entries(analytics.hourlyPnl).map(([hour, pnl]) => ({
    hour: `${hour.padStart(2, '0')}:00`,
    pnl
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Deep Analytics</h1>
        <p className="text-muted-foreground">Uncover patterns in your trading behavior.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Avg Profit" value={analytics.avgProfit} prefix="₹" color="success" />
        <StatCard title="Avg Loss" value={Math.abs(analytics.avgLoss)} prefix="₹" color="danger" />
        <StatCard title="Max Win Streak" value={analytics.longestWinStreak} />
        <StatCard title="Max Lose Streak" value={analytics.longestLoseStreak} />
        <StatCard title="Trades / Day" value={analytics.tradeFrequency} />
        <StatCard title="Consistency" value={analytics.consistencyScore} suffix="/100" color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Win Rate */}
        <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Strategy Win Rate (%)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Index P&L */}
        <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">P&L by Asset/Index</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indexData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {indexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly P&L */}
        <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Performance by Hour</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'hsl(var(--secondary))' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {hourData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Table */}
        <div className="bg-card/40 border border-card-border p-6 rounded-2xl overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Strategy Details</h3>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border text-muted-foreground">
                  <th className="pb-3 font-medium">Strategy</th>
                  <th className="pb-3 font-medium text-right">Trades</th>
                  <th className="pb-3 font-medium text-right">Win Rate</th>
                  <th className="pb-3 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {strategyData.map(st => (
                  <tr key={st.name} className="border-b border-card-border/30 last:border-0">
                    <td className="py-3">{st.name}</td>
                    <td className="py-3 text-right">{st.trades}</td>
                    <td className="py-3 text-right">{st.winRate.toFixed(1)}%</td>
                    <td className={`py-3 text-right font-mono ${st.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {st.pnl >= 0 ? '+' : '-'}₹{Math.abs(st.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}