import { useAnalytics } from "../hooks/useAnalytics";
import { useTrades } from "../hooks/useTrades";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Calendar,
  Clock,
  Gauge,
  LineChart,
  MessageSquare,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
}

function CoachPanel({
  title,
  eyebrow,
  icon,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  eyebrow: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-[#10151f]/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            {eyebrow}
          </p>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.06] p-2 text-cyan-200">
          {icon}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-white";

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export function AICoach() {
  const analytics = useAnalytics();
  const { trades } = useTrades();
  const [geminiResponse, setGeminiResponse] = useState("Loading AI analysis...");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about your journal, risk, strategy selection, revenge trading, or what to focus on next session.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const riskReward = useMemo(() => {
    if (!analytics.avgLoss) return 0;
    return analytics.avgProfit / Math.abs(analytics.avgLoss);
  }, [analytics.avgLoss, analytics.avgProfit]);

  const topStrategies = useMemo(
    () =>
      Object.entries(analytics.strategyStats)
        .sort((a, b) => b[1].pnl - a[1].pnl)
        .slice(0, 4),
    [analytics.strategyStats]
  );

  const hourlyEdges = useMemo(
    () =>
      Object.entries(analytics.hourlyPnl)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    [analytics.hourlyPnl]
  );

  useEffect(() => {
    if (analytics.totalTrades < 5) return;

    async function loadAI() {
      try {
        const response = await fetch("/.netlify/functions/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analytics),
        });

        const data = await response.json();

        if (data.success) {
          setGeminiResponse(data.text);
        } else {
          setGeminiResponse(data.error || "Unable to generate AI analysis.");
        }
      } catch {
        setGeminiResponse("Unable to connect to Gemini.");
      }
    }

    loadAI();
  }, [analytics]);

  async function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = chatInput.trim();
    if (!question || isChatLoading) return;

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: question }];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/.netlify/functions/journal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analytics,
          trades,
          messages: nextMessages,
        }),
      });
      const data = await response.json();

      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.success ? data.text : data.error || "Unable to answer from your journal right now.",
        },
      ]);
    } catch {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Unable to connect to the journal coach right now.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

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
    <div className="pb-20 text-slate-100">
      <section className="relative mb-7 overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#10151f_48%,#0a1f23_100%)] p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-64 bg-cyan-400/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
              <Brain className="h-4 w-4" />
              AI Coach
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Journal desk for risk, strategy, timing, and live GPT coaching.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Your journal is split into tradeable decisions: protect downside, press proven setups, avoid weak windows,
              and ask the coach specific questions before your next session.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricTile label="Total P&L" value={formatMoney(analytics.totalPnl)} tone={analytics.totalPnl >= 0 ? "good" : "bad"} />
            <MetricTile label="Win Rate" value={`${analytics.winRate.toFixed(1)}%`} tone={analytics.winRate >= 50 ? "good" : "bad"} />
            <MetricTile label="Trades" value={String(analytics.totalTrades)} />
            <MetricTile label="Discipline" value={`${analytics.consistencyScore.toFixed(0)}/100`} tone={analytics.consistencyScore >= 55 ? "good" : "bad"} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.95fr]">
        <CoachPanel title="Risk To Reward" eyebrow="Capital Control" icon={<ShieldCheck className="h-5 w-5" />} delay={0.05}>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile label="R:R" value={riskReward ? `${riskReward.toFixed(2)}R` : "-"} tone={riskReward >= 1.5 ? "good" : "bad"} />
            <MetricTile label="Avg Win" value={formatMoney(analytics.avgProfit)} tone="good" />
            <MetricTile label="Avg Loss" value={formatMoney(analytics.avgLoss)} tone="bad" />
          </div>
          <div className="mt-5 rounded-md bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
            {riskReward >= 1.5
              ? "Your winners are paying enough compared with losses. Keep entries selective and avoid cutting strong trades too early."
              : "Your reward profile needs work. Review exits, partials, and stop placement so winners can pay for losing trades."}
          </div>
        </CoachPanel>

        <CoachPanel title="Strategy Analysis" eyebrow="Setup Quality" icon={<Target className="h-5 w-5" />} delay={0.1}>
          <div className="space-y-3">
            {topStrategies.map(([name, stats]) => (
              <div key={name} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{name}</p>
                  <p className={stats.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}>{formatMoney(stats.pnl)}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.min(100, stats.winRate)}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {stats.trades} trades · {stats.winRate.toFixed(1)}% win rate
                </p>
              </div>
            ))}
          </div>
        </CoachPanel>

        <CoachPanel title="Session Timing" eyebrow="When To Trade" icon={<Clock className="h-5 w-5" />} delay={0.15}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-emerald-300/10 p-4">
              <ArrowUpRight className="mt-1 h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-medium text-white">Best window: {analytics.bestTradingTime}</p>
                <p className="text-sm text-slate-400">Best day: {analytics.bestTradingDay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md bg-rose-300/10 p-4">
              <ArrowDownRight className="mt-1 h-5 w-5 text-rose-300" />
              <div>
                <p className="font-medium text-white">Avoid window: {analytics.worstTradingTime}</p>
                <p className="text-sm text-slate-400">Weak day: {analytics.worstTradingDay}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {hourlyEdges.map(([hour, pnl]) => (
                <div key={hour} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-slate-500">{hour.padStart(2, "0")}:00</p>
                  <p className={pnl >= 0 ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
                    {formatMoney(pnl)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CoachPanel>

        <CoachPanel title="Psychology Guardrails" eyebrow="Behavior" icon={<Gauge className="h-5 w-5" />} delay={0.2}>
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Discipline score</span>
              <span className="font-mono text-white">{analytics.consistencyScore.toFixed(0)}/100</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                style={{ width: `${analytics.consistencyScore}%` }}
              />
            </div>
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p>
              Current streak: {analytics.currentWinStreak > 0 ? `${analytics.currentWinStreak} wins` : `${analytics.currentLoseStreak} losses`}
            </p>
            <p>
              Longest loss streak: {analytics.longestLoseStreak}.{" "}
              {analytics.longestLoseStreak >= 3
                ? "Use a two-loss pause rule before taking another setup."
                : "Drawdown behavior is controlled so far."}
            </p>
          </div>
        </CoachPanel>

        <CoachPanel title="AI Action Board" eyebrow="Generated Review" icon={<Zap className="h-5 w-5" />} delay={0.25}>
          <div className="space-y-3">
            {analytics.aiInsights.slice(0, 4).map((insight, index) => (
              <div key={insight} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                  {index + 1}
                </span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-6 text-slate-300">
            {geminiResponse}
          </div>
        </CoachPanel>

        <CoachPanel title="Live Chat With GPT" eyebrow="Journal Q&A" icon={<MessageSquare className="h-5 w-5" />} className="xl:row-span-2" delay={0.3}>
          <div className="flex h-[560px] flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-md p-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-8 bg-cyan-300/12 text-cyan-50"
                      : "mr-8 border border-white/10 bg-white/[0.04] text-slate-300"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {isChatLoading && (
                <div className="mr-8 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-400">
                  Reading your journal...
                </div>
              )}
            </div>
            <form onSubmit={sendChatMessage} className="mt-4 space-y-3">
              <Textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask: Which setup should I avoid this week?"
                className="min-h-24 resize-none border-white/10 bg-slate-950/50 text-slate-100 placeholder:text-slate-500"
              />
              <Button type="submit" disabled={isChatLoading || !chatInput.trim()} className="w-full">
                <Send className="h-4 w-4" />
                Send to GPT Coach
              </Button>
            </form>
          </div>
        </CoachPanel>

        <CoachPanel title="Market Focus" eyebrow="Instrument Read" icon={<LineChart className="h-5 w-5" />} delay={0.35}>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Best Index" value={analytics.bestIndex} tone="good" />
            <MetricTile label="Weak Index" value={analytics.worstIndex} tone="bad" />
            <MetricTile label="Week P&L" value={formatMoney(analytics.weekPnl)} tone={analytics.weekPnl >= 0 ? "good" : "bad"} />
            <MetricTile label="Month P&L" value={formatMoney(analytics.monthPnl)} tone={analytics.monthPnl >= 0 ? "good" : "bad"} />
          </div>
        </CoachPanel>

        <CoachPanel title="Next Session Checklist" eyebrow="Before Entry" icon={<Calendar className="h-5 w-5" />} delay={0.4}>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex gap-3 rounded-md bg-white/[0.04] p-3">
              <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-300" />
              <span>Prioritize {analytics.bestStrategy} only when the setup matches your written rules.</span>
            </div>
            <div className="flex gap-3 rounded-md bg-white/[0.04] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Reduce size or stop trading near {analytics.worstTradingTime} until the data improves.</span>
            </div>
            <div className="flex gap-3 rounded-md bg-white/[0.04] p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
              <span>Do not add risk after {Math.max(2, analytics.longestLoseStreak - 1)} consecutive losses.</span>
            </div>
          </div>
        </CoachPanel>
      </div>
    </div>
  );
}
