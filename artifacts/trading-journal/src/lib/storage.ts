export interface Trade {
  id: string;
  date: string;
  time: string;
  pnl: number;
  indexName: string;
  strategyName: string;
  createdAt: string;
}

const STORAGE_KEY = "trading_journal_trades";

function isValidTrade(t: unknown): t is Trade {
  if (!t || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.date === "string" &&
    typeof o.time === "string" &&
    typeof o.pnl === "number" &&
    !isNaN(o.pnl) &&
    typeof o.indexName === "string" &&
    typeof o.strategyName === "string" &&
    typeof o.createdAt === "string"
  );
}

export function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any malformed entries so one bad record can't crash the app
    return parsed.filter(isValidTrade);
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    return true;
  } catch {
    // Storage quota exceeded or restricted (e.g., private browsing)
    return false;
  }
}

export function addTrade(trade: Omit<Trade, "id" | "createdAt">): Trade | null {
  try {
    const trades = loadTrades();
    const newTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const saved = saveTrades([...trades, newTrade]);
    return saved ? newTrade : null;
  } catch {
    return null;
  }
}

export function deleteTrade(id: string): boolean {
  try {
    const trades = loadTrades();
    return saveTrades(trades.filter((t) => t.id !== id));
  } catch {
    return false;
  }
}

export function deleteAllTrades(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
