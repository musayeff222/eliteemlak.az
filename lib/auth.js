const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("./db");

const JWT_SECRET = () => process.env.JWT_SECRET || "elite-emlak-dev-secret-change-me";
const TOKEN_TTL = "7d";

async function findAdminByUsername(username) {
  const rows = await query(
    "SELECT id, username, password_hash, full_name, email, is_active FROM admins WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username },
    JWT_SECRET(),
    { expiresIn: TOKEN_TTL }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET());
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Giriş tələb olunur" });
  }
  try {
    req.admin = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Sessiya bitib və ya etibarsızdır" });
  }
}

async function login(username, password) {
  const admin = await findAdminByUsername(username);
  if (!admin || !admin.is_active) return null;
  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) return null;
  await query("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [admin.id]);
  const token = signToken(admin);
  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name,
      email: admin.email,
    },
  };
}

module.exports = {
  login,
  authMiddleware,
  verifyToken,
  findAdminByUsername,
};
