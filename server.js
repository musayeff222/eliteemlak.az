const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8080;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const routes = {
  "/admin-login": "/admin-login/index.html",
  "/admin": "/admin/index.html",
};

function resolvePath(urlPath) {
  if (urlPath === "/") return "/index.html";

  const normalized = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
  if (routes[normalized]) return routes[normalized];

  if (!path.extname(normalized)) {
    const asIndex = `${normalized}/index.html`;
    if (fs.existsSync(path.join(root, asIndex))) return asIndex;
  }

  return normalized;
}

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    urlPath = resolvePath(urlPath);
    const filePath = path.normalize(path.join(root, urlPath));

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain" });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`ELITE-EMLAK.AZ: http://localhost:${port}`);
    console.log(`Admin login: http://localhost:${port}/admin-login`);
  });
