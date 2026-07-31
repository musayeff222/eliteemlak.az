const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const root = __dirname;

app.use(express.static(root));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

app.get("/admin-login", (_req, res) => {
  res.sendFile(path.join(root, "admin-login", "index.html"));
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(root, "admin", "index.html"));
});

app.get("/elan", (_req, res) => {
  res.sendFile(path.join(root, "elan.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`);
  console.log(`PORT env=${process.env.PORT || "(empty)"}`);
});
