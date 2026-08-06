const express = require("express");
const { query } = require("../lib/db");
const { authMiddleware } = require("../lib/auth");

const router = express.Router();

router.get("/", authMiddleware, async (_req, res) => {
  try {
    const [listingStats] = await query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'published') AS published,
        SUM(status = 'draft') AS draft,
        SUM(status = 'archived') AS archived,
        SUM(listing_type = 'sale') AS sale,
        SUM(listing_type = 'rent') AS rent,
        SUM(listing_type = 'daily') AS daily,
        SUM(is_premium = 1) AS premium
      FROM listings
    `);

    const [complexStats] = await query(
      "SELECT COUNT(*) AS total, SUM(is_active = 1) AS active FROM complexes"
    );

    let contacts = { total: 0, unread: 0 };
    try {
      const [c] = await query(
        "SELECT COUNT(*) AS total, SUM(is_read = 0) AS unread FROM contacts"
      );
      contacts = {
        total: Number(c.total || 0),
        unread: Number(c.unread || 0),
      };
    } catch {
      /* contacts table may be missing briefly */
    }

    res.json({
      listings: {
        total: Number(listingStats.total || 0),
        published: Number(listingStats.published || 0),
        draft: Number(listingStats.draft || 0),
        archived: Number(listingStats.archived || 0),
        sale: Number(listingStats.sale || 0),
        rent: Number(listingStats.rent || 0),
        daily: Number(listingStats.daily || 0),
        premium: Number(listingStats.premium || 0),
      },
      complexes: {
        total: Number(complexStats.total || 0),
        active: Number(complexStats.active || 0),
      },
      contacts,
    });
  } catch (err) {
    console.error("stats:", err);
    res.status(500).json({ error: "Server xətası", detail: err.message });
  }
});

module.exports = router;
