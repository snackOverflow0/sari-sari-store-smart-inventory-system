import { loginWithPin } from "../services/authService.js";

export async function login(req, res) {
  try {
    const pin = String(req.body.pin || "").trim();
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be 4 to 6 digits." });
    }

    const session = await loginWithPin(pin);
    if (!session) return res.status(401).json({ message: "Incorrect PIN." });

    return res.json({ message: "Login successful.", ...session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
