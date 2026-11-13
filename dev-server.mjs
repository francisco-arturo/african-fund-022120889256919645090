import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

export function createApp() {
  return http.createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method not allowed");
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    } catch {
      send(res, 400, "Bad request");
      return;
    }

    if (pathname === "/") pathname = "/index.html";
    const filePath = path.resolve(ROOT, "." + pathname);

    if (!filePath.startsWith(ROOT + path.sep)) {
      send(res, 403, "Forbidden");
      return;
    }

    try {
      const body = await readFile(filePath);
      const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Content-Length": body.length,
        "Cache-Control": "no-store"
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(body);
      }
    } catch {
      send(res, 404, "Not found");
    }
  });
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  const port = Number(process.env.PORT) || 4173;
  createApp().listen(port, "127.0.0.1", () => {
    console.log(`Umoja prototype running at http://127.0.0.1:${port}`);
  });
}
