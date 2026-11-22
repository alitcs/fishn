import {
  readdir,
  readFile,
  mkdir,
  writeFile,
  copyFile,
} from "node:fs/promises";
import { extname } from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
const assets = {};
async function collect(dir, prefix = "") {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${item.name}`,
      url = `${prefix}/${item.name}`;
    if (item.isDirectory()) await collect(path, url);
    else {
      const body = await readFile(path);
      assets[url] = {
        body: body.toString("base64"),
        type: mime[extname(path)] || "application/octet-stream",
        etag: `"${createHash("sha256").update(body).digest("hex").slice(0, 24)}"`,
      };
    }
  }
}
await collect("dist/client");
await build({
  entryPoints: ["server/worker.ts"],
  outfile: "dist/server/index.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  plugins: [
    {
      name: "embedded-assets",
      setup(builder) {
        builder.onResolve({ filter: /^fishn:assets$/ }, () => ({
          path: "assets",
          namespace: "fishn",
        }));
        builder.onLoad({ filter: /.*/, namespace: "fishn" }, () => ({
          contents: `export default ${JSON.stringify(assets)};`,
          loader: "js",
        }));
      },
    },
  ],
});
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
// All assets are embedded in the worker, so the server needs no filesystem or asset binding.
const compressed = gzipSync(await readFile("dist/server/index.js")).length;
await writeFile(
  ".work/worker-size.json",
  JSON.stringify({ assets: Object.keys(assets).length, gzipBytes: compressed }),
);
console.log(
  `Self-contained Worker: ${Object.keys(assets).length} assets; ${(compressed / 1024 / 1024).toFixed(2)} MiB gzip.`,
);
