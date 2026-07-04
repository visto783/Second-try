import { useTrades } from "../hooks/useTrades";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export function Journal() {
  const { trades, deleteTrade, deleteAll } = useTrades();

  // Sort by date desc, then time desc
  const sortedTrades = [...trades].sort((a, b) => {
    const d = new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
    return d === 0 ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : d;
  });

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete ALL trades? This cannot be undone.")) {
      deleteAll();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Journal</h1>
        <p className="text-muted-foreground">View and manage your trade history.</p>
      </div>

      {trades.length === 0 ? (
        <EmptyState 
          title="No trades yet" 
          description="Use the + button in the bottom right to log your first trade." 
        />
      ) : (
        <div className="bg-card/40 border border-card-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-secondary/30">
                  <th className="p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-muted-foreground">Time</th>
                  <th className="p-4 font-medium text-muted-foreground">Index</th>
                  <th className="p-4 font-medium text-muted-foreground">Strategy</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">P&L</th>
                  <th className="p-4 font-medium text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.map(trade => {
                  const isProfit = trade.pnl > 0;
                  const isLoss = trade.pnl < 0;
                  
                  return (
                    <tr key={trade.id} className="border-b border-card-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 whitespace-nowrap">{format(parseISO(trade.date), "MMM dd, yyyy")}</td>
                      <td className="p-4 text-muted-foreground">{trade.time}</td>
                      <td className="p-4">
                        <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">{trade.indexName}</span>
                      </td>
                      <td className="p-4">{trade.strategyName}</td>
                      <td className={`p-4 text-right font-mono font-medium ${isProfit ? 'text-emerald-400' : isLoss ? 'text-red-400' : ''}`}>
                        {isProfit ? '+' : ''}{trade.pnl !== 0 ? `₹${Math.abs(trade.pnl)}` : '₹0'}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            if(confirm("Delete this trade?")) deleteTrade(trade.id);
                          }}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-card-border bg-secondary/10 flex justify-end">
            <button 
              onClick={handleDeleteAll}
              className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              Delete All Trades
            </button>
          </div>
        </div>
      )}
    </div>
  );
}