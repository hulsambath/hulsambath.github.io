import fs from "node:fs/promises";
import path from "node:path";

const SRC_ASSETS_DIR = path.resolve("src/assets");
const DEST_PUBLIC_TRIP_DIR = path.resolve("public/trip-images");
const FOLDERS = ["kampot", "bokor", "kep"];

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function toPosix(p) {
  return p.split(path.sep).join("/");
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTS.has(ext)) files.push(fullPath);
  }

  return files;
}

async function main() {
  const manifest = {};

  await fs.mkdir(DEST_PUBLIC_TRIP_DIR, { recursive: true });

  for (const folder of FOLDERS) {
    const srcFolder = path.join(SRC_ASSETS_DIR, folder);
    if (!(await pathExists(srcFolder))) {
      manifest[folder] = [];
      continue;
    }

    const files = await walkFiles(srcFolder);
    const relUrls = [];

    for (const filePath of files) {
      const relFromSrcAssets = path.relative(SRC_ASSETS_DIR, filePath);
      const destFilePath = path.join(DEST_PUBLIC_TRIP_DIR, relFromSrcAssets);

      await fs.mkdir(path.dirname(destFilePath), { recursive: true });
      try {
        await fs.copyFile(filePath, destFilePath);
      } catch (err) {
        // In CI, some images might be missing from the checkout.
        // Skip them instead of failing the entire build.
        if (err && err.code === "ENOENT") continue;
        throw err;
      }

      // URL path relative to site root, used by kp_trip.html fetch.
      const urlRelPath = toPosix(path.join("trip-images", relFromSrcAssets));
      relUrls.push(urlRelPath);
    }

    relUrls.sort((a, b) => a.localeCompare(b));
    manifest[folder] = relUrls;
  }

  const manifestPath = path.join(DEST_PUBLIC_TRIP_DIR, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

   
  console.log(`Trip images prepared. manifest written to ${manifestPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("setup_kp_trip_images failed:", err);
});
