# Antigravity Task: Health Check

## Goal

Verificar se o loop Antigravity ainda devolve resposta operacional com uma tarefa curta e isolada.

## Why This Matters

O painel ficou com `heartbeatState: stale`.
Antes de assumir que o loop morreu, vamos testar uma tarefa simples, de baixo risco, com resultado verificavel.

## Scope

- ler o estado atual em `reports/antigravity/status.md`
- ler a fila atual em `automation/antigravity-queue.json`
- devolver um veredito curto sobre:
  - `healthy`
  - `warning`
  - `stalled`
- citar o motivo objetivo do veredito
- nao alterar a fila principal

## Result File

O resultado deve ser salvo em:

- `reports/antigravity/2026-04-03-antigravity-health-check.result.md`

O arquivo deve conter, no minimo:

- `Summary`
- `Files Changed`
- `Validation Run`
- `Key Diffs`
- `Residual Risks`
- `Preserved By Contract`

## Relevant Files

- `reports/antigravity/status.md`
- `automation/antigravity-queue.json`
- `automation/antigravity-goal.json`
- `docs/02_Guides/Antigravity_Delegation_and_Review.md`

## Acceptance Criteria

1. O resultado diz claramente se o loop esta vivo ou nao.
2. O resultado aponta o sinal objetivo que sustentou a leitura.
3. O resultado nao altera a fila principal.
4. Se houver falha, ela deve ser curta e diagnostica.

## Out Of Scope

- mexer em qualquer stage principal
- alterar a fila principal
- abrir novas dependencias

## Validation

- leitura de `reports/antigravity/status.md`
- leitura de `automation/antigravity-queue.json`
