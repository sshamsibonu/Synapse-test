import fs from "node:fs";
import path from "node:path";

/**
 * Resolves an optional image living under public/.
 *
 * Checking the file system at render time lets a section carry a designed
 * fallback until real photography exists — dropping a correctly-named file
 * into images/ makes it appear with no code change.
 *
 * @param relPath path relative to public/, e.g. "images/homepage_img/x.jpg"
 */
export function resolvePublicImage(relPath: string): string | null {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relPath))
      ? `/${relPath}`
      : null;
  } catch {
    return null;
  }
}
