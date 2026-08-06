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
const { migrate } = require("./lib/migrate");
const { ensureUploadDir, resolveUploadDir, getUploadUrlPrefix } = require("./lib/uploads");
const authRoutes = require("./routes/auth");
const listings = require("./routes/listings");
const complexes = require("./routes/complexes");
const settingsRoutes = require("./routes/settings");
const contacts = require("./routes/contacts");
const statsRoutes = require("./routes/stats");
const uploadRoutes = require("./routes/uploads");

const app = express();
const PORT = process.env.PORT || 3000;
const root = __dirname;

let uploadDir;
try {
  uploadDir = ensureUploadDir();
} catch (err) {
  console.error("UPLOAD_DIR create failed:", err.message);
  uploadDir = resolveUploadDir();
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadPrefix = getUploadUrlPrefix();
app.use(uploadPrefix, express.static(uploadDir, {
  maxAge: "30d",
  fallthrough: true,
}));

app.get("/api/health", async (_req, res) => {
  const dbInfo = getSafeDbInfo();
  try {
    const dbOk = await ping();
    let tables = null;
    try {
      const rows = await require("./lib/db").query(
        "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('listings','complexes','admins')"
      );
      tables = Number(rows[0].c);
    } catch {
      tables = null;
    }
    res.json({ ok: true, db: dbOk, tables, envFromFile: envCount, ...dbInfo });
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

app.post("/api/setup/migrate", async (_req, res) => {
  try {
    await migrate();
    res.json({ ok: true, message: "Cədvəllər yaradıldı / seed olundu" });
  } catch (err) {
    console.error("migrate error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listings.publicRouter);
app.use("/api/admin/listings", listings.adminRouter);
app.use("/api/complexes", complexes.publicRouter);
app.use("/api/admin/complexes", complexes.adminRouter);
app.use("/api/settings", settingsRoutes);
app.use("/api/contacts", contacts.publicRouter);
app.use("/api/admin/contacts", contacts.adminRouter);
app.use("/api/admin/stats", statsRoutes);
app.use("/api/admin/upload", uploadRoutes);

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

async function start() {
  try {
    await migrate();
    console.log("DB migrate/seed OK");
  } catch (err) {
    console.error("DB migrate failed:", err.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    const info = getSafeDbInfo();
    console.log(`Listening on ${PORT}`);
    console.log(
      `DB=${info.user}@${info.host}:${info.port}/${info.database} passwordSet=${info.passwordSet} envFromFile=${envCount}`
    );
    console.log(`UPLOAD_DIR=${uploadDir} url=${uploadPrefix}`);
  });
}

start();
