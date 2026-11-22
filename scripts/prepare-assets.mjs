import sharp from "sharp";
import { mkdir, stat, copyFile, writeFile } from "node:fs/promises";
const names = [
  "closeupreelandmug",
  "fishinnet",
  "fishonrock",
  "HollandRiver",
  "icefishinglandscape",
  "icefishinglandscape1",
  "icefishinglandscape2",
  "icefishingtail",
  "icefishtail",
  "icefishtail3",
  "Lake-simcoe-ice",
  "lake-simcoe",
  "lure",
  "monsterfish",
  "monsterfish1",
  "monsterfish2",
  "monsterfish3",
  "monsterheadfish1",
  "Nottawasaga-River",
  "waterlandscape",
  "waterlandscape1",
  "winterpath",
];
await mkdir("public/images", { recursive: true });
await mkdir("public/fonts", { recursive: true });
await copyFile(
  "node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  "public/fonts/manrope-latin.woff2",
);
let count = 0;
const manifest = {};
await Promise.all(
  names.map(async (name) => {
    const metadata = await sharp(`${name}.jpg`).metadata();
    const sources = [];
    for (const width of [480, 960, 1600, 2560]) {
      const actualWidth = Math.min(width, metadata.width);
      if (sources.some((source) => source.width === actualWidth)) continue;
      const target = `public/images/${name}-${width}.webp`;
      try {
        await stat(target);
      } catch {
        await sharp(`${name}.jpg`)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(target);
        count++;
      }
      sources.push({
        width: actualWidth,
        src: `/images/${name}-${width}.webp`,
      });
    }
    manifest[name] = {
      width: metadata.width,
      height: metadata.height,
      sources,
    };
  }),
);
await writeFile(
  "src/data/photography.json",
  JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) +
    "\n",
);
console.log(
  `Prepared ${count} new photo derivatives; local variable font ready.`,
);
