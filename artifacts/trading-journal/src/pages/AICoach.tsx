import { useAnalytics } from "../hooks/useAnalytics";
import { InsightCard } from "../components/InsightCard";
import { EmptyState } from "../components/EmptyState";
import { Brain, Target, Clock, Calendar, Zap, AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export function AICoach() {
  const analytics = useAnalytics();

  if (analytics.totalTrades < 5) {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Brain className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
        </div>
        <EmptyState 
          title="Not enough data" 
          description={`You have ${analytics.totalTrades} trades. Add at least 5 trades to unlock personalized AI insights and coaching.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-primary to-cyan-500 rounded-2xl shadow-lg shadow-primary/20">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Your AI Coach</h1>
          <p className="text-muted-foreground">Personalized feedback based on your trading data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightCard title="Strategy Analysis" icon={<Target />} delay={0.1}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">●</span>
              <span><strong>Best Setup:</strong> {analytics.bestStrategy} is driving your growth with a {analytics.strategyStats[analytics.bestStrategy]?.winRate.toFixed(1)}% win rate.</span>
            </li>
            {analytics.worstStrategy !== '-' && (
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">●</span>
                <span><strong>Needs Review:</strong> {analytics.worstStrategy} is underperforming. Consider backtesting this before trading it live again.</span>
              </li>
            )}
          </ul>
        </InsightCard>

        <InsightCard title="Time & Day Analysis" icon={<Clock />} delay={0.2}>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">●</span>
              <span><strong>Power Hour:</strong> You are most profitable around {analytics.bestTradingTime}. Ensure maximum focus here.</span>
            </li>
            {analytics.worstTradingTime !== '-' && (
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">●</span>
                <span><strong>Danger Zone:</strong> Avoid trading at {analytics.worstTradingTime} based on historical losses.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">●</span>
              <span><strong>Best Day:</strong> {analytics.bestTradingDay}.</span>
            </li>
          </ul>
        </InsightCard>

        <InsightCard title="Consistency & Psychology" icon={<Zap />} delay={0.3}>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Discipline Score</span>
              <span className="font-mono">{analytics.consistencyScore.toFixed(0)}/100</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-cyan-400" 
                style={{ width: `${analytics.consistencyScore}%` }}
              />
            </div>
          </div>
          <p>
            {analytics.longestLoseStreak > 3 
              ? "You tend to go on tilt after consecutive losses. Implement a hard stop after 2 losses in a row." 
              : "You show good emotional control during drawdowns. Keep protecting your downside."}
          </p>
        </InsightCard>

        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-2xl md:col-span-1 lg:col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-primary">Top Action Items</h3>
          </div>
          <ul className="space-y-4">
            {analytics.aiInsights.slice(0,3).map((insight, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                key={i} 
                className="flex items-start gap-3 text-sm md:text-base"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-medium text-xs mt-0.5">
                  {i + 1}
                </div>
                <span className="leading-relaxed">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}