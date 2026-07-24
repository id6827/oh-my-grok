import { writeFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

/** Write file atomically via temp file + rename (best-effort on Windows). */
export function atomicWriteFileSync(path: string, data: string | Buffer): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `.${randomBytes(8).toString("hex")}.tmp`);
  writeFileSync(tmp, data);
  try {
    renameSync(tmp, path);
  } catch {
    // Windows may block rename over existing file
    writeFileSync(path, data);
    try {
      writeFileSync(tmp, "");
    } catch {
      /* ignore */
    }
  }
}

export function atomicWriteJson(path: string, obj: unknown): void {
  atomicWriteFileSync(path, JSON.stringify(obj, null, 2) + "\n");
}
