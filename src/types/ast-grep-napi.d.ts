declare module "@ast-grep/napi" {
  export enum Lang {
    JavaScript = "JavaScript",
    TypeScript = "TypeScript",
    Tsx = "Tsx",
    Jsx = "Jsx",
    Python = "Python",
    Go = "Go",
    Rust = "Rust",
    Java = "Java",
    C = "C",
    Cpp = "Cpp",
    CSharp = "CSharp",
    Ruby = "Ruby",
    PHP = "PHP",
    Swift = "Swift",
    Kotlin = "Kotlin",
    Html = "Html",
    Css = "Css",
    Json = "Json",
    Yaml = "Yaml",
    Bash = "Bash",
    Lua = "Lua",
    Elixir = "Elixir",
    Haskell = "Haskell",
    Thrift = "Thrift",
  }

  export type Pos = {
    line: number;
    column: number;
    index: number;
  };

  export type SgNode = {
    text: () => string;
    range: () => { start: Pos; end: Pos };
    kind: () => string;
    children: () => SgNode[];
    find: (q: string) => SgNode | null;
    findAll: (q: string) => SgNode[];
    getMatch: (name: string) => SgNode | null;
  };

  export type SgRoot = {
    root: () => SgNode;
  };

  export function parse(lang: Lang | string, src: string): SgRoot;

  const _default: {
    parse: typeof parse;
    Lang: typeof Lang;
  };
  export default _default;
}
