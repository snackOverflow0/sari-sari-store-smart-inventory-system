import { getSlowMovingReport, getSummaryReport, getTopSellingReport } from "../services/reportService.js";

export async function getSummary(req, res) {
  try {
    const summary = await getSummaryReport(req.query);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getTopSelling(req, res) {
  try {
    const rows = await getTopSellingReport(req.query.limit);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getSlowMoving(req, res) {
  try {
    const rows = await getSlowMovingReport(req.query.days);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
