# Obsidian Skill Registry

> [!IMPORTANT]
> Este documento registra as capacidades operacionais reconhecidas no vault para uso no Obsidian.
> Ele existe para evitar memória informal, duplicação de nomenclatura e criação paralela de "skills" sem governança.

## Objetivo

Definir, nomear e localizar as skills operacionais/documentais que já existem ou foram institucionalizadas no vault.

## Regra de Uso

- uma skill no Obsidian deve ter nome estável
- deve apontar para artefato, script ou fluxo real
- deve declarar se é `ativa`, `proposta` ou `auxiliar`
- se uma nova skill virar recorrente, ela deve ser registrada aqui

## Registro Atual

| Skill | Estado | Tipo | Local Canônico | Função |
| --- | --- | --- | --- | --- |
| `research-canonical-flow` | ativa | operacional | [[research/README|research/README]] | Governa shortlist, pesquisa e handoff de oportunidade. |
| `antigravity-delegation-review` | ativa | operacional | [[docs/02_Guides/Antigravity_Delegation_and_Review|Antigravity Delegation and Review]] | Define como o Antigravity delega, revisa, recupera e fecha tarefas. |
| `production-workspace-follow-up` | ativa | administrativa | `reports/production-workspaces/<lead_id>/06_Administrative_Audit_and_Follow_Up.md` | Mantém coerência de estado, governança e acompanhamento executivo do workspace de produção. |
| `daily-administrative-audit` | ativa | administrativa/automacao | `scripts/antigravity-daily-audit.ts` + `reports/antigravity/daily-audits/<workspace>/` | Gera auditoria incremental diária com comparação de snapshots, drift de frontmatter, evolução documental e findings de acompanhamento. |

## Skill Específica Desta Tarefa

### `daily-administrative-audit`

- **Estado:** ativa
- **Natureza:** skill administrativa de gestão e acompanhamento
- **Escopo:** workspaces do Obsidian que evoluem continuamente
- **Modelo:** auditoria incremental orientada a estado
- **Entradas:** markdown do workspace + status do Antigravity
- **Saídas:**
  - `reports/antigravity/daily-audits/<workspace>/<date>.md`
  - `reports/antigravity/daily-audits/<workspace>/<date>.json`
  - `latest.md`
  - `latest.json`
- **Uso previsto:**
  - detectar deriva entre metadata e estado real
  - acompanhar evolução diária do workspace
  - preservar coerência documental
  - suportar supervisão administrativa e executiva

## Critério Para Criar Nova Skill

Uma capacidade nova só deve ser tratada como skill registrada quando:

- for recorrente
- tiver nome útil e não ambíguo
- já tiver artefato ou automação real
- produzir ganho operacional claro no vault

## Regra Final

Se uma capacidade não estiver registrada aqui, ela pode existir como prática local, mas não deve ser tratada como skill institucional do Obsidian sem registro explícito.
