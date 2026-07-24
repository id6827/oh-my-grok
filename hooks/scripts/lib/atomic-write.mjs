/**
 * Atomic write helper for hooks (mirrors runtime/src/atomic-write.ts).
 */
import { writeFileSync, renameSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

export function atomicWriteFileSync(path, data) {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `.${randomBytes(8).toString("hex")}.tmp`);
  writeFileSync(tmp, data);
  try {
    renameSync(tmp, path);
  } catch {
    writeFileSync(path, data);
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

export function atomicWriteJson(path, obj) {
  atomicWriteFileSync(path, JSON.stringify(obj, null, 2) + "\n");
}
