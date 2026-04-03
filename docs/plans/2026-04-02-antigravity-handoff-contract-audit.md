# Antigravity Task: Handoff Contract Audit

## Goal

Auditar o contrato do handoff gerado pelo `research` para garantir que ele conversa sem ambiguidade com os templates operacionais que destravam o restante do fluxo.

## Why This Matters

O `research-handoff-output` fecha a lacuna principal entre pesquisa e operacao.

Mas, antes de escalar para os proximos stages, e preciso verificar se o contrato do artefato esta realmente estavel:

- nomes de campos
- placeholders
- estados
- limites do que o handoff promete

Sem essa auditoria curta, o fluxo pode parecer fechado, mas ainda carregar ambiguidade suficiente para gerar retrabalho no `operator-workspace-bootstrap` e no `proposal-bootstrap-pack`.

## Scope

- consumir explicitamente o handoff real produzido por `research-handoff-output`
- ler o artefato real gerado por `research-handoff-output`
- comparar esse artefato com os templates operacionais que ele deve alimentar
- reconhecer que o handoff alimenta o workspace por lead em `reports/operator-workspaces/<lead_id>/`
- identificar gaps entre:
  - campos esperados
  - campos realmente gerados
  - placeholders
  - status e decisoes iniciais
- propor ajustes pequenos e defensaveis, se houver desvio claro
- registrar o contrato preservado e os limites do handoff

## Dependency Contract

Esta auditoria so e valida se existir e estiver legivel:

- `reports/antigravity/2026-04-02-antigravity-research-handoff-output.result.md`
- `reports/research-handoff.md`

Se esses artefatos nao existirem, a tarefa deve falhar como dependencia ausente.
Nao e aceitavel auditar um contrato que nao esta materializado.

## Output Contract

O resultado final deve ser salvo em:

- `reports/antigravity/2026-04-02-antigravity-handoff-contract-audit.result.md`

Estrutura minima:

- `Summary`
- `Files Changed`
- `Validation Run`
- `Key Diffs`
- `Residual Risks`
- `Preserved By Contract`

O parecer precisa deixar explicito:

- quais campos do handoff sao suficientes para intake, viabilidade e pricing
- quais lacunas sao aceitaveis nesta fase
- quais lacunas exigem tratamento no `operator-workspace-bootstrap`
- quais limites nao podem ser reinterpretados nos stages seguintes

## Result File

O resultado deve explicar, sem criar novo escopo:

- quais campos do handoff continuam corretos
- quais placeholders seguem aceitaveis
- quais lacunas ainda exigem trabalho no `operator-workspace-bootstrap`
- quais limites nao devem ser reabertos

## Relevant Files

- output real em `reports/` criado por `research-handoff-output`
- `research/README.md`
- `docs/03_Templates/Opportunity_Intake_and_Fit.md`
- `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
- `docs/03_Templates/Costing_Pricing_and_Timeline.md`
- `reports/operator-workspaces/<lead_id>/README.md`
- `README.md`
- `docs/02_Guides/Application_Finalization_Plan.md`

## Acceptance Criteria

1. Existe um resultado de auditoria em `reports/antigravity/` para o contrato do handoff.
2. O resultado deixa claro:
   - quais campos do handoff estao corretos
   - quais campos ainda estao incompletos
   - quais placeholders sao aceitaveis
   - quais limites devem ser preservados por contrato
3. Se houver ajuste, ele e pequeno, objetivo e nao reabre a arquitetura.
4. O resultado deixa o `operator-workspace-bootstrap` mais seguro, nao mais acoplado.
5. Se houver mudanca de runtime, `npm run typecheck` continua passando.
6. O parecer referencia explicitamente o handoff real em `reports/research-handoff.md`.
7. Se faltar evidencia, a conclusao correta e bloqueio, nao confianca simulada.

## Out Of Scope

- criar o workspace operacional completo
- gerar proposal bootstrap
- redesenhar os templates canonicos
- aumentar o escopo do handoff com dados inventados

## Validation

- inspecionar o handoff real em `reports/`
- confirmar por leitura o mapeamento para:
  - intake
  - viabilidade
  - pricing
- se houver alteracao de runtime:
  - `npm run typecheck`
- confirmar que o parecer nomeia claramente o que e preservado por contrato
