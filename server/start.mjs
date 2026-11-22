import http from "node:http";
import worker from "../dist/server/index.js";
const port = Number(process.env.PORT || 4173);
http
  .createServer(async (req, res) => {
    try {
      const publicOrigin = process.env.SITE_URL;
      const matchesPublicHost = publicOrigin && new URL(publicOrigin).host === req.headers.host;
      const url = new URL(req.url, matchesPublicHost ? publicOrigin : `http://${req.headers.host}`);
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 16384) {
          res.writeHead(413);
          res.end();
          return;
        }
        chunks.push(chunk);
      }
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(req.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
      });
      const response = await worker.fetch(request, process.env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Temporarily unavailable.");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`fishn Local: http://127.0.0.1:${port}`),
  );
