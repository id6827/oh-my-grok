<!-- Ported from oh-my-claudecode docs (MIT) — see NOTICE. Adapted for oh-my-grok / Grok Build. -->

# Delegation Enforcer

**Automatic model parameter injection for Task/Agent calls**

## Problem

Grok Build does NOT automatically apply model parameters from agent definitions. When you invoke the `Task` tool (or `Agent` tool), you must manually specify the `model` parameter every time, even though each agent has a default model defined in its configuration.

This leads to:
- Verbose delegation code
- Forgotten model parameters defaulting to parent model
- Inconsistent model usage across codebase

## Solution

The **Delegation Enforcer** is middleware that automatically injects the model parameter based on agent definitions when not explicitly specified.

## How It Works

### 1. Pre-Tool-Use Hook

The enforcer runs as a pre-tool-use hook that intercepts `Task` and `Agent` tool calls:

```typescript
// Before enforcement
spawn_subagent(subagent_type="oh-my-grok:executor",
  prompt="Implement feature X"
)

// After enforcement (automatic)
spawn_subagent(subagent_type="oh-my-grok:executor",
  model="grok-4.5",  // ← Injected from agent default / tier map
  prompt="Implement feature X"
)
```

On Grok Build, agent defaults resolve to **`grok-4.5`** for every complexity tier unless `OMG_MODEL_*` or `routing.tierModels` overrides them. Legacy aliases (`haiku`/`sonnet`/`opus`) map to LOW/MEDIUM/HIGH then to the same host slug.

### 2. Agent Definition Lookup

Each agent has a default model (or tier alias) in its definition:

```typescript
export const executorAgent: AgentConfig = {
  name: 'executor',
  description: '...',
  prompt: '...',
  tools: [...],
  model: 'grok-4.5'  // ← Default host model (or legacy tier alias → adapter)
};
```

The enforcer reads this definition and injects the model when not specified.

### 3. Explicit Models Preserved

If you explicitly specify a model, it's always preserved:

```typescript
// Explicit model is never overridden
spawn_subagent(subagent_type="oh-my-grok:executor",
  model="inherit",  // ← Explicit override (or "grok-4.5" / future slugs)
  prompt="Quick lookup"
)
```

## API

### Core Functions

#### `enforceModel(agentInput: AgentInput): EnforcementResult`

Enforces model parameter for a single agent delegation call.

```typescript
import { enforceModel } from 'oh-my-grok';

const input = {
  description: 'Implement feature',
  prompt: 'Add validation',
  subagent_type: 'executor'
};

const result = enforceModel(input);
console.log(result.modifiedInput.model); // 'grok-4.5'
console.log(result.injected); // true
```

#### `getModelForAgent(agentType: string): ModelType`

Get the default model for an agent type (resolved through the Grok tier map).

```typescript
import { getModelForAgent } from 'oh-my-grok';

getModelForAgent('executor'); // 'grok-4.5' (MEDIUM tier default)
getModelForAgent('executor-low'); // 'grok-4.5' (LOW tier default)
getModelForAgent('executor-high'); // 'grok-4.5' (HIGH tier default)
```

#### `isAgentCall(toolName: string, toolInput: unknown): boolean`

Check if a tool invocation is an agent delegation call.

```typescript
import { isAgentCall } from 'oh-my-grok';

isAgentCall('Task', { subagent_type: 'executor', ... }); // true
isAgentCall('Bash', { command: 'ls' }); // false
```

### Hook Integration

The enforcer automatically integrates with the pre-tool-use hook:

```typescript
import { processHook } from 'oh-my-grok';

const hookInput = {
  toolName: 'Task',
  toolInput: {
    description: 'Test',
    prompt: 'Test',
    subagent_type: 'executor'
  }
};

const result = await processHook('pre-tool-use', hookInput);
console.log(result.modifiedInput.model); // 'grok-4.5'
```

## Agent Model Mapping (Grok Build)

Host model is **`grok-4.5`** for all agents by default. Complexity column is routing intent (agent variant), not a distinct Claude SKU.

| Agent Type | Complexity | Host model (default) | Use Case |
|------------|------------|----------------------|----------|
| `architect` | HIGH | `grok-4.5` | Complex analysis, debugging |
| `architect-medium` | MEDIUM | `grok-4.5` | Standard analysis |
| `architect-low` | LOW | `grok-4.5` | Quick questions |
| `executor` | MEDIUM | `grok-4.5` | Standard implementation |
| `executor-high` | HIGH | `grok-4.5` | Complex refactoring |
| `executor-low` | LOW | `grok-4.5` | Simple changes |
| `explore` | LOW | `grok-4.5` | Fast code search |
| `designer` | MEDIUM | `grok-4.5` | UI implementation |
| `designer-high` | HIGH | `grok-4.5` | Complex UI architecture |
| `designer-low` | LOW | `grok-4.5` | Simple styling |
| `document-specialist` | MEDIUM | `grok-4.5` | Documentation lookup |
| `writer` | LOW | `grok-4.5` | Documentation writing |
| `vision` | MEDIUM | `grok-4.5` | Image analysis |
| `planner` | HIGH | `grok-4.5` | Strategic planning |
| `critic` | HIGH | `grok-4.5` | Plan review |
| `analyst` | HIGH | `grok-4.5` | Pre-planning analysis |
| `qa-tester` | MEDIUM | `grok-4.5` | CLI testing |
| `scientist` | MEDIUM | `grok-4.5` | Data analysis |
| `scientist-high` | HIGH | `grok-4.5` | Complex research |

## Debug Mode

Enable debug logging to see when models are auto-injected:

```bash
export OMC_DEBUG=true
```

When enabled, you'll see warnings like:

```
[OMG] Auto-injecting model: grok-4.5 for executor
```

**Important:** Warnings are ONLY shown when `OMC_DEBUG=true`. Without this flag, enforcement happens silently.

## Usage Examples

### Before (Manual)

```typescript
// Every delegation needs explicit model
spawn_subagent(subagent_type="oh-my-grok:executor",
  model="grok-4.5",
  prompt="Implement X"
)

spawn_subagent(subagent_type="oh-my-grok:executor-low",
  model="grok-4.5",
  prompt="Quick lookup"
)
```

### After (Automatic)

```typescript
// Model automatically injected from definition
spawn_subagent(subagent_type="oh-my-grok:executor",
  prompt="Implement X"
)

spawn_subagent(subagent_type="oh-my-grok:executor-low",
  prompt="Quick lookup"
)
```

### Override When Needed

```typescript
// Force parent session model, or a future host slug when available
spawn_subagent(subagent_type="oh-my-grok:executor",
  model="inherit",
  prompt="Find definition of X"
)
```

## Implementation Details

### Hook Integration

The enforcer runs in the `pre-tool-use` hook:

1. Hook receives tool invocation
2. Checks if tool is `Task` or `Agent`
3. Checks if `model` parameter is missing
4. Looks up agent definition
5. Injects default model
6. Returns modified input

### Error Handling

- Unknown agent types throw errors
- Agents without default models throw errors
- Invalid input structures are passed through unchanged
- Non-agent tools are ignored

### Performance

- O(1) lookup: Direct hash map lookup for agent definitions
- No async operations: Synchronous enforcement
- Minimal overhead: Only applies to Task/Agent calls

## Testing

Run tests:

```bash
npm test -- delegation-enforcer
```

Run demo:

```bash
npx tsx examples/delegation-enforcer-demo.ts
```

## Benefits

1. **Cleaner Code**: No need to manually specify model every time
2. **Consistency**: Always uses correct model tier for each agent
3. **Safety**: Explicit models always preserved
4. **Transparency**: Debug mode shows when models are injected
5. **Zero Config**: Works automatically with existing agent definitions

## Migration

No migration needed! The enforcer is backward compatible:

- Existing code with explicit models continues working
- New code can omit model parameter
- No breaking changes

## Related

- [Agent Definitions](./AGENTS.md) - Complete agent reference
- [Features Reference](./FEATURES.md) - Model routing and delegation categories
