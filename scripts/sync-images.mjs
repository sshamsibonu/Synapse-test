import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync, watch } from "node:fs";
import { spawn } from "node:child_process";

/**
 * Next.js only serves static files from public/, but images are authored in
 * the top-level images/ folder. Mirror it so dropping a file into images/ is
 * all that's ever required.
 *
 * With --watch, this also runs the dev server and re-mirrors on every change,
 * so replacing an image is picked up without restarting anything.
 */
const SOURCE = "images";
const TARGET = "public/images";
const WATCH = process.argv.includes("--watch");

async function sync() {
  if (!existsSync(SOURCE)) {
    console.log(`[sync-images] no ${SOURCE}/ directory — nothing to do`);
    return;
  }
  await rm(TARGET, { recursive: true, force: true });
  await mkdir(TARGET, { recursive: true });
  await cp(SOURCE, TARGET, {
    recursive: true,
    filter: (src) => !src.endsWith(".DS_Store"),
  });
  // Optimised variants are keyed by URL, so a replaced file at the same path
  // would otherwise keep serving the previous image from cache.
  await rm(".next/cache/images", { recursive: true, force: true });
}

await sync();
console.log(`[sync-images] ${SOURCE}/ -> ${TARGET}/`);

if (!WATCH) process.exit(0);

let pending = null;
watch(SOURCE, { recursive: true }, (_event, filename) => {
  if (!filename || filename.endsWith(".DS_Store")) return;
  // Editors write in bursts; collapse them into one sync.
  clearTimeout(pending);
  pending = setTimeout(async () => {
    await sync();
    console.log(`[sync-images] updated: ${filename}`);
  }, 150);
});

const dev = spawn("next", ["dev"], { stdio: "inherit", shell: true });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    dev.kill(signal);
    process.exit(0);
  });
}
dev.on("exit", (code) => process.exit(code ?? 0));
