import { Trade } from './storage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function exportToCSV(trades: Trade[]) {
  const headers = ['Date', 'Time', 'Index', 'Strategy', 'P&L', 'Created At'];
  const rows = trades.map(t => [t.date, t.time, t.indexName, t.strategyName, t.pnl.toString(), t.createdAt]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `trades_export_${format(new Date(), 'yyyyMMdd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(trades: Trade[]) {
  const ws = XLSX.utils.json_to_sheet(trades.map(t => ({
    Date: t.date,
    Time: t.time,
    Index: t.indexName,
    Strategy: t.strategyName,
    'P&L': t.pnl,
    'Created At': t.createdAt
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trades");
  XLSX.writeFile(wb, `trades_export_${format(new Date(), 'yyyyMMdd')}.xlsx`);
}

export function exportToPDF(trades: Trade[], analytics: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("TradeMind - Trading Journal Report", 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);
  doc.text(`Total Trades: ${analytics.totalTrades} | Total P&L: Rs ${analytics.totalPnl} | Win Rate: ${analytics.winRate.toFixed(1)}%`, 14, 36);

  const tableData = trades.map(t => [
    t.date,
    t.time,
    t.indexName,
    t.strategyName,
    t.pnl > 0 ? `+Rs ${t.pnl}` : `-Rs ${Math.abs(t.pnl)}`
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Date', 'Time', 'Index', 'Strategy', 'P&L']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] }
  });

  doc.save(`trades_export_${format(new Date(), 'yyyyMMdd')}.pdf`);
}