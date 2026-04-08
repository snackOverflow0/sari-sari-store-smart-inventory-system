import crypto from "crypto";
import { findActiveOwner, updateLastLogin } from "../models/userModel.js";

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function hashPin(pin, salt) {
  return crypto.createHash("sha256").update(`${pin}${salt}`).digest("hex");
}

export async function loginWithPin(pin) {
  const user = await findActiveOwner();

  if (!user) {
    throw new Error("No active owner account found.");
  }

  if (hashPin(pin, user.pin_salt) !== user.pin_hash) {
    return null;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const safeUser = { id: user.id, fullName: user.full_name, role: user.role };
  sessions.set(token, { user: safeUser, expiresAt });
  await updateLastLogin(user.id);

  return { token, expiresAt, user: safeUser };
}

export async function validateToken(token) {
  const session = sessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}
