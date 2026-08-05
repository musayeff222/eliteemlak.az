const express = require("express");
const { query } = require("../lib/db");
const { authMiddleware } = require("../lib/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await query("SELECT setting_key, setting_value FROM settings");
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error("get settings:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const body = req.body || {};
    const entries = Object.entries(body);
    for (const [key, value] of entries) {
      await query(
        `INSERT INTO settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value == null ? null : String(value)]
      );
    }
    const rows = await query("SELECT setting_key, setting_value FROM settings");
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error("update settings:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = router;
