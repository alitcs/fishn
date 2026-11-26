import { mkdir, readFile, writeFile } from "node:fs/promises";
import { render } from "../.work/ssr/entry-server.js";
const routes = {
  "/": [
    "Private guided fishing in Ontario",
    "Plan a private guided shoreline or ice fishing session in Ontario with Nikita. Beginners welcome. Choose your session, date, and group in four easy steps.",
  ],
  "/experiences": [
    "Find your kind of outside.",
    "Explore private shoreline fishing and ice fishing experiences with Nikita in Ontario. Beginners welcome. Request a day outdoors.",
  ],
  "/experiences/shoreline-fishing": [
    "Shoreline Fishing in Ontario",
    "Private guided shoreline fishing at Lake Simcoe, Holland River, and Nottawasaga River with Nikita. Learn to cast, slow down, and explore.",
  ],
  "/experiences/ice-fishing": [
    "Guided Ice Fishing on Lake Simcoe",
    "Request a private guided ice fishing experience on Lake Simcoe. Beginners welcome. Trips depend on seasons, ice conditions, permissions, and guide approval.",
  ],
  "/explore": [
    "An atlas of good days.",
    "Explore Lake Simcoe, Holland River, and Nottawasaga River in the fishn field atlas. Discover your next change of scenery in Ontario.",
  ],
  "/explore/lake-simcoe": [
    "Lake Simcoe · The field atlas",
    "Discover Lake Simcoe with fishn. Explore the shoreline or request an ice fishing experience, subject to conditions and guide approval.",
  ],
  "/explore/holland-river": [
    "Holland River · The field atlas",
    "Discover the Holland River in the Lake Simcoe watershed. Request a private guided shoreline fishing day with Nikita.",
  ],
  "/explore/nottawasaga-river": [
    "Nottawasaga River · The field atlas",
    "Explore the Nottawasaga River and its connection to Georgian Bay. Request a private guided shoreline fishing experience with Nikita.",
  ],
  "/about": [
    "Meet your guide",
    "Meet Nikita, the local outdoorsman behind fishn. Private fishing experiences rooted in a love of Ontario’s lakes, rivers, and natural surroundings.",
  ],
  "/book": [
    "Plan your fishing session",
    "Request your private guided fishing day in Ontario. Choose an experience, general location, group, duration, and preferred date. Nikita confirms the details.",
  ],
  "/privacy": [
    "Privacy & your information",
    "How fishn handles your booking enquiry, browser preferences, and optional analytics.",
  ],
};
const template = await readFile("dist/client/index.html", "utf8");
const photography = JSON.parse(
  await readFile("src/data/photography.json", "utf8"),
);
const origin = (
  process.env.SITE_URL ||
  process.env.URL ||
  "https://fishn-ontario-outside.stellarcouch.chatgpt.site"
).replace(/\/$/, "");
for (const [route, [title, description]] of Object.entries(routes)) {
  const image = route.includes("ice-fishing")
    ? "Lake-simcoe-ice"
    : route.includes("holland-river") || route === "/experiences"
      ? "HollandRiver"
      : route.includes("nottawasaga-river")
        ? "Nottawasaga-River"
        : route === "/about"
          ? "winterpath"
          : route.includes("shoreline-fishing")
            ? "waterlandscape1"
            : "lake-simcoe";
  const head = template
    .replace(
      /<link\s+data-hero-preload\b[^>]*\/?>/,
      route === "/privacy"
        ? ""
        : `<link rel="preload" as="image" href="/images/${image}-960.webp" imagesrcset="${photography[image].sources.map((source) => `${source.src} ${source.width}w`).join(", ")}" imagesizes="(max-aspect-ratio: ${photography[image].width}/${photography[image].height}) ${Math.round((photography[image].width / photography[image].height) * 100)}vh, 100vw" fetchpriority="high" />`,
    )
    .replace(/<title>.*?<\/title>/, `<title>fishn — ${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="fishn — ${title}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${origin}/images/${image}-1600.webp" />`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${origin}${route === "/" ? "" : route}" /><meta property="og:url" content="${origin}${route === "/" ? "" : route}" /></head>`,
    );
  const dir = route === "/" ? "dist/client" : `dist/client${route}`;
  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/index.html`,
    head.replace("<!--app-html-->", render(route)),
  );
}
await writeFile(
  "dist/client/404.html",
  template
    .replace(/<link\s+data-hero-preload\b[^>]*\/?>/, "")
    .replace("<!--app-html-->", render("/not-found"))
    .replace("</head>", '<meta name="robots" content="noindex" /></head>'),
);
await writeFile(
  "dist/client/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  "dist/client/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
    routes,
  )
    .map(
      (route) => `<url><loc>${origin}${route === "/" ? "" : route}</loc></url>`,
    )
    .join("")}</urlset>`,
);
console.log(
  `Pre-rendered ${Object.keys(routes).length} routes with page-specific metadata.`,
);
