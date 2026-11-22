import { mkdir, writeFile } from "node:fs/promises";

const query = `[out:json][timeout:40];(rel(9984807);rel(20952468);way(44.05,-79.65,44.25,-79.4)["waterway"="river"]["name"="Holland River"];);out geom;`;
const response = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  body: new URLSearchParams({ data: query }),
  headers: { "User-Agent": "fishn-website-geography/1.0" },
});
if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
const source = await response.json();
await mkdir(".work", { recursive: true });
await writeFile(".work/osm.json", JSON.stringify(source));
console.log(`Retrieved ${source.elements.length} OSM features`);
const names = {
  "Lake Simcoe": "lake-simcoe",
  "Holland River": "holland-river",
  "Nottawasaga River": "nottawasaga-river",
};
const output = {};
for (const [name, id] of Object.entries(names)) {
  const elements = source.elements.filter((e) => e.tags?.name === name);
  const lines = elements
    .flatMap((e) =>
      e.members
        ? e.members
            .filter(
              (m) =>
                m.type === "way" &&
                (name !== "Lake Simcoe" || m.role === "outer"),
            )
            .map((m) => m.geometry)
        : [e.geometry],
    )
    .filter(Boolean);
  if (!lines.length) throw new Error(`No geometry for ${name}`);
  const points = lines.flat();
  const bounds = [
    Math.min(...points.map((p) => p.lon)),
    Math.min(...points.map((p) => p.lat)),
    Math.max(...points.map((p) => p.lon)),
    Math.max(...points.map((p) => p.lat)),
  ];
  const midLat = (bounds[1] + bounds[3]) / 2;
  const cos = Math.cos((midLat * Math.PI) / 180);
  const width = (bounds[2] - bounds[0]) * cos,
    height = bounds[3] - bounds[1];
  const scale = Math.min(460 / width, 420 / height);
  const project = (p) => [
    250 + (p.lon - (bounds[0] + bounds[2]) / 2) * cos * scale,
    250 - (p.lat - midLat) * scale,
  ];
  const paths = lines.map((line) =>
    line
      .filter((_, i) => i % 3 === 0 || i === line.length - 1)
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${project(p)
            .map((v) => v.toFixed(1))
            .join(",")}`,
      )
      .join(""),
  );
  // Reference coordinate is an actual source vertex, not an invented access point.
  const reference = points[Math.floor(points.length / 2)];
  output[id] = {
    paths,
    coordinate: `${reference.lat.toFixed(4)}° N, ${Math.abs(reference.lon).toFixed(4)}° W`,
    reference,
    bounds,
    sourceIds: elements.map((e) => `${e.type}/${e.id}`),
  };
  console.log(name, points.length, output[id].coordinate);
}
await mkdir("src/data", { recursive: true });
await writeFile(
  "src/data/geography.json",
  JSON.stringify({
    attribution: "© OpenStreetMap contributors",
    licence: "ODbL 1.0",
    source: "https://www.openstreetmap.org/copyright",
    retrieved: new Date().toISOString(),
    features: output,
  }),
);
