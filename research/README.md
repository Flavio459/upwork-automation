# Research-First Offer Selection

> [!IMPORTANT]
> Se esta for uma conversa nova, leia primeiro [Chat Bootstrap](../docs/00_Governance/Chat_Bootstrap.md) e [Mapa de Referências](../docs/00_Governance/Reference_Map.md).
> Este arquivo é a fonte canônica do fluxo de research. O índice em `docs/06_Research/Index.md` existe apenas por compatibilidade de navegação.

This folder holds the inputs and official signals for the offer selection phase.

Current thesis:

- productized `AI Systems Audit Sprint`
- `audit` and `AI advisory` as the entry point
- `workflow automation` and `RAG orchestration` as expansion paths
- `python` as implementation stack, not as the offer itself

Current status:

- `INCORPORATED AS OPERATING THESIS`
- The offer is ready to drive research, copy, qualification, and proposal work.
- It is still a strong hypothesis, not final market doctrine.
- Revisit after 3 to 5 real executions with consistent demand, margin, and fit.

## Workflow

1. Read `official-signals.json` to anchor the research in public Upwork data.
2. Run `npm run research` to attach to the saved Chrome session when it is available, read live opportunities from the authenticated `best-matches` feed, and rank the offers that are visible in your account.
3. Optionally add `niche-candidates.json` as overrides when you want to inject manual assumptions or extra candidates.
4. Review the ranked shortlist and pick the best offer by margin, delivery fit, and AI executability.
5. Use `docs/05_Ideation/AI_Qualification_Framework.md` to decide whether an opportunity should be accepted, watched, or rejected.
6. Use `reports/research-handoff.md` as the bridge into the operating system docs.
7. If the opportunity is accepted, continue with `docs/03_Templates/Opportunity_Intake_and_Fit.md` and `docs/03_Templates/Feasibility_and_Capability_Assessment.md`.
8. Move from pricing to proposal and localization through `docs/03_Templates/Proposal_and_Localization_Pack.md` before any client-facing send.
9. When a lead is actionable, hand off to the operating system docs in `docs/00_Governance/Reference_Map.md`.

If Upwork returns a challenge page, the command keeps the visible browser session open and waits for you to clear it there. If you need more time, set `UPWORK_RESEARCH_CHALLENGE_TIMEOUT_MS=120000`. The research command no longer falls back to Gmail or public search pages, and the legacy email flow now lives under `legacy/`.
If the `.upwork-session` profile is locked by an open Chrome window, close that browser before running the research command.

## Input Shape

Each candidate should capture:

- category and subcategory
- offer angle
- demand signal
- ticket range
- competition pressure
- complexity pressure
- fit to our environment
- estimated delivery hours
- estimated token cost
- expected negotiated value
- case strategy (`real` or `hybrid`)

## Output

The CLI writes:

- a markdown shortlist report
- a JSON payload with the scored evaluation
- a SQLite snapshot in `upwork_research.db`
- the current productized thesis in the shortlist context
- the handoff inputs for the solo operating system in:
  - `reports/research-handoff.md`
  - `reports/research-handoff.json`
- the operator workspace index and stage docs in `reports/operator-workspaces/<lead_id>/`

## Handoff To The Operating System

Once a candidate is qualified, the next documents are:

1. `docs/05_Ideation/AI_Qualification_Framework.md`
2. `docs/03_Templates/Opportunity_Intake_and_Fit.md`
3. `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
4. `docs/03_Templates/Costing_Pricing_and_Timeline.md`
5. `docs/03_Templates/Proposal_and_Localization_Pack.md`
6. `docs/03_Templates/Localization_Review_Checklist.md`
7. `reports/operator-workspaces/<lead_id>/README.md` and the sibling stage docs under the same folder

## Current Assumptions

- We use a 25% minimum margin threshold by default.
- We treat low-demand, low-margin, or low-executability ideas as `REJECT`.
- The first pass is automated by the agent; manual overrides are optional.
- The default output should favor audit-led, architecture-heavy opportunities over commodity execution.
- Internal operation is in `pt-BR`; client-facing artifacts are localized to the client's language before send.
