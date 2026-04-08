import { getSalesSummary, getSlowMovingProducts, getTopSellingProducts } from "../models/reportModel.js";

export async function getSummaryReport(query) {
  const range = query.range === "monthly" ? "monthly" : "daily";
  const now = new Date().toISOString().slice(0, 10);

  return {
    range,
    data: await getSalesSummary({
      range,
      date: query.date || now,
      yearMonth: query.yearMonth || now.slice(0, 7)
    })
  };
}

export async function getTopSellingReport(limit) {
  return getTopSellingProducts(Number(limit) || 10);
}

export async function getSlowMovingReport(days) {
  return getSlowMovingProducts(Number(days) || 30);
}
