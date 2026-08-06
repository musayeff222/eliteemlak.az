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

async function findAdminById(id) {
  const rows = await query(
    "SELECT id, username, password_hash, full_name, email, is_active FROM admins WHERE id = ? LIMIT 1",
    [id]
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

async function changePassword(adminId, currentPassword, newPassword) {
  const admin = await findAdminById(adminId);
  if (!admin) return { ok: false, error: "İstifadəçi tapılmadı" };
  const ok = await verifyPassword(currentPassword, admin.password_hash);
  if (!ok) return { ok: false, error: "Cari şifrə yanlışdır" };
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, error: "Yeni şifrə ən azı 6 simvol olmalıdır" };
  }
  const hash = await bcrypt.hash(String(newPassword), 10);
  await query("UPDATE admins SET password_hash = ? WHERE id = ?", [hash, adminId]);
  return { ok: true };
}

async function updateProfile(adminId, { fullName, email }) {
  await query("UPDATE admins SET full_name = ?, email = ? WHERE id = ?", [
    fullName || null,
    email || null,
    adminId,
  ]);
  return findAdminById(adminId);
}

module.exports = {
  login,
  authMiddleware,
  verifyToken,
  findAdminByUsername,
  findAdminById,
  changePassword,
  updateProfile,
};
