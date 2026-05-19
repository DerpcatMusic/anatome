# HomeBody Swarm Operations Manual

> Pi Messenger Swarm is active for this project. You are **SageArrow**.

## Current Channels

| Channel | Purpose |
|---|---|
| `#happy-lion` | Your default session channel (auto-created) |
| `#memory` | Cross-session knowledge, decisions, async handoff |
| `#frontend` | Svelte/Astro UI work, components, styling |
| `#backend` | Convex auth, functions, schema, API |
| `#design` | RTL Hebrew, UX polish, accessibility |

## Quick Commands

```bash
# Join a channel
pi-messenger-swarm join --channel backend

# Post to a channel
pi-messenger-swarm send to:#backend "Starting auth refactor today"

# DM another agent
pi-messenger-swarm send SwiftTiger "Check convex/auth.ts line 42"

# See swarm board
pi-messenger-swarm swarm

# See activity feed
pi-messenger-swarm feed --limit 20

# Your status
pi-messenger-swarm status
```

## Task Lifecycle

```bash
# Create
cd /home/derpcat/projects/homebody
pi-messenger-swarm task create --title "Fix RTL on login" --content "Login page breaks in Hebrew" --channel frontend

# Claim (assign to yourself or an agent)
pi-messenger-swarm task claim task-1

# Progress
pi-messenger-swarm task progress task-1 "Found the issue: flex-direction not flipped"

# Done
pi-messenger-swarm task done task-1 "Fixed with logical properties, tested in Hebrew"

# List all
pi-messenger-swarm task list
```

## Spawn Specialized Agents

```bash
# Spawn a one-off specialist
pi-messenger-swarm spawn --role "Convex Performance Auditor" \
  --persona "Ruthless optimizer who counts every query" \
  "Audit all convex queries for N+1 patterns and missing indexes"

# Spawn with a task link
pi-messenger-swarm spawn --role "Accessibility Reviewer" \
  --task-id task-3 \
  "Check all forms for ARIA labels and keyboard navigation"

# See spawn history
pi-messenger-swarm spawn history

# Stop a spawned agent
pi-messenger-swarm spawn stop <id>
```

## Active Spawned Agents

| ID | Name | Role | Status | Mission |
|---|---|---|---|---|
| e39ce9e6 | SwiftTiger | Convex Auth Specialist | running | Audit auth flow |
| ffdaef86 | SageDragon | Svelte Frontend Scout | running | RTL + a11y review |

Agent definitions live in `.pi/messenger/agents/`

## Daily Workflow

### Morning Standup (with yourself)
```bash
pi-messenger-swarm join --channel memory
pi-messenger-swarm send to:#memory "2026-05-18: Focus is auth refactor + RTL fixes. Blocked on Stripe Connect decision."
pi-messenger-swarm swarm
```

### Spawn a Research Agent
```bash
pi-messenger-swarm spawn --role "Stripe Connect V2 Researcher" \
  "Research Stripe Express onboarding API v2 for sport instructors. What fields are required for US vs EU?"
```

### Parallel Work
```bash
# In terminal 1: join backend, work on auth
pi-messenger-swarm join --channel backend

# In terminal 2: join frontend, work on UI
pi-messenger-swarm join --channel frontend

# Both see each other's updates in #memory
```

### End of Day
```bash
pi-messenger-swarm task archive_done
pi-messenger-swarm send to:#memory "EOD: 2 tasks done, 1 blocked pending API keys"
```

## Messenger vs agent_team

| | `pi-messenger-swarm` | `agent_team` |
|---|---|---|
| **Visibility** | Scrollable channels, feeds, tasks | Detached processes, compact notices |
| **Persistence** | File-backed, survives reboots | In-memory, lost on reload |
| **Interaction** | Chat-style messaging | Static DAG, retrieve/peek |
| **Orchestration** | You are the conductor | Pre-defined graph |
| **Best for** | Long-running projects, async handoff | One-shot parallel audits |

## Pro Tips

1. **Always join first** — `pi-messenger-swarm join` registers you in the mesh
2. **Use `#memory` for decisions** — it survives session restarts
3. **Name your spawns** — `--name "StripeBot"` instead of random names
4. **Claim before work** — prevents collision if multiple agents touch the same code
5. **Progress often** — feed becomes your project journal
6. **Archive done tasks** — keeps the board clean

## Files

All state is in `.pi/messenger/`:
- `channels/*.jsonl` — channel feeds (append-only)
- `tasks/` — task specs and event logs
- `agents/` — spawned agent definitions
- `registry/` — agent registrations
