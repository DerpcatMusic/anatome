# Why Codex CLI Is Blazing Fast (vs pi) + How to Close the Gap

## Codex CLI Speed Secrets

| Factor | How Codex Does It | How pi Compares |
|--------|------------------|-----------------|
| **Tool call streaming** | Parses partial tool call JSON as it streams from the model. Starts executing tools *before* the full JSON is ready. | Waits for the complete assistant message, then preflights tools sequentially before concurrent execution. |
| **Process model** | Single Node.js process. Everything in-memory. | `pi-subagents` spawns new `pi` subprocesses = cold start (auth, model registry, extension loading). |
| **Apply-patch tool** | Native `apply-patch` tool applies diffs directly. No full-file read/write cycle. | `edit` does exact text replacement (similar concept) but goes through file I/O + mutation queue. |
| **File caching** | Recently read files cached in memory. Re-reads are instant. | Each `read` is a fresh disk read (though OS cache helps). |
| **Auto-approve** | Default mode runs without human confirmation. | Interactive by default; no auto-approve mode. |
| **Tool set** | Minimal built-in tool set. No extension overhead. | `tools: all` loads every extension (MCP servers, playwright, etc.) = startup cost + bigger system prompt. |
| **UI rendering** | Streaming optimistic updates. Shows tool calls as they arrive. | Tool calls shown after preflight; results shown after completion. |

## pi Performance Bottlenecks (in order of impact)

1. **`pi-subagents` subprocess spawn** — Each subagent = new `pi` process. Cold start includes: auth resolution, model registry init, extension loading, MCP server spawning, system prompt construction.
2. **`tools: all` / omitted `tools`** — Loads every installed extension into the subagent. MCP servers spawn. Playwright may initialize. System prompt grows.
3. **`thinking: medium/high` by default** — More tokens = more latency per turn.
4. **Sequential tool preflight** — Even though tools execute concurrently, they're preflighted sequentially.
5. **File mutation queue** — `withFileMutationQueue` serializes file mutations per-path for safety. Good for correctness, adds latency.

## The Fix: Optimized pi Stack

### 1. Replace `pi-subagents` with `pi-fast-subagent`

**Why:** In-process subagents via `createAgentSession()`. Reuses parent's auth, model registry, and extensions. Removes subprocess cold start entirely.

```bash
pi install npm:pi-fast-subagent
```

### 2. Use Lean Agent Tool Sets

**Why:** `tools: builtins` only loads `read, bash, edit, write, grep, find, ls`. No MCP server spawn. No extension init. Smaller system prompt.

```yaml
---
name: kimi-coder
description: Fast coding agent
tools: builtins          # ← critical for speed
model: kimi-for-coding
thinking: low             # ← reduces token latency
---
```

### 3. Enable Model Cycling

**Why:** Switch between fast and powerful models with `Ctrl+P` instead of re-configuring.

```json
{
  "enabledModels": [
    "kimi-coding/kimi-for-coding",
    "kimi-coding/kimi-k1.5",
    "openai/gpt-5.4-mini"
  ]
}
```

### 4. Lower Default Thinking

**Why:** `thinking: low` = fewer reasoning tokens = faster response.

```json
{ "defaultThinkingLevel": "low" }
```

### 5. Consider `pi-messenger-swarm`

**Why:** True multi-agent messaging with channels, swarm board, and task lifecycle. Better than manual subagent orchestration.

```bash
pi install npm:pi-messenger-swarm
```

## Speed Comparison Estimates

| Scenario | pi (subprocess subagents) | pi (optimized) | Codex CLI |
|----------|---------------------------|----------------|-----------|
| Single subagent cold start | ~2-5s | ~0.2s (in-process) | ~0s |
| Agent with `tools: all` | +1-3s extension init | +0s (`builtins`) | +0s |
| Tool call latency (medium think) | ~3-8s/turn | ~1-3s/turn (low think) | ~1-2s/turn |
| Parallel 4 agents | ~5-10s total | ~1-3s total | ~1-2s total |

## Action Plan

1. `pi install npm:pi-fast-subagent` — replace subprocess subagents
2. `pi install npm:pi-messenger-swarm` — add swarm coordination (optional)
3. Create lean agent configs with `tools: builtins` and `thinking: low`
4. Update settings: `defaultThinkingLevel: low`, enable multiple models
5. Remove `npm:pi-subagents` from packages (conflicts with fast-subagent)
