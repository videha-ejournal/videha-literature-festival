import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
const server = http.createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent((req.url || "/").split("?")[0]);
    let file = path.join(root, requested === "/" ? "index.html" : requested);
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));
