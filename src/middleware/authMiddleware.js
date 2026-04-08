import { validateToken } from "../services/authService.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const session = await validateToken(token);

    if (!session) {
      return res.status(401).json({ message: "Session expired or invalid." });
    }

    req.user = session.user;
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
