# Task

Implementar uma saida de handoff do `research` que conecte o shortlist ao sistema operacional solo, gerando um artefato pronto para iniciar os templates operacionais.

# Objective

Hoje o `research` gera:

- `reports/niche-selection-report.md`
- `reports/niche-selection-report.json`
- `upwork_research.db`

Mas `research/README.md` tambem promete `the handoff inputs for the solo operating system`, e isso nao existe como artefato dedicado no runtime atual.

O objetivo desta tarefa e fechar essa lacuna com uma implementacao pequena, clara e defensavel.

# Scope

- Adicionar uma saida de handoff dedicada ao fluxo `npm run research`.
- A saida deve ser util para iniciar o fluxo em:
  - `docs/03_Templates/Opportunity_Intake_and_Fit.md`
  - `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
  - `docs/03_Templates/Costing_Pricing_and_Timeline.md`
- A saida deve tambem servir de entrada para o workspace operacional em `reports/operator-workspaces/<lead_id>/`.
- Pode ser um markdown, um JSON, ou ambos, desde que o resultado seja pragmatico para uso operacional.
- Atualizar a documentacao relevante para refletir a nova saida.

- Nao reescrever o motor de scoring.
- Nao alterar a logica principal do browser flow.
- Nao inventar dados inexistentes do cliente.

# Relevant Files

- `research/README.md`
  Documenta o fluxo e hoje promete um handoff que ainda nao e gerado.
- `scripts/research.ts`
  Ponto de escrita das saidas do comando.
- `services/niche-research.ts`
  Lugar natural para helpers puros de formatacao e montagem de artefatos.
- `docs/03_Templates/Opportunity_Intake_and_Fit.md`
  Primeiro template operacional que o handoff deve alimentar.
- `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
  Segundo template operacional.
- `docs/03_Templates/Costing_Pricing_and_Timeline.md`
  Template de continuidade do fluxo.
- `reports/operator-workspaces/<lead_id>/README.md`
- `README.md`
  Pode precisar citar a nova saida nos scripts ou artefatos.

# Current Findings

- `research/README.md` afirma que a CLI escreve `the handoff inputs for the solo operating system`.
- `scripts/research.ts` hoje so grava:
  - markdown do shortlist
  - JSON das avaliacoes
  - SQLite
- Nao existe builder dedicado de handoff em `services/niche-research.ts`.

# Implementation Direction

Prefira uma implementacao minima e util:

1. Criar um builder puro no estilo de `buildResearchReportMarkdown`, por exemplo:
   - `buildResearchHandoffMarkdown(...)`
   - opcionalmente `buildResearchHandoffPayload(...)`

2. O handoff deve usar o melhor candidato acionavel:
   - priorizar o primeiro `PURSUE`
   - se nao houver `PURSUE`, usar o primeiro candidato da lista e marcar claramente a limitacao

3. O artefato deve preencher apenas o que existe com seguranca:
   - `lead_id`
   - `source_url`
   - `offer_fit`
   - `problem_summary`
   - `budget_range`
   - `fit inicial`
   - `decisao inicial`
   - `feasibility_status` preliminar
   - `target_price`, `price_floor`, `margin_ratio` quando defensavel

4. Quando um campo nao existir, usar placeholder explicito e honesto:
   - `unknown`
   - `to be confirmed`
   - ou deixar em branco, se isso combinar melhor com o template

5. Escrever a saida em `reports/`, com default claro. Exemplo razoavel:
   - `reports/research-handoff.md`
   - opcionalmente `reports/research-handoff.json`

6. Atualizar `research/README.md` para refletir exatamente as saidas reais.

# Constraints

- Nao hallucinar dados do cliente.
- Nao converter o handoff em um artefato enorme; ele deve ser de transicao operacional.
- Mantenha o output consistente com o tom do projeto.
- Preserve compatibilidade com `npm run research`.
- Se adicionar novas paths de output, mantenha defaults simples e documentados.

# Acceptance Criteria

- `npm run research` passa a gerar um artefato de handoff dedicado em `reports/`.
- O handoff usa dados reais da melhor oportunidade disponivel no resultado.
- Campos ausentes sao tratados com placeholders explicitos, nao com invencao.
- `research/README.md` passa a descrever as saidas reais do comando.
- A saida conecta explicitamente a oportunidade escolhida ao workspace operacional por lead.
- Se houver mudanca TypeScript, `npm run typecheck` deve passar.

# Validation

- Ler o trecho de escrita de saida em `scripts/research.ts` e confirmar a nova path.
- Rodar:
  - `npm run typecheck`
- Validar por inspeccao que o handoff inclui:
  - identificacao
  - resumo do problema
  - sinais economicos
  - proxima transicao para os templates operacionais

# Output Format

- Resumo curto do que foi implementado.
- Lista de arquivos alterados.
- Caminho do novo artefato gerado pelo `research`.
- Pendencias ou tradeoffs, se houver.
