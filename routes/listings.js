const express = require("express");
const { query } = require("../lib/db");
const { authMiddleware } = require("../lib/auth");
const { listingFromRow, listingToDb } = require("../lib/mappers");

const publicRouter = express.Router();
const adminRouter = express.Router();

async function fetchListingById(id) {
  const rows = await query("SELECT * FROM listings WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

publicRouter.get("/", async (req, res) => {
  try {
    const conditions = ["status = 'published'"];
    const params = [];

    if (req.query.premium === "1" || req.query.premium === "true") {
      conditions.push("is_premium = 1");
    }
    if (req.query.type) {
      conditions.push("listing_type = ?");
      params.push(req.query.type);
    }
    if (req.query.category) {
      conditions.push("category = ?");
      params.push(req.query.category);
    }
    if (req.query.q) {
      conditions.push("(location LIKE ? OR city LIKE ? OR title LIKE ? OR district LIKE ?)");
      const like = `%${String(req.query.q).trim()}%`;
      params.push(like, like, like, like);
    }

    const rows = await query(
      `SELECT * FROM listings
       WHERE ${conditions.join(" AND ")}
       ORDER BY is_premium DESC, published_at DESC, id DESC`,
      params
    );
    res.json(rows.map(listingFromRow));
  } catch (err) {
    console.error("list listings:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

publicRouter.get("/:id", async (req, res) => {
  try {
    const row = await fetchListingById(Number(req.params.id));
    if (!row || row.status !== "published") {
      return res.status(404).json({ error: "Obyekt tapılmadı" });
    }
    res.json(listingFromRow(row));
  } catch (err) {
    console.error("get listing:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.use(authMiddleware);

adminRouter.get("/", async (_req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM listings ORDER BY updated_at DESC, id DESC"
    );
    res.json(rows.map(listingFromRow));
  } catch (err) {
    console.error("admin listings:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.get("/:id", async (req, res) => {
  try {
    const row = await fetchListingById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Obyekt tapılmadı" });
    res.json(listingFromRow(row));
  } catch (err) {
    console.error("admin get listing:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.post("/", async (req, res) => {
  try {
    const data = listingToDb(req.body || {});
    const result = await query(
      `INSERT INTO listings (
        title, price, price_period, listing_type, status, is_premium,
        category, location, city, district, rooms, area, area_unit,
        floor, image_url, description, phone, tags, published_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.price,
        data.price_period,
        data.listing_type,
        data.status,
        data.is_premium,
        data.category,
        data.location,
        data.city,
        data.district,
        data.rooms,
        data.area,
        data.area_unit,
        data.floor,
        data.image_url,
        data.description,
        data.phone,
        data.tags,
        data.status === "published" ? new Date() : null,
        req.admin.sub,
      ]
    );
    const row = await fetchListingById(result.insertId);
    res.status(201).json(listingFromRow(row));
  } catch (err) {
    console.error("create listing:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchListingById(id);
    if (!existing) return res.status(404).json({ error: "Obyekt tapılmadı" });

    const mappedExisting = listingFromRow(existing);
    const data = listingToDb(req.body || {}, mappedExisting);

    let publishedAt = existing.published_at;
    if (data.status === "published" && !publishedAt) {
      publishedAt = new Date();
    }

    await query(
      `UPDATE listings SET
        title = ?, price = ?, price_period = ?, listing_type = ?, status = ?,
        is_premium = ?, category = ?, location = ?, city = ?, district = ?,
        rooms = ?, area = ?, area_unit = ?, floor = ?, image_url = ?,
        description = ?, phone = ?, tags = ?, published_at = ?
       WHERE id = ?`,
      [
        data.title,
        data.price,
        data.price_period,
        data.listing_type,
        data.status,
        data.is_premium,
        data.category,
        data.location,
        data.city,
        data.district,
        data.rooms,
        data.area,
        data.area_unit,
        data.floor,
        data.image_url,
        data.description,
        data.phone,
        data.tags,
        publishedAt,
        id,
      ]
    );
    const row = await fetchListingById(id);
    res.json(listingFromRow(row));
  } catch (err) {
    console.error("update listing:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.patch("/:id/publish", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchListingById(id);
    if (!existing) return res.status(404).json({ error: "Obyekt tapılmadı" });

    const nextStatus = existing.status === "published" ? "draft" : "published";
    const publishedAt =
      nextStatus === "published"
        ? existing.published_at || new Date()
        : existing.published_at;

    await query("UPDATE listings SET status = ?, published_at = ? WHERE id = ?", [
      nextStatus,
      publishedAt,
      id,
    ]);
    const row = await fetchListingById(id);
    res.json(listingFromRow(row));
  } catch (err) {
    console.error("toggle publish:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

adminRouter.post("/bulk", async (req, res) => {
  try {
    const { ids, action } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "ID siyahısı lazımdır" });
    }
    const cleanIds = ids.map(Number).filter((n) => n > 0);
    if (!cleanIds.length) return res.status(400).json({ error: "Keçərli ID yoxdur" });
    const placeholders = cleanIds.map(() => "?").join(",");

    if (action === "publish") {
      await query(
        `UPDATE listings SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE id IN (${placeholders})`,
        cleanIds
      );
    } else if (action === "draft") {
      await query(
        `UPDATE listings SET status = 'draft' WHERE id IN (${placeholders})`,
        cleanIds
      );
    } else if (action === "delete") {
      await query(`DELETE FROM listings WHERE id IN (${placeholders})`, cleanIds);
    } else if (action === "premium") {
      await query(
        `UPDATE listings SET is_premium = 1 WHERE id IN (${placeholders})`,
        cleanIds
      );
    } else if (action === "unpremium") {
      await query(
        `UPDATE listings SET is_premium = 0 WHERE id IN (${placeholders})`,
        cleanIds
      );
    } else {
      return res.status(400).json({ error: "Naməlum əməliyyat" });
    }
    res.json({ ok: true, count: cleanIds.length });
  } catch (err) {
    console.error("bulk listings:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.post("/:id/duplicate", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchListingById(id);
    if (!existing) return res.status(404).json({ error: "Obyekt tapılmadı" });

    const result = await query(
      `INSERT INTO listings (
        title, price, price_period, listing_type, status, is_premium,
        category, location, city, district, rooms, area, area_unit,
        floor, image_url, description, phone, tags, published_at, created_by
      ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
      [
        existing.title,
        existing.price,
        existing.price_period,
        existing.listing_type,
        existing.is_premium,
        existing.category,
        existing.location,
        existing.city,
        existing.district,
        existing.rooms,
        existing.area,
        existing.area_unit,
        existing.floor,
        existing.image_url,
        existing.description,
        existing.phone,
        typeof existing.tags === "string" ? existing.tags : JSON.stringify(existing.tags || []),
        req.admin.sub,
      ]
    );
    const row = await fetchListingById(result.insertId);
    res.status(201).json(listingFromRow(row));
  } catch (err) {
    console.error("duplicate listing:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

adminRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await fetchListingById(id);
    if (!existing) return res.status(404).json({ error: "Obyekt tapılmadı" });
    await query("DELETE FROM listings WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete listing:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

module.exports = { publicRouter, adminRouter };
