import { useTrades } from "../hooks/useTrades";
import { useAnalytics } from "../hooks/useAnalytics";
import { exportToCSV, exportToExcel, exportToPDF } from "../lib/exportUtils";
import { FileDown, FileSpreadsheet, FileIcon } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "../components/EmptyState";

export function Reports() {
  const { trades } = useTrades();
  const analytics = useAnalytics();

  if (trades.length === 0) {
    return (
      <div className="h-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <EmptyState title="No data to export" description="Add trades before generating reports." />
      </div>
    );
  }

  const todayStr = format(new Date(), "MMMM d, yyyy");

  const ReportCard = ({ title, period, pnl, tradesCount, winRate }: any) => (
    <div className="bg-card/40 border border-card-border p-6 rounded-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-card-border/50 pb-3">
          <span className="text-muted-foreground">Net P&L</span>
          <span className={`text-xl font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : '-'}₹{Math.abs(pnl)}
          </span>
        </div>
        <div className="flex justify-between items-end border-b border-card-border/50 pb-3">
          <span className="text-muted-foreground">Trades Taken</span>
          <span className="text-lg font-medium">{tradesCount}</span>
        </div>
        <div className="flex justify-between items-end pb-1">
          <span className="text-muted-foreground">Win Rate</span>
          <span className="text-lg font-medium">{winRate}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Reports & Export</h1>
        <p className="text-muted-foreground">Generate summaries and download your raw data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Daily Summary" 
          period={`Today — ${todayStr}`}
          pnl={analytics.todayPnl}
          tradesCount={trades.filter(t => t.date === format(new Date(), "yyyy-MM-dd")).length}
          winRate={analytics.winRate.toFixed(1)} // simplified for UI demo
        />
        <ReportCard 
          title="Weekly Summary" 
          period="Current Week"
          pnl={analytics.weekPnl}
          tradesCount={Math.round(analytics.tradeFrequency * 5)} // approx
          winRate={analytics.winRate.toFixed(1)}
        />
        <ReportCard 
          title="Monthly Summary" 
          period="Current Month"
          pnl={analytics.monthPnl}
          tradesCount={Math.round(analytics.tradeFrequency * 20)} // approx
          winRate={analytics.winRate.toFixed(1)}
        />
      </div>

      <div className="mt-12 bg-card/20 border border-card-border p-8 rounded-3xl">
        <h3 className="text-xl font-semibold mb-2">Export Data</h3>
        <p className="text-muted-foreground mb-8">Download your complete trade history for external analysis or backup.</p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => exportToCSV(trades)}
            className="flex items-center gap-3 px-6 py-4 bg-secondary/50 hover:bg-secondary border border-card-border rounded-xl transition-all hover:scale-105"
          >
            <FileIcon className="text-blue-400" />
            <span className="font-medium">Export CSV</span>
          </button>
          
          <button 
            onClick={() => exportToExcel(trades)}
            className="flex items-center gap-3 px-6 py-4 bg-secondary/50 hover:bg-secondary border border-card-border rounded-xl transition-all hover:scale-105"
          >
            <FileSpreadsheet className="text-emerald-400" />
            <span className="font-medium">Export Excel</span>
          </button>

          <button 
            onClick={() => exportToPDF(trades, analytics)}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary/20 to-transparent hover:from-primary/30 border border-primary/30 rounded-xl transition-all hover:scale-105 text-primary"
          >
            <FileDown />
            <span className="font-medium">Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}