# Antigravity Task: Production Workspace Bootstrap

## Goal

Transformar o escopo vendido em um workspace de producao acionavel dentro do ambiente de execucao, pronto para implementacao, testes e handoff.

## Why This Matters

Hoje o fluxo ja consegue chegar mais perto da venda com:

- research
- workspace operacional
- bootstrap de proposta

Mas ainda falta a ponte concreta entre:

- o que foi prometido ao cliente
- o ambiente real onde a entrega sera produzida

Sem esse stage, o sistema continua forte na venda e fraco na materializacao do servico/produto vendido.

## Scope

- consumir explicitamente o `resultFile` do stage `proposal-bootstrap-pack`
- usar o `resultFile` do `operator-workspace-bootstrap` apenas como apoio e nao como fonte primaria desta etapa
- ler o proposal bootstrap e o workspace operacional anteriores
- usar o workspace por lead em `reports/operator-workspaces/<lead_id>/` como contexto de negocio e escopo
- gerar um workspace de producao previsivel em `reports/`
- explicitar:
  - objetivo da entrega
  - stack ou ambiente de execucao
  - entradas e dependencias
  - checkpoints de implementacao
  - checkpoints de QA
  - pacote esperado de handoff
- deixar claro o que ainda depende de decisao humana

## Dependency Contract

Este stage so deve avancar se existir e estiver legivel:

- `reports/antigravity/2026-04-02-antigravity-proposal-bootstrap-pack.result.md`

Pode consultar tambem:

- `reports/antigravity/2026-04-02-antigravity-operator-workspace-bootstrap.result.md`

Se o proposal bootstrap nao existir, a tarefa deve falhar explicitamente como dependencia ausente.
Nao deve reconstruir a proposta "de memoria" a partir de docs genericos.

## Workspace Shape

O artefato gerado deve deixar o trabalho de producao pronto para continuar sem reinterpretacao manual.

Estrutura minima esperada:

- resumo do que foi vendido
- escopo operacional da entrega
- ambiente de execucao ou stack prevista
- acessos e dependencias obrigatorias
- riscos conhecidos e suposicoes
- plano de implementacao por etapas
- checkpoints de QA e aceite
- checklist de handoff

## Output Contract

O resultado deve ser legivel como um plano de trabalho real, nao como uma nota solta.

O operador deve conseguir responder apenas lendo o artefato:

- o que sera implementado primeiro
- o que depende de acesso ou decisao externa
- o que define build pronto
- o que define QA pronto
- o que define handoff pronto

Saida minima esperada:

- `reports/antigravity/2026-04-02-antigravity-production-workspace-bootstrap.result.md`
- plano por etapas com ordem de execucao
- secao separada para dependencias externas
- secao separada para riscos e assuncoes
- secao separada para checkpoints de delivery, QA e handoff

## Relevant Files

- `README.md`
- `docs/02_Guides/Mission_Compass.md`
- `docs/02_Guides/Application_Finalization_Plan.md`
- `docs/02_Guides/Delivery_Methodology.md`
- `docs/03_Templates/Production_Workspace_Bootstrap.md`
- `docs/03_Templates/Kickoff_Action_Plan_and_Risk_Register.md`
- `docs/03_Templates/Delivery_Control_and_PR_Log.md`
- `docs/03_Templates/QA_Acceptance_and_Handoff.md`
- `reports/operator-workspaces/<lead_id>/README.md`
- `reports/operator-workspaces/<lead_id>/01_opportunity_intake_and_fit.md`
- `reports/operator-workspaces/<lead_id>/02_feasibility_and_capability_assessment.md`
- `reports/operator-workspaces/<lead_id>/03_costing_pricing_and_timeline.md`
- outputs reais em `reports/` criados pelos stages anteriores

## Acceptance Criteria

1. Existe um artefato previsivel de production workspace em `reports/`.
2. O artefato traduz o que foi vendido em um plano de producao acionavel.
3. O operador entende claramente:
   - o que deve ser implementado
   - em que ambiente isso sera produzido
   - quais dependencias destravam a execucao
   - quais checkpoints validam delivery, QA e handoff
4. O artefato conecta kickoff, delivery, QA e handoff sem lacuna de raciocinio.
5. O formato do artefato fica documentado em `docs/03_Templates/Production_Workspace_Bootstrap.md`.
6. O novo stage fica refletido na documentacao canonica da missao e usa o workspace por lead como insumo principal.
7. Se houver alteracao de runtime, `npm run typecheck` continua passando.
8. Se houver inconsistencias entre proposta e workspace anterior, o artefato nomeia o conflito em vez de mascarar.

## Out Of Scope

- implementar a entrega inteira
- provisionar infraestrutura externa real
- publicar artefatos para cliente
- automatizar deploy final

## Validation

- `npm run typecheck`
- inspecionar o production workspace em `reports/`
- confirmar por leitura que ele deriva do proposal bootstrap e aponta para delivery, QA e handoff
- confirmar que a dependencia primaria foi o `resultFile` de proposal bootstrap
