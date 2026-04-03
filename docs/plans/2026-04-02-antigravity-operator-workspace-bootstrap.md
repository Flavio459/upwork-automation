# Antigravity Task: Operator Workspace Bootstrap

## Goal

Transformar o handoff do `research` em um workspace operacional deterministico por oportunidade, pronto para continuar o fluxo sem reinterpretacao manual.

## Why This Matters

Hoje o repositorio tem:

- pesquisa real no Upwork
- templates operacionais maduros

Mas ainda falta a ponte concreta entre:

- `resultado do research`
- `inicio do fluxo operacional`

Sem esse workspace, a aplicacao continua dependente de leitura manual e copia entre artefatos.

## Scope

- consumir explicitamente o artefato real de handoff produzido por `research-handoff-output`
- usar o melhor candidato acionavel vindo do output do `research`
- gerar um workspace operacional em `reports/`
- preencher os campos iniciais que destravam intake, viabilidade e pricing
- preservar o uso atual de `npm run research`

## Dependency Contract

Este stage so deve avancar se existir e estiver legivel:

- `reports/antigravity/2026-04-02-antigravity-research-handoff-output.result.md`
- `reports/research-handoff.md`

Se esses artefatos nao existirem, estiverem vazios ou se contradisserem, a tarefa deve:

- parar
- apontar a dependencia ausente ou quebrada
- nao reconstruir a escolha da oportunidade com inferencia paralela

## Output Contract

O resultado final deve ser previsivel e reutilizavel pelo operador e pelos stages seguintes.

Saida minima esperada:

- `reports/antigravity/2026-04-02-antigravity-operator-workspace-bootstrap.result.md`
- um artefato operacional correspondente em `reports/`
- secao clara de `Summary`
- secao clara de `Files Changed`
- secao clara de `Validation Run`
- secao clara de `Key Diffs`
- secao clara de `Residual Risks`
- secao clara de `Preserved By Contract`

O conteudo precisa deixar explicito:

- qual oportunidade foi escolhida a partir do handoff
- qual evidencia sustenta a escolha
- quais campos-base foram efetivamente preenchidos
- quais pontos permanecem como decisao humana
- o caminho exato do artefato operacional que os proximos stages devem consumir

## Result File

O resultado deve registrar, em linguagem direta:

- qual oportunidade foi escolhida
- por que ela foi escolhida
- quais campos-base foram preenchidos
- quais templates ainda precisam ser completados
- qual artefato final ficou em `reports/`

## Relevant Files

- `scripts/research.ts`
- `services/niche-research.ts`
- `research/README.md`
- `docs/03_Templates/Opportunity_Intake_and_Fit.md`
- `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
- `docs/03_Templates/Costing_Pricing_and_Timeline.md`
- `reports/operator-workspaces/<lead_id>/README.md`
- `reports/operator-workspaces/<lead_id>/01_opportunity_intake_and_fit.md`
- `reports/operator-workspaces/<lead_id>/02_feasibility_and_capability_assessment.md`
- `reports/operator-workspaces/<lead_id>/03_costing_pricing_and_timeline.md`
- `README.md`

## Acceptance Criteria

1. Existe um artefato ou pasta previsivel em `reports/` para a oportunidade selecionada.
2. O workspace inclui os campos-base para:
   - intake
   - viabilidade
   - pricing
3. O operador entende sem ambiguidade:
   - oportunidade escolhida
   - motivo da escolha
   - proximos documentos a completar
4. O output novo fica documentado no `README.md` ou em `research/README.md`.
5. `npm run typecheck` continua passando se o runtime for alterado.
6. O artefato referencia explicitamente `reports/research-handoff.md` ou o `resultFile` anterior como fonte.
7. Se faltar contrato de entrada, o resultado nomeia o bloqueio em vez de improvisar workspace.
8. O workspace operacional fica dividido em README de indice e stage docs separados.

## Out Of Scope

- gerar proposta completa
- localizar proposta
- automatizar envio ao cliente
- redesenhar templates canonicos

## Validation

- `npm run typecheck`
- inspecionar o artefato gerado em `reports/`
- confirmar por leitura que o workspace ja aponta para os templates corretos
- confirmar que a escolha da oportunidade deriva do handoff existente, e nao de nova triagem manual
