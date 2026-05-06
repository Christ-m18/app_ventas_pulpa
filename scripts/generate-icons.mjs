// Rasterizes the brand SVGs into the PNG variants required by the PWA manifest
// and the Next.js metadata icon conventions. Run with `node scripts/generate-icons.mjs`.

import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const STANDARD_SVG = readFileSync(resolve(ROOT, "assets/brand/logo-standard.svg"));
const MASKABLE_SVG = readFileSync(resolve(ROOT, "assets/brand/logo-maskable.svg"));

const targets = [
  // PWA manifest references (public/)
  { svg: STANDARD_SVG, out: "public/icon-192.png", size: 192 },
  { svg: STANDARD_SVG, out: "public/icon-512.png", size: 512 },
  { svg: MASKABLE_SVG, out: "public/icon-512-maskable.png", size: 512 },
  { svg: STANDARD_SVG, out: "public/apple-touch-icon.png", size: 180 },
  // Next.js metadata icon conventions (src/app/) — auto-linked in <head>
  { svg: STANDARD_SVG, out: "src/app/icon.png", size: 512 },
  { svg: STANDARD_SVG, out: "src/app/apple-icon.png", size: 180 },
];

await Promise.all(
  targets.map(async ({ svg, out, size }) => {
    const outPath = resolve(ROOT, out);
    mkdirSync(dirname(outPath), { recursive: true });
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "cover" })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`wrote ${out} (${size}x${size})`);
  }),
);
