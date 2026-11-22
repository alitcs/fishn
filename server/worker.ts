import { handleBooking } from "./booking";
import type { BookingEnv } from "./booking";
import assets from "fishn:assets";
export default {
  async fetch(request: Request, env: BookingEnv): Promise<Response> {
    let path: string;
    try {
      path = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }
    if (path === "/api/bookings" || path === "/api/booking/status")
      return handleBooking(request, env);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("Method not allowed", { status: 405 });
    if (path.startsWith("/api/"))
      return Response.json({ message: "Not found." }, { status: 404 });
    const normalized = path.replace(/\/$/, "") || "/";
    const asset =
      assets[path] ??
      assets[normalized === "/" ? "/index.html" : `${normalized}/index.html`];
    const chosen = asset ?? assets["/404.html"];
    if (!chosen) return new Response("Not found", { status: 404 });
    const headers = {
      "Content-Type": chosen.type,
      "Cache-Control": chosen.type.startsWith("text/html")
        ? "no-cache"
        : "public, max-age=86400",
      ETag: chosen.etag,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
    if (asset && request.headers.get("If-None-Match") === chosen.etag)
      return new Response(null, { status: 304, headers });
    const bytes =
      request.method === "HEAD"
        ? null
        : Uint8Array.from(atob(chosen.body), (c) => c.charCodeAt(0));
    return new Response(bytes, { status: asset ? 200 : 404, headers });
  },
};
