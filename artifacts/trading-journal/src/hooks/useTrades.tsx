import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Trade, loadTrades, saveTrades, addTrade as addTradeStorage, deleteTrade as deleteTradeStorage, deleteAllTrades as deleteAllStorage } from '../lib/storage';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, "id" | "createdAt">) => void;
  deleteTrade: (id: string) => void;
  deleteAll: () => void;
}

export const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(loadTrades());
  }, []);

  const addTrade = useCallback((trade: Omit<Trade, "id" | "createdAt">) => {
    const newTrade = addTradeStorage(trade);
    if (newTrade) {
      setTrades(prev => [...prev, newTrade]);
    }
  }, []);

  const deleteTrade = useCallback((id: string) => {
    deleteTradeStorage(id);
    setTrades(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteAll = useCallback(() => {
    deleteAllStorage();
    setTrades([]);
  }, []);

  return (
    <TradeContext.Provider value={{ trades, addTrade, deleteTrade, deleteAll }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrades must be used within TradeProvider");
  return context;
}