import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

// Preview the real pre-rendered directory routes. SPA-only preview servers can
// serve home HTML at /book and cause misleading hydration errors.
const root = resolve("dist/client");
const port = Number(process.env.PORT || 4176);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
http
  .createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end(
        "Netlify Forms handles submissions only after deployment to Netlify.",
      );
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      let path = resolve(root, "." + pathname);
      if (path !== root && !path.startsWith(root + sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      let status = 200;
      try {
        if ((await stat(path)).isDirectory())
          path = resolve(path, "index.html");
        await stat(path);
      } catch {
        path = resolve(root, "404.html");
        status = 404;
      }
      const body = await readFile(path);
      response.writeHead(status, {
        "Content-Type": types[extname(path)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(400);
      response.end("Invalid request");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("fishn Netlify preview: http://127.0.0.1:" + port),
  );
