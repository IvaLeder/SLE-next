import crypto from "node:crypto";
import fs from "node:fs";

export function sha256(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function hashFile(absPath: string): string {
  return sha256(fs.readFileSync(absPath));
}

/**
 * Stable hash of a JSON-serialisable value (keys sorted recursively), used to
 * key the cache on the parts of the config that affect encoded output.
 */
export function stableHash(value: unknown): string {
  return sha256(stableStringify(value));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}
