import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useTrades } from "../hooks/useTrades";
import { motion, AnimatePresence } from "framer-motion";

const COMMON_INDICES = ["NIFTY", "BANKNIFTY", "SENSEX", "MIDCAP", "FINNIFTY"];
const COMMON_STRATEGIES = ["Breakout", "Scalping", "Swing", "Reversal", "Momentum"];

export function AddTradeModal({ onClose }: { onClose: () => void }) {
  const { addTrade } = useTrades();
  
  const now = new Date();
  const [date, setDate] = useState(format(now, "yyyy-MM-dd"));
  const [time, setTime] = useState(format(now, "HH:mm"));
  const [pnl, setPnl] = useState("");
  const [indexName, setIndexName] = useState("NIFTY");
  const [strategyName, setStrategyName] = useState("Scalping");
  const [customIndex, setCustomIndex] = useState("");
  const [customStrategy, setCustomStrategy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnl) return;

    addTrade({
      date,
      time,
      pnl: parseFloat(pnl),
      indexName: indexName === "Other" ? customIndex : indexName,
      strategyName: strategyName === "Other" ? customStrategy : strategyName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }} 
        className="relative w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
            Log New Trade
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground font-medium">Date</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground font-medium">Time</label>
              <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground font-medium">Net P&L (₹)</label>
            <input type="number" required autoFocus value={pnl} onChange={e => setPnl(e.target.value)} placeholder="e.g. 1500 or -500" className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none text-lg font-mono" />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground font-medium">Index / Asset</label>
            <select value={indexName} onChange={e => setIndexName(e.target.value)} className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none">
              {COMMON_INDICES.map(idx => <option key={idx} value={idx}>{idx}</option>)}
              <option value="Other">Other...</option>
            </select>
            {indexName === "Other" && (
              <input type="text" required value={customIndex} onChange={e => setCustomIndex(e.target.value)} placeholder="Enter index name" className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground mt-2 focus:ring-1 focus:ring-primary outline-none" />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground font-medium">Strategy</label>
            <select value={strategyName} onChange={e => setStrategyName(e.target.value)} className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary outline-none">
              {COMMON_STRATEGIES.map(st => <option key={st} value={st}>{st}</option>)}
              <option value="Other">Other...</option>
            </select>
            {strategyName === "Other" && (
              <input type="text" required value={customStrategy} onChange={e => setCustomStrategy(e.target.value)} placeholder="Enter strategy name" className="w-full bg-input/50 border border-border rounded-lg p-2.5 text-foreground mt-2 focus:ring-1 focus:ring-primary outline-none" />
            )}
          </div>

          <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
            Save Trade
          </button>
        </form>
      </motion.div>
    </div>
  );
}