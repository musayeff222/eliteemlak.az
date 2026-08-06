const express = require("express");
const { query } = require("../lib/db");
const { authMiddleware } = require("../lib/auth");

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.post("/", async (req, res) => {
  try {
    const { fullName, phone, email, message, listingId } = req.body || {};
    if (!phone || String(phone).trim().length < 5) {
      return res.status(400).json({ error: "Telefon tələb olunur" });
    }
    const result = await query(
      `INSERT INTO contacts (full_name, phone, email, message, listing_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fullName ? String(fullName).trim() : null,
        String(phone).trim(),
        email ? String(email).trim() : null,
        message ? String(message).trim() : null,
        listingId ? Number(listingId) : null,
      ]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("create contact:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.use(authMiddleware);

adminRouter.patch("/read-all", async (_req, res) => {
  try {
    await query("UPDATE contacts SET is_read = 1 WHERE is_read = 0");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.get("/", async (req, res) => {
  try {
    const unreadOnly = req.query.unread === "1";
    const sql = unreadOnly
      ? "SELECT * FROM contacts WHERE is_read = 0 ORDER BY created_at DESC"
      : "SELECT * FROM contacts ORDER BY created_at DESC LIMIT 200";
    const rows = await query(sql);
    res.json(
      rows.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        phone: r.phone,
        email: r.email,
        message: r.message,
        listingId: r.listing_id,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    console.error("list contacts:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.get("/stats", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT COUNT(*) AS total, SUM(is_read = 0) AS unread FROM contacts"
    );
    res.json({
      total: Number(rows[0].total || 0),
      unread: Number(rows[0].unread || 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.patch("/:id/read", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query("UPDATE contacts SET is_read = 1 WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM contacts WHERE id = ?", [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

module.exports = { publicRouter, adminRouter };
