import http from "node:http";
import { createServer } from "vite";
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
const port = Number(process.env.PORT || 5173);
const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    try {
      const { handleBooking } = await vite.ssrLoadModule("/server/booking.ts");
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
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers,
        ...(req.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
      });
      const result = await handleBooking(request, process.env);
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(await result.text());
    } catch (error) {
      console.error("Booking endpoint failed:", error.message);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          message: "The request service is temporarily unavailable.",
        }),
      );
    }
    return;
  }
  vite.middlewares(req, res, () => {
    res.writeHead(404);
    res.end();
  });
});
server.listen(port, "127.0.0.1", () =>
  console.log(`fishn Local: http://127.0.0.1:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close();
    vite.close();
  });
