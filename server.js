const fs = require("fs");
const path = require("path");

function loadEnv() {
  const candidates = [
    path.join(__dirname, ".env"),
    path.join(process.cwd(), ".env"),
    path.join(__dirname, "..", ".env"),
  ];
  let loaded = 0;
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const result = require("dotenv").config({ path: file, quiet: true });
    if (!result.error) {
      loaded += Object.keys(result.parsed || {}).length;
      if (Object.keys(result.parsed || {}).length > 0) break;
    }
  }
  return loaded;
}

const envCount = loadEnv();

const express = require("express");
const { ping, getSafeDbInfo } = require("./lib/db");
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
  const dbInfo = getSafeDbInfo();
  try {
    const dbOk = await ping();
    res.json({ ok: true, db: dbOk, envFromFile: envCount, ...dbInfo });
  } catch (err) {
    res.status(503).json({
      ok: false,
      db: false,
      error: err.message,
      envFromFile: envCount,
      ...dbInfo,
    });
  }
});

app.get("/health", async (_req, res) => {
  const dbInfo = getSafeDbInfo();
  try {
    const dbOk = await ping();
    res.json({ ok: true, db: dbOk, envFromFile: envCount, ...dbInfo });
  } catch (err) {
    res.status(503).json({
      ok: false,
      db: false,
      error: err.message,
      envFromFile: envCount,
      ...dbInfo,
    });
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
  const info = getSafeDbInfo();
  console.log(`Listening on ${PORT}`);
  console.log(
    `DB=${info.user}@${info.host}:${info.port}/${info.database} passwordSet=${info.passwordSet} envFromFile=${envCount}`
  );
});
