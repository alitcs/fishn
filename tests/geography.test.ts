import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { joinLines, simplify } from "../scripts/build-geography.mjs";

test("cartography preserves lake rings, real river centre lines, and documented branch sources", async () => {
  const data = JSON.parse(await readFile("src/data/geography.json", "utf8"));
  const source = JSON.parse(
    await readFile("data/geography-source.json", "utf8"),
  );
  assert.ok(
    data.features["lake-simcoe"].paths.every((path: string) =>
      path.endsWith("Z"),
    ),
  );
  assert.ok(data.features["lake-simcoe"].detailPaths.length >= 20);
  for (const id of ["holland-river", "nottawasaga-river"]) {
    assert.equal(data.features[id].geometryType, "river-centreline");
    assert.ok(
      data.features[id].paths.every((path: string) => !path.includes("Z")),
    );
    assert.ok(data.features[id].sourcePointCount > 1000);
  }
  const names = source.features["holland-river"].lines.map(
    (line: { name: string }) => line.name,
  );
  assert.ok(names.includes("East Holland River"));
  assert.ok(names.includes("West Holland River"));
  assert.equal(source.licence, "ODbL 1.0");
});
test("geographic assembly joins only matching endpoints and does not bridge source gaps", () => {
  const lines = joinLines([
    [
      [0, 0],
      [1, 1],
    ],
    [
      [2, 2],
      [1, 1],
    ],
    [
      [10, 10],
      [11, 11],
    ],
  ]);
  assert.deepEqual(lines, [
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [10, 10],
      [11, 11],
    ],
  ]);
});
test("geometry simplification preserves significant bends and source endpoints", () => {
  const line = [
    [0, 0],
    [1, 0.01],
    [2, 0],
    [2, 2],
    [4, 2],
  ];
  assert.deepEqual(simplify(line, 0.12), [
    [0, 0],
    [2, 0],
    [2, 2],
    [4, 2],
  ]);
});
