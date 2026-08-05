const express = require("express");
const { login, authMiddleware, findAdminByUsername } = require("../lib/auth");

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

module.exports = router;
