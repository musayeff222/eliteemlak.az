const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);

// Hosting platforms (cPanel, Render, Railway, Heroku) inject PORT
function resolvePort() {
  const raw = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || "8080";
  const parsed = parseInt(String(raw).trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8080;
}

const port = resolvePort();
const host = process.env.HOST || "0.0.0.0";

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
  ".map": "application/json",
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
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
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
    // Health / readiness for hosting panels
    if (req.url === "/health" || req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true, service: "elite-emlak" }));
    }

    const mapped = resolveUrl(req.url || "/");
    const filePath = safeJoin(root, mapped);

    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(
          "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:40px'>" +
            "<h1>404</h1><p>Səhifə tapılmadı.</p><a href='/'>Ana səhifə</a></body></html>"
        );
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": types[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
      });
      res.end(data);
    });
  } catch (error) {
    console.error("Request error:", error && error.message);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.on("error", (err) => {
  console.error("Server error:", err.message);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Set a free PORT in hosting settings.`);
  }
  // Do not leave a zombie restart storm without a clear exit
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err);
});

// Keep process alive on SIGTERM (graceful stop for hosting)
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

server.listen(port, host, () => {
  console.log(
    JSON.stringify({
      message: "ELITE-EMLAK.AZ started",
      host,
      port,
      envPort: process.env.PORT || null,
      pid: process.pid,
    })
  );
});
