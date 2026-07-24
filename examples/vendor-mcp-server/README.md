<!-- Ported from oh-my-claudecode (MIT) — see NOTICE. -->

# Vendor Company-Context MCP Server

This is a tiny runnable reference server for the company-context contract documented in:

- [`docs/company-context-interface.md`](../../docs/company-context-interface.md)

It exposes exactly one tool:

- `get_company_context`

## Run

From the repo root:

```bash
node examples/vendor-mcp-server/server.mjs
```

## Register with Grok Build

```bash
claude mcp add company-context -- node examples/vendor-mcp-server/server.mjs
```

Then configure OMG:

```jsonc
{
  "companyContext": {
    "tool": "mcp__company-context__get_company_context",
    "onError": "warn"
  }
}
```

Use one of:

- `.grok/omg.jsonc`
- `~/.config/grok-omg/config.jsonc`

## Contract Notes

- Input: `{ query: string }`
- Output: `{ context: string }`
- Returned markdown is informational only.
- This example is intentionally tiny and static. Real vendors can load policy from files, databases, or internal services as long as they preserve the same tool contract.
