/**
 * better-sqlite3 typing facade for OMG.
 * Runtime code should dynamic-import the real package when needed.
 */

export interface Statement {
  run: (...params: unknown[]) => unknown;
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
}

export interface Database {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
  close: () => void;
  pragma: (s: string, ...args: unknown[]) => unknown;
  transaction: <T>(fn: () => T) => () => T;
}

export interface DatabaseConstructor {
  new (path: string, options?: { readonly?: boolean }): Database;
}

const BetterSqlite3Ctor = function Database(
  this: unknown,
  _path: string,
  _options?: { readonly?: boolean }
): Database {
  throw new Error(
    "better-sqlite3 is not available in this OMG build. " +
      "Install optional dependency better-sqlite3 or use the JSON state fallback."
  );
} as unknown as DatabaseConstructor;

export default BetterSqlite3Ctor;
