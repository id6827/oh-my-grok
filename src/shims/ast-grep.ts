/**
 * Optional @ast-grep/napi shim — real package optional.
 */
export type SgNode = {
  text: () => string;
  range: () => { start: { line: number; column: number }; end: { line: number; column: number } };
  kind: () => string;
  children: () => SgNode[];
  find: (q: string) => SgNode | null;
  findAll: (q: string) => SgNode[];
};

export type SgRoot = {
  root: () => SgNode;
};

export function parse(_lang: string, _src: string): SgRoot {
  throw new Error("@ast-grep/napi not installed — AST tools unavailable in this OMG build");
}

export default { parse };
