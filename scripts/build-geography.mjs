import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const same = (a, b) => a[0] === b[0] && a[1] === b[1];
export function joinLines(lines) {
  const remaining = lines.map((line) => line.map((point) => [...point]));
  const output = [];
  while (remaining.length) {
    const chain = remaining.shift();
    let extended = true;
    while (extended && !same(chain[0], chain.at(-1))) {
      extended = false;
      for (let i = 0; i < remaining.length; i++) {
        const line = remaining[i];
        if (same(chain.at(-1), line[0])) chain.push(...line.slice(1));
        else if (same(chain.at(-1), line.at(-1)))
          chain.push(...line.slice(0, -1).reverse());
        else if (same(chain[0], line.at(-1)))
          chain.unshift(...line.slice(0, -1));
        else if (same(chain[0], line[0]))
          chain.unshift(...line.slice(1).reverse());
        else continue;
        remaining.splice(i, 1);
        extended = true;
        break;
      }
    }
    output.push(chain);
  }
  return output;
}
export function simplify(points, tolerance = 0.12) {
  if (points.length <= 2) return points;
  const a = points[0],
    b = points.at(-1),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = dx * dx + dy * dy;
  let farthest = 0,
    maximum = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const t = length
      ? Math.max(
          0,
          Math.min(
            1,
            ((points[i][0] - a[0]) * dx + (points[i][1] - a[1]) * dy) / length,
          ),
        )
      : 0;
    const distance =
      (points[i][0] - a[0] - t * dx) ** 2 + (points[i][1] - a[1] - t * dy) ** 2;
    if (distance > maximum) {
      maximum = distance;
      farthest = i;
    }
  }
  return maximum > tolerance * tolerance
    ? [
        ...simplify(points.slice(0, farthest + 1), tolerance).slice(0, -1),
        ...simplify(points.slice(farthest), tolerance),
      ]
    : [a, b];
}
const mercator = ([longitude, latitude]) => [
  (6378137 * longitude * Math.PI) / 180,
  6378137 * Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)),
];
export async function buildGeography() {
  const source = JSON.parse(
    await readFile("data/geography-source.json", "utf8"),
  );
  const output = {};
  for (const [id, feature] of Object.entries(source.features)) {
    const points = feature.lines.flatMap((line) => line.points);
    const projected = points.map(mercator);
    const bounds = [
      Math.min(...projected.map((p) => p[0])),
      Math.min(...projected.map((p) => p[1])),
      Math.max(...projected.map((p) => p[0])),
      Math.max(...projected.map((p) => p[1])),
    ];
    const scale = Math.min(
      440 / (bounds[2] - bounds[0]),
      440 / (bounds[3] - bounds[1]),
    );
    const project = (point) => {
      const p = mercator(point);
      return [
        250 + (p[0] - (bounds[0] + bounds[2]) / 2) * scale,
        250 - (p[1] - (bounds[1] + bounds[3]) / 2) * scale,
      ];
    };
    const paths = [],
      detailPaths = [];
    let retainedPoints = 0;
    for (const role of ["outer", "inner", "river"]) {
      const lines = joinLines(
        feature.lines
          .filter((line) => line.role === role)
          .map((line) => line.points),
      );
      for (const line of lines) {
        const simplified = simplify(line.map(project), 0.12);
        retainedPoints += simplified.length;
        // Close only source rings whose actual endpoints meet. Never bridge gaps.
        const closed = role !== "river" && same(line[0], line.at(-1));
        const path =
          simplified
            .map(
              (p, i) =>
                `${i ? "L" : "M"}${p.map((value) => value.toFixed(2)).join(",")}`,
            )
            .join("") + (closed ? "Z" : "");
        (role === "inner" ? detailPaths : paths).push(path);
      }
    }
    const reference = feature.reference;
    output[id] = {
      paths,
      detailPaths,
      coordinate: `${reference.lat.toFixed(4)}° N, ${Math.abs(reference.lon).toFixed(4)}° W`,
      reference,
      bounds: feature.bounds,
      geometryType: feature.geometryType,
      sourceIds: feature.sourceIds,
      sourcePointCount: points.length,
      retainedPointCount: retainedPoints,
      simplificationTolerance: 0.12,
      projection:
        "EPSG:3857; north up; fitted independently to a 500 × 500 viewBox",
      scope: feature.scope,
    };
    console.log(
      `${id}: ${points.length} source vertices → ${retainedPoints} display vertices, ${paths.length} principal paths, ${detailPaths.length} island contours`,
    );
  }
  await writeFile(
    "src/data/geography.json",
    JSON.stringify(
      {
        attribution: "© OpenStreetMap contributors",
        licence: "ODbL 1.0",
        source: "https://www.openstreetmap.org/copyright",
        retrieved: source.retrieved,
        features: output,
      },
      null,
      2,
    ) + "\n",
  );
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  await buildGeography();
