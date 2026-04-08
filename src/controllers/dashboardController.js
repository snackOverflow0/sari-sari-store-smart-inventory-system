import { getDashboardData } from "../services/dashboardService.js";

export async function getDashboard(req, res) {
  try {
    const data = await getDashboardData();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
