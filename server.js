const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const { ping } = require("./lib/db");
const authRoutes = require("./routes/auth");
const listings = require("./routes/listings");
const complexes = require("./routes/complexes");
const settingsRoutes = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 3000;
const root = __dirname;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (_req, res) => {
  try {
    const dbOk = await ping();
    res.json({ ok: true, db: dbOk });
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

app.get("/health", async (_req, res) => {
  try {
    const dbOk = await ping();
    res.json({ ok: true, db: dbOk });
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listings.publicRouter);
app.use("/api/admin/listings", listings.adminRouter);
app.use("/api/complexes", complexes.publicRouter);
app.use("/api/admin/complexes", complexes.adminRouter);
app.use("/api/settings", settingsRoutes);

app.use(express.static(root, { index: false }));

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.get("/admin-login", (_req, res) => {
  res.sendFile(path.join(root, "admin-login", "index.html"));
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(root, "admin", "index.html"));
});

app.get(["/elan", "/elan.html"], (_req, res) => {
  res.sendFile(path.join(root, "elan.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`);
  console.log(`DB=${process.env.DB_HOST || "127.0.0.1"}/${process.env.DB_NAME || "elite_emlak"}`);
});
