/**
 * better-sqlite3 typing facade for OMG.
 * Runtime code should dynamic-import the real package when needed.
 */
const BetterSqlite3Ctor = function Database(_path, _options) {
    throw new Error("better-sqlite3 is not available in this OMG build. " +
        "Install optional dependency better-sqlite3 or use the JSON state fallback.");
};
export default BetterSqlite3Ctor;
//# sourceMappingURL=better-sqlite3.js.map