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
    new (path: string, options?: {
        readonly?: boolean;
    }): Database;
}
declare const BetterSqlite3Ctor: DatabaseConstructor;
export default BetterSqlite3Ctor;
//# sourceMappingURL=better-sqlite3.d.ts.map