const express = require("express");
const {
  login,
  authMiddleware,
  findAdminByUsername,
  changePassword,
  updateProfile,
} = require("../lib/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "İstifadəçi adı və şifrə tələb olunur" });
    }
    const result = await login(String(username).trim(), String(password));
    if (!result) {
      return res.status(401).json({ error: "İstifadəçi adı və ya şifrə yanlışdır" });
    }
    res.json(result);
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const admin = await findAdminByUsername(req.admin.username);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: "İstifadəçi tapılmadı" });
    }
    res.json({
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name,
      email: admin.email,
    });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, email } = req.body || {};
    const admin = await updateProfile(req.admin.sub, { fullName, email });
    res.json({
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name,
      email: admin.email,
    });
  } catch (err) {
    console.error("profile error:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await changePassword(req.admin.sub, currentPassword, newPassword);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json({ ok: true });
  } catch (err) {
    console.error("change-password error:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = router;
