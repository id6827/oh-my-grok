/**
 * Optional @ast-grep/napi shim — real package optional.
 */
export type SgNode = {
    text: () => string;
    range: () => {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    kind: () => string;
    children: () => SgNode[];
    find: (q: string) => SgNode | null;
    findAll: (q: string) => SgNode[];
};
export type SgRoot = {
    root: () => SgNode;
};
export declare function parse(_lang: string, _src: string): SgRoot;
declare const _default: {
    parse: typeof parse;
};
export default _default;
//# sourceMappingURL=ast-grep.d.ts.map