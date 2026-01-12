import fs from "fs";
import path from "path";

export function getFileSize(filePath: string): string | null {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    const stats = fs.statSync(fullPath);
    const sizeInBytes = stats.size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return `${sizeInMB.toFixed(1)} MB`;
  } catch (error) {
    console.warn("Could not get file size for:", filePath);
    return null;
  }
}