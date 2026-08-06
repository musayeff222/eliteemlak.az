const express = require("express");
const { query } = require("../lib/db");
const { authMiddleware } = require("../lib/auth");
const { complexFromRow, complexToDb } = require("../lib/mappers");

const publicRouter = express.Router();
const adminRouter = express.Router();

async function fetchById(id) {
  const rows = await query("SELECT * FROM complexes WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

publicRouter.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM complexes WHERE is_active = 1 ORDER BY sort_order ASC, id DESC"
    );
    res.json(rows.map(complexFromRow));
  } catch (err) {
    console.error("list complexes:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.use(authMiddleware);

adminRouter.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM complexes ORDER BY sort_order ASC, id DESC"
    );
    res.json(rows.map(complexFromRow));
  } catch (err) {
    console.error("admin complexes:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.post("/", async (req, res) => {
  try {
    const data = complexToDb(req.body || {});
    const result = await query(
      `INSERT INTO complexes (name, price_from, location, developer, deadline, image_url, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        data.name,
        data.price_from,
        data.location,
        data.developer,
        data.deadline,
        data.image_url,
        data.description,
      ]
    );
    const row = await fetchById(result.insertId);
    res.status(201).json(complexFromRow(row));
  } catch (err) {
    console.error("create complex:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchById(id);
    if (!existing) return res.status(404).json({ error: "Kompleks tapılmadı" });

    const data = complexToDb(req.body || {});
    await query(
      `UPDATE complexes SET
        name = ?, price_from = ?, location = ?, developer = ?,
        deadline = ?, image_url = ?, description = ?
       WHERE id = ?`,
      [
        data.name,
        data.price_from,
        data.location,
        data.developer,
        data.deadline,
        data.image_url,
        data.description,
        id,
      ]
    );
    const row = await fetchById(id);
    res.json(complexFromRow(row));
  } catch (err) {
    console.error("update complex:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchById(id);
    if (!existing) return res.status(404).json({ error: "Kompleks tapılmadı" });
    await query("DELETE FROM complexes WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete complex:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = { publicRouter, adminRouter };
