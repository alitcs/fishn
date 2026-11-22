import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildGeography } from "./build-geography.mjs";

// Source data remains outside src/public so raw coordinates do not ship to visitors.
const headers = {
  "User-Agent":
    "fishn-geographic-artwork/2.0 (OpenStreetMap attribution retained)",
};
async function download(url) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok)
    throw new Error(
      `Geography source returned ${response.status}; retry later. Existing geometry was not replaced.`,
    );
  return response.json();
}
const previous = JSON.parse(await readFile("src/data/geography.json", "utf8"));
const features = {};
const urls = [];
for (const [id, relationId] of [
  ["lake-simcoe", 9984807],
  ["nottawasaga-river", 20952468],
]) {
  const url = `https://api.openstreetmap.org/api/0.6/relation/${relationId}/full.json`;
  const data = await download(url);
  urls.push(url);
  const nodes = new Map(
    data.elements
      .filter((element) => element.type === "node")
      .map((node) => [node.id, [node.lon, node.lat]]),
  );
  const ways = new Map(
    data.elements
      .filter((element) => element.type === "way")
      .map((way) => [way.id, way]),
  );
  const relation = data.elements.find(
    (element) => element.type === "relation" && element.id === relationId,
  );
  const lake = id === "lake-simcoe";
  const lines = relation.members
    .filter((member) => member.type === "way")
    .map((member) => ({
      role: lake ? (member.role === "inner" ? "inner" : "outer") : "river",
      sourceId: `way/${member.ref}`,
      points: ways.get(member.ref).nodes.map((node) => nodes.get(node)),
    }))
    .filter((line) => line.points.length > 1 && line.points.every(Boolean));
  if (!lines.length) throw new Error(`No geometry for ${id}`);
  features[id] = {
    geometryType: lake ? "lake-polygon" : "river-centreline",
    reference: previous.features[id].reference,
    bounds: previous.features[id].bounds,
    sourceIds: [`relation/${relationId}`],
    scope: lake
      ? "Lake Simcoe outer shoreline and mapped island contours"
      : "Mapped Nottawasaga River main-channel relation",
    lines,
  };
}
const holland = [];
for (const name of [
  "Holland River",
  "East Holland River",
  "West Holland River",
]) {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: `${name} Ontario Canada`,
      format: "json",
      polygon_geojson: "1",
      limit: "40",
    });
  const data = await download(url);
  urls.push(url);
  for (const feature of data) {
    const label = feature.name || feature.display_name.split(",")[0];
    if (
      !["Holland River", "East Holland River", "West Holland River"].includes(
        label,
      )
    )
      continue;
    const lines =
      feature.geojson?.type === "LineString"
        ? [feature.geojson.coordinates]
        : feature.geojson?.type === "MultiLineString"
          ? feature.geojson.coordinates
          : [];
    lines.forEach((points) =>
      holland.push({
        role: "river",
        name: label,
        sourceId: `${feature.osm_type}/${feature.osm_id}`,
        points,
      }),
    );
  }
  // Respect Nominatim's public search rate. Search runs only for deliberate refreshes.
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
if (!holland.length) throw new Error("No Holland River geometry");
const points = holland.flatMap((line) => line.points);
features["holland-river"] = {
  geometryType: "river-centreline",
  reference: previous.features["holland-river"].reference,
  bounds: [
    Math.min(...points.map((p) => p[0])),
    Math.min(...points.map((p) => p[1])),
    Math.max(...points.map((p) => p[0])),
    Math.max(...points.map((p) => p[1])),
  ],
  sourceIds: [...new Set(holland.map((line) => line.sourceId))],
  scope:
    "Mapped Holland River main channel and named East/West Holland branches; not a complete watershed or access map",
  lines: holland,
};
await mkdir("data", { recursive: true });
await writeFile(
  "data/geography-source.json",
  JSON.stringify({
    retrieved: new Date().toISOString(),
    source: "https://www.openstreetmap.org/copyright",
    licence: "ODbL 1.0",
    retrieval: urls,
    features,
  }) + "\n",
);
await buildGeography();
