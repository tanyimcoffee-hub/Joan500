const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 5500;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const requested = decodeURIComponent(url.pathname) === "/"
    ? "index.html"
    : decodeURIComponent(url.pathname).slice(1);
  const fullPath = path.join(root, requested);

  if (!fullPath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(fullPath)] || "application/octet-stream"
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`TypeTrack 100 running at http://localhost:${port}`);
});
