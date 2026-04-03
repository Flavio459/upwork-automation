# Browser-First Vertical Flow Implementation Plan

> [!IMPORTANT]
> Este é um plano de execução ativo, nao um documento canônico.
> O mapa de referências continua sendo a fonte de verdade; este arquivo existe para orientar a implementacao task-by-task.
> Este plano e lateral ao caminho critico atual de validacao da aplicacao. O fluxo principal da missao segue pelos stages em `docs/02_Guides/Application_Finalization_Plan.md`.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the current Upwork research flow into a minimal browser-first vertical agent that reliably collects, scores, and records opportunities from the authenticated `best-matches` feed.

**Architecture:** Keep Playwright and the persisted Chrome session as the base. Add a narrow browser-task boundary for the Upwork research path, keep the public CLI minimal, and introduce lightweight metrics so we can measure reliability before generalizing beyond Upwork.

**Tech Stack:** TypeScript, Playwright, SQLite, Node.js, existing Upwork session manager, existing research/scoring services.

---

### Task 1: Define the vertical browser flow boundary

**Files:**
- Create: `services/browser-flow.ts`
- Modify: `scripts/research.ts`
- Modify: `services/upwork-feed-collector.ts`

**Step 1: Add the new flow boundary**

Create a small orchestration layer that expresses one vertical browser task:
- connect to the persisted Chrome session
- open the Upwork best-matches feed
- collect visible opportunities
- return structured results with success/failure metadata

**Step 2: Wire the research script to the new boundary**

Make `scripts/research.ts` call the new boundary instead of talking directly to the collector.

**Step 3: Preserve compatibility**

Keep the current collector export working so the existing code path still compiles while the new boundary is introduced.

**Step 4: Verify**

Run: `npm run typecheck`
Expected: pass with no TypeScript errors.

---

### Task 2: Add minimal execution metrics

**Files:**
- Create: `services/browser-metrics.ts`
- Modify: `scripts/research.ts`
- Modify: `README.md`
- Modify: `docs/06_Research/README.md`

**Step 1: Define the metrics shape**

Track at least:
- run start and end time
- success / failure
- opportunities collected
- retries or challenge waits
- source path used

**Step 2: Emit metrics with each run**

Write a compact JSON record alongside the current markdown and SQLite outputs so we can compare runs over time.

**Step 3: Document the metrics**

Update docs so the next operator knows which values define a successful browser run.

**Step 4: Verify**

Run: `npm run typecheck`
Expected: pass with no TypeScript errors.

---

### Task 3: Clean up public naming and archive legacy aliases

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/Home.md`
- Modify: `docs/01_Architecture/User_Guide.md`
- Modify: `docs/02_Guides/Setup_Guide.md`

**Step 1: Ensure the minimal public scripts are the primary entry points**

Keep `login`, `research`, and `research:headless` as the preferred commands.

**Step 2: Archive legacy aliases**

Remove the legacy aliases from the public package surface and preserve the old flow under `legacy/`.

**Step 3: Update user-facing references**

Replace first-order references to legacy collector wording with browser-first wording in the main docs.

**Step 4: Verify**

Run: `npm run typecheck`
Expected: pass with no TypeScript errors.

---

### Task 4: Validate the end-to-end vertical flow

**Files:**
- Modify: none

**Step 1: Run the browser research command**

Run: `npm run research`
Expected: the command attaches to or launches the persisted Chrome session, collects opportunities from the authenticated feed, and writes the report artifacts.

**Step 2: Inspect outputs**

Confirm that:
- the report is written
- the JSON snapshot is written
- SQLite gets the updated evaluations

**Step 3: Record findings**

If challenge handling or selectors fail, capture the failing step and adjust the browser flow boundary before any generalization work.
