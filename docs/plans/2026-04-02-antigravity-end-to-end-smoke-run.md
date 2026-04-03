# Antigravity Task: End-To-End Smoke Run

## Goal

Provar o fluxo vertical atual da aplicacao com um smoke run reproduzivel, do research ao bootstrap operacional, de proposta e de producao.

## Why This Matters

Sem evidencia de ciclo completo, a aplicacao continua sendo uma boa arquitetura com automacao parcial.
Precisamos de um teste operacional do modelo atual antes de declarar maturidade.

## Scope

- executar ou documentar de forma reproduzivel um run vertical completo
- usar os artefatos reais gerados nos stages anteriores
- tratar `reports/operator-workspaces/<lead_id>/` como workspace base do ciclo
- registrar evidencias em `reports/`
- explicitar o que funcionou, o que quebrou e o que ficou manual

## Dependency Contract

Este stage so deve avancar se existirem:

- `reports/antigravity/2026-04-02-antigravity-operator-workspace-bootstrap.result.md`
- `reports/antigravity/2026-04-02-antigravity-proposal-bootstrap-pack.result.md`
- `reports/antigravity/2026-04-02-antigravity-production-workspace-bootstrap.result.md`

Se qualquer um desses artefatos estiver faltando, o smoke run deve terminar como bloqueado por dependencia ausente.
Nao vale trocar evidencia real por narrativa.

## Output Contract

O resultado deve ser salvo em:

- `reports/antigravity/2026-04-02-antigravity-end-to-end-smoke-run.result.md`

Estrutura minima:

- `Summary`
- `Files Changed`
- `Validation Run`
- `Key Diffs`
- `Residual Risks`
- `Preserved By Contract`
- tabela ou lista de stages cobertos e evidencia correspondente

## Relevant Files

- `README.md`
- `research/README.md`
- `docs/02_Guides/Application_Finalization_Plan.md`
- `reports/operator-workspaces/<lead_id>/README.md`
- `reports/operator-workspaces/<lead_id>/01_opportunity_intake_and_fit.md`
- `reports/operator-workspaces/<lead_id>/02_feasibility_and_capability_assessment.md`
- `reports/operator-workspaces/<lead_id>/03_costing_pricing_and_timeline.md`
- outputs reais em `reports/`
- scripts ligados ao fluxo principal

## Acceptance Criteria

1. Existe um registro de smoke run em `reports/`.
2. O registro mostra:
   - entrada usada
   - artefatos produzidos
   - comandos executados
   - pontos manuais restantes
   - falhas ou gaps detectados
3. O run cobre no minimo:
   - research
   - handoff
   - workspace operacional
   - bootstrap de proposta
   - workspace de producao
4. Se houver falha, o resultado deve apontar o gargalo exato em vez de esconder o problema.
5. Cada stage citado precisa apontar o artefato real correspondente em `reports/antigravity/`.

## Out Of Scope

- provar fechamento comercial real
- provar aceite de cliente
- reescrever a aplicacao inteira

## Validation

- rodar os comandos reais do fluxo principal quando possivel
- validar a existencia dos artefatos registrados
- confirmar que o relatorio aponta gaps residuais com precisao
- confirmar que o relatorio distingue claramente `funcionou`, `manual` e `bloqueado`
