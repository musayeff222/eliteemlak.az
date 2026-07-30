/**
 * ELITE-EMLAK.AZ — Hostinger Node.js entry
 * Hostinger docs: bind process.env.PORT, entry = this file (or app.js)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);

// Hostinger assigns PORT at runtime. Do NOT hardcode production port.
const port = Number(process.env.PORT) || 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const routes = {
  "/": "/index.html",
  "/admin-login": "/admin-login/index.html",
  "/admin": "/admin/index.html",
  "/elan": "/elan.html",
};

function safeJoin(base, requestPath) {
  const cleaned = String(requestPath || "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join(path.sep);

  const resolved = path.resolve(base, cleaned);
  const relative = path.relative(base, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

function resolveUrl(urlPath) {
  let pathname = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (routes[normalized]) return routes[normalized];

  if (!path.extname(normalized)) {
    const asIndex = `${normalized}/index.html`;
    const indexPath = safeJoin(root, asIndex);
    if (indexPath && fs.existsSync(indexPath)) return asIndex;

    const asHtml = `${normalized}.html`;
    const htmlPath = safeJoin(root, asHtml);
    if (htmlPath && fs.existsSync(htmlPath)) return asHtml;
  }
  return normalized;
}

const server = http.createServer((req, res) => {
  try {
    if ((req.url || "").split("?")[0] === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true }));
    }

    const mapped = resolveUrl(req.url || "/");
    const filePath = safeJoin(root, mapped);
    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Not found");
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": types[ext] || "application/octet-stream",
      });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.on("error", (err) => {
  console.error("LISTEN_ERROR", err.code, err.message);
});

// Hostinger official pattern: listen(port) only — no hardcoded host.
// Binding 0.0.0.0 caused restart loops on some Hostinger Node apps.
server.listen(port, () => {
  console.log(`Listening on ${port}`);
  console.log(`PORT env=${process.env.PORT || "(empty)"}`);
});
