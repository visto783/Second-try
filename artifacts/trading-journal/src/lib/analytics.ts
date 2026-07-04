import { Trade } from './storage';
import { subDays, startOfWeek, startOfMonth, parseISO, isAfter, format } from 'date-fns';

export interface Analytics {
  totalTrades: number;
  totalPnl: number;
  winRate: number;           
  lossRate: number;          
  wins: number;
  losses: number;
  avgProfit: number;
  avgLoss: number;

  currentWinStreak: number;
  currentLoseStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;

  todayPnl: number;
  weekPnl: number;
  monthPnl: number;

  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;

  bestStrategy: string;
  worstStrategy: string;
  bestIndex: string;
  worstIndex: string;
  bestTradingTime: string;   
  worstTradingTime: string;
  bestTradingDay: string;    
  worstTradingDay: string;

  strategyStats: Record<string, { trades: number; pnl: number; winRate: number }>;
  indexStats: Record<string, { trades: number; pnl: number; winRate: number }>;
  hourlyPnl: Record<number, number>;
  weekdayPnl: Record<number, number>;
  calendarData: Record<string, number>;

  equityCurve: { date: string; equity: number }[];
  profitTrend: { date: string; pnl: number }[];

  tradeFrequency: number;
  consistencyScore: number;
  aiInsights: string[];
}

export function computeAnalytics(trades: Trade[]): Analytics {
  const emptyAnalytics: Analytics = {
    totalTrades: 0,
    totalPnl: 0,
    winRate: 0,
    lossRate: 0,
    wins: 0,
    losses: 0,
    avgProfit: 0,
    avgLoss: 0,
    currentWinStreak: 0,
    currentLoseStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    todayPnl: 0,
    weekPnl: 0,
    monthPnl: 0,
    dailyGrowth: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    bestStrategy: '-',
    worstStrategy: '-',
    bestIndex: '-',
    worstIndex: '-',
    bestTradingTime: '-',
    worstTradingTime: '-',
    bestTradingDay: '-',
    worstTradingDay: '-',
    strategyStats: {},
    indexStats: {},
    hourlyPnl: {},
    weekdayPnl: {},
    calendarData: {},
    equityCurve: [],
    profitTrend: [],
    tradeFrequency: 0,
    consistencyScore: 0,
    aiInsights: []
  };

  if (trades.length === 0) return emptyAnalytics;

  // Sorted by date/time ascending
  const sortedTrades = [...trades].sort((a, b) => {
    const d = new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    return d === 0 ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : d;
  });

  let totalPnl = 0;
  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;

  let equity = 0;
  const equityCurve: { date: string; equity: number }[] = [];
  const calendarData: Record<string, number> = {};
  const hourlyPnl: Record<number, number> = {};
  const weekdayPnl: Record<number, number> = {};

  const strategyStats: Record<string, { trades: number; pnl: number; wins: number }> = {};
  const indexStats: Record<string, { trades: number; pnl: number; wins: number }> = {};
  const dailyPnls: Record<string, number> = {};

  const now = new Date();
  const todayDateStr = format(now, "yyyy-MM-dd");
  const weekStartDate = startOfWeek(now, { weekStartsOn: 1 });
  const monthStartDate = startOfMonth(now);

  let todayPnl = 0;
  let weekPnl = 0;
  let monthPnl = 0;

  sortedTrades.forEach(trade => {
    totalPnl += trade.pnl;
    equity += trade.pnl;

    const tDate = parseISO(trade.date);
    const dateKey = trade.date;

    if (trade.pnl > 0) {
      wins++;
      grossProfit += trade.pnl;
      currentWinStreak++;
      currentLoseStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (trade.pnl < 0) {
      losses++;
      grossLoss += trade.pnl;
      currentLoseStreak++;
      currentWinStreak = 0;
      longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
    } else {
      currentWinStreak = 0;
      currentLoseStreak = 0;
    }

    if (dateKey === todayDateStr) todayPnl += trade.pnl;
    if (tDate >= weekStartDate) weekPnl += trade.pnl;
    if (tDate >= monthStartDate) monthPnl += trade.pnl;

    calendarData[dateKey] = (calendarData[dateKey] || 0) + trade.pnl;
    dailyPnls[dateKey] = (dailyPnls[dateKey] || 0) + trade.pnl;

    const hour = parseInt(trade.time.split(':')[0], 10);
    hourlyPnl[hour] = (hourlyPnl[hour] || 0) + trade.pnl;

    const dayOfWeek = tDate.getDay();
    weekdayPnl[dayOfWeek] = (weekdayPnl[dayOfWeek] || 0) + trade.pnl;

    if (!strategyStats[trade.strategyName]) strategyStats[trade.strategyName] = { trades: 0, pnl: 0, wins: 0 };
    strategyStats[trade.strategyName].trades++;
    strategyStats[trade.strategyName].pnl += trade.pnl;
    if (trade.pnl > 0) strategyStats[trade.strategyName].wins++;

    if (!indexStats[trade.indexName]) indexStats[trade.indexName] = { trades: 0, pnl: 0, wins: 0 };
    indexStats[trade.indexName].trades++;
    indexStats[trade.indexName].pnl += trade.pnl;
    if (trade.pnl > 0) indexStats[trade.indexName].wins++;

    equityCurve.push({ date: `${trade.date} ${trade.time}`, equity });
  });

  const total = wins + losses || 1;
  const winRate = (wins / total) * 100;
  const lossRate = (losses / total) * 100;

  const getBest = (obj: Record<string, { pnl: number }>) => Object.entries(obj).sort((a, b) => b[1].pnl - a[1].pnl)[0]?.[0] || '-';
  const getWorst = (obj: Record<string, { pnl: number }>) => Object.entries(obj).sort((a, b) => a[1].pnl - b[1].pnl)[0]?.[0] || '-';

  const bestStrategy = getBest(strategyStats);
  const worstStrategy = getWorst(strategyStats);
  const bestIndex = getBest(indexStats);
  const worstIndex = getWorst(indexStats);

  const getBestNum = (obj: Record<number, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const getWorstNum = (obj: Record<number, number>) => Object.entries(obj).sort((a, b) => a[1] - b[1])[0]?.[0] || '-';

  const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const bestHourStr = getBestNum(hourlyPnl);
  const worstHourStr = getWorstNum(hourlyPnl);
  const bestTradingTime = bestHourStr !== '-' ? `${bestHourStr.padStart(2, '0')}:00` : '-';
  const worstTradingTime = worstHourStr !== '-' ? `${worstHourStr.padStart(2, '0')}:00` : '-';

  const bestDayNum = getBestNum(weekdayPnl);
  const worstDayNum = getWorstNum(weekdayPnl);
  const bestTradingDay = bestDayNum !== '-' ? daysArr[parseInt(bestDayNum)] : '-';
  const worstTradingDay = worstDayNum !== '-' ? daysArr[parseInt(worstDayNum)] : '-';

  const mappedStrategyStats: Record<string, any> = {};
  for (const [k, v] of Object.entries(strategyStats)) {
    mappedStrategyStats[k] = { trades: v.trades, pnl: v.pnl, winRate: (v.wins / (v.trades||1)) * 100 };
  }
  const mappedIndexStats: Record<string, any> = {};
  for (const [k, v] of Object.entries(indexStats)) {
    mappedIndexStats[k] = { trades: v.trades, pnl: v.pnl, winRate: (v.wins / (v.trades||1)) * 100 };
  }

  const profitTrend = Object.entries(dailyPnls).sort((a,b) => a[0].localeCompare(b[0])).slice(-30).map(([date, pnl]) => ({ date, pnl }));

  const activeDays = Object.keys(dailyPnls).length || 1;
  const tradeFrequency = trades.length / activeDays;
  const consistencyScore = Math.min(100, Math.max(0, winRate - (longestLoseStreak * 2) + (activeDays * 0.5)));

  const aiInsights = [];
  if (bestStrategy !== '-' && mappedStrategyStats[bestStrategy]?.winRate > 50) {
    aiInsights.push(`Your strongest strategy is ${bestStrategy} with a ${mappedStrategyStats[bestStrategy].winRate.toFixed(1)}% win rate. Consider sizing up on these setups.`);
  }
  if (worstTradingTime !== '-' && hourlyPnl[parseInt(worstHourStr)] < 0) {
    aiInsights.push(`Avoid trading around ${worstTradingTime} — you've consistently lost money during this window.`);
  }
  if (bestTradingDay !== '-') {
    aiInsights.push(`You perform exceptionally well on ${bestTradingDay}s. Ensure you're well-rested and focused on these days.`);
  }
  if (longestLoseStreak >= 3) {
    aiInsights.push(`You've had a streak of ${longestLoseStreak} losses. Remember to implement a daily loss limit to protect your mental capital.`);
  }
  if (winRate > 60) {
    aiInsights.push(`Excellent hit rate at ${winRate.toFixed(1)}%. Focus on letting your winners run longer to improve your risk/reward ratio.`);
  }
  if (aiInsights.length < 5) {
    aiInsights.push("Maintain a detailed journal for every trade to uncover deeper patterns.");
    aiInsights.push("Consistency is built by following your system, not by chasing P&L.");
  }

  return {
    totalTrades: trades.length,
    totalPnl,
    winRate,
    lossRate,
    wins,
    losses,
    avgProfit: wins > 0 ? grossProfit / wins : 0,
    avgLoss: losses > 0 ? grossLoss / losses : 0,
    currentWinStreak,
    currentLoseStreak,
    longestWinStreak,
    longestLoseStreak,
    todayPnl,
    weekPnl,
    monthPnl,
    dailyGrowth: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    bestStrategy,
    worstStrategy,
    bestIndex,
    worstIndex,
    bestTradingTime,
    worstTradingTime,
    bestTradingDay,
    worstTradingDay,
    strategyStats: mappedStrategyStats,
    indexStats: mappedIndexStats,
    hourlyPnl,
    weekdayPnl,
    calendarData,
    equityCurve,
    profitTrend,
    tradeFrequency,
    consistencyScore,
    aiInsights
  };
}