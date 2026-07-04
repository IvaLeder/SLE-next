import fs from "node:fs";
import path from "node:path";

/** Recursively list all files under dir (absolute paths). Missing dir → []. */
export function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue; // .orig backups, .DS_Store, …
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Write via temp-file + rename so a crash mid-write never leaves a truncated
 * manifest/cache for the next run (or the Next.js build) to choke on.
 */
export function atomicWrite(file: string, data: string | Buffer): void {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

/**
 * Hard-link src → dest, falling back to a copy (cross-device, or filesystems
 * without link support). Outputs are immutable (hash-named, replaced only by
 * atomic rename), so sharing the inode between the cache and the output dir
 * is safe — and skips writing ~200 MB twice on a cold run.
 */
export function linkOrCopy(src: string, dest: string): void {
  ensureDir(path.dirname(dest));
  try {
    fs.linkSync(src, dest);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EEXIST") return;
    fs.copyFileSync(src, dest);
  }
}

export function readJsonIfExists<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}
