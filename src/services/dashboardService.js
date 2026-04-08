import { getDashboardRows } from "../models/reportModel.js";

export async function getDashboardData() {
  const rows = await getDashboardRows();

  return {
    counters: {
      totalSalesToday: Number(rows.salesToday.total_sales_today || 0),
      totalProfitToday: Number(rows.salesToday.total_profit_today || 0),
      totalTransactions: Number(rows.salesToday.total_transactions || 0),
      totalUtangBalance: Number(rows.credit.total_utang_balance || 0)
    },
    lowStockAlerts: rows.lowStock,
    topSellingProducts: rows.topSelling,
    slowMovingProducts: rows.slowMoving,
    recentTransactions: rows.recentTransactions,
    chart: {
      labels: ["Sales", "Profit", "Transactions", "Utang"],
      values: [
        Number(rows.salesToday.total_sales_today || 0),
        Number(rows.salesToday.total_profit_today || 0),
        Number(rows.salesToday.total_transactions || 0),
        Number(rows.credit.total_utang_balance || 0)
      ]
    }
  };
}
