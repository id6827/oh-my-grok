/** Write file atomically via temp file + rename (best-effort on Windows). */
export declare function atomicWriteFileSync(path: string, data: string | Buffer): void;
export declare function atomicWriteJson(path: string, obj: unknown): void;
