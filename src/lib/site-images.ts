import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

// AI-generated jar mockups — never display them on the site.
const AI_MOCKS = new Set(["mango.jpg", "chinola.jpg", "fresa.jpg", "combo-detox.jpg"]);

/** Rutas públicas `/images/...` de las fotos REALES del perfil (sin mocks). */
export function getSiteJpegPaths(): string[] {
  try {
    if (!fs.existsSync(IMAGES_DIR)) return [];
    return fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => f.toLowerCase().endsWith(".jpg") && !AI_MOCKS.has(f))
      .sort()
      .map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

/** Rutas públicas `/images/...` de los videos del perfil. */
export function getSiteMp4Paths(): string[] {
  try {
    if (!fs.existsSync(IMAGES_DIR)) return [];
    return fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => f.toLowerCase().endsWith(".mp4"))
      .sort()
      .map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

export function pickHeroPath(paths: string[]): string | null {
  return paths[0] ?? null;
}
