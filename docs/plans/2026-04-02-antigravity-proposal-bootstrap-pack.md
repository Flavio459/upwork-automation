# Antigravity Task: Proposal Bootstrap Pack

## Goal

Gerar um bootstrap coerente da camada de proposta a partir do workspace operacional da oportunidade escolhida.

## Why This Matters

O projeto ja tem templates maduros para proposta e localizacao, mas ainda nao existe uma transicao estruturada entre:

- oportunidade selecionada
- workspace operacional
- pack inicial de proposta

Esse gap impede dizer que a aplicacao fecha o fluxo principal.

## Scope

- consumir explicitamente o `resultFile` do stage `operator-workspace-bootstrap`
- preferir como fonte operacional o workspace em `reports/operator-workspaces/<lead_id>/`
- ler o workspace operacional gerado no stage anterior sem reabrir a decisao de fit
- produzir um starter pack de proposta em `reports/`
- incluir campos iniciais para:
  - resumo da oportunidade
  - fit
  - faixa de escopo
  - riscos principais
  - pricing inicial
  - proximo passo de localizacao

## Dependency Contract

Este stage so deve avancar se existir e estiver legivel:

- `reports/antigravity/2026-04-02-antigravity-operator-workspace-bootstrap.result.md`

Se esse artefato nao existir, estiver vazio ou contraditorio, a tarefa deve:

- parar
- explicar o bloqueio
- nao inventar bootstrap de proposta por inferencia solta

## Output Contract

O artefato final deve ser previsivel e gerencialmente util.

Saida minima esperada:

- `reports/antigravity/2026-04-02-antigravity-proposal-bootstrap-pack.result.md`
- secao clara de `Summary`
- secao clara de `Files Changed`
- secao clara de `Validation Run`
- secao clara de `Key Diffs`
- secao clara de `Residual Risks`
- secao clara de `Preserved By Contract`

O conteudo precisa deixar explicito:

- o que veio do workspace operacional anterior
- o que ainda exige decisao humana
- o que pode ser copiado para o template de proposta
- o que ainda nao pode ser enviado ao cliente

## Relevant Files

- `docs/03_Templates/Proposal_and_Localization_Pack.md`
- `docs/03_Templates/Localization_Review_Checklist.md`
- `docs/03_Templates/Costing_Pricing_and_Timeline.md`
- `docs/03_Templates/Opportunity_Intake_and_Fit.md`
- `reports/operator-workspaces/<lead_id>/README.md`
- `reports/operator-workspaces/<lead_id>/01_opportunity_intake_and_fit.md`
- `reports/operator-workspaces/<lead_id>/02_feasibility_and_capability_assessment.md`
- `reports/operator-workspaces/<lead_id>/03_costing_pricing_and_timeline.md`
- `README.md`
- outputs reais em `reports/` criados pelo stage anterior

## Acceptance Criteria

1. Existe um artefato previsivel de proposal bootstrap em `reports/`.
2. O artefato reaproveita os dados da oportunidade escolhida, em vez de pedir nova interpretacao manual.
3. O operador entende claramente:
   - o que revisar
   - o que completar
   - o que ainda nao deve ser enviado
4. O fluxo atualizado fica documentado em `README.md` ou guia equivalente, com o workspace por lead como indice principal.
5. Se houver alteracao de runtime, `npm run typecheck` continua passando.
6. Se faltar dependencia ou houver lacuna de contrato, o resultado aponta o bloqueio exato em vez de improvisar conteudo.

## Out Of Scope

- envio automatico da proposta
- traducoes finais
- CRM, follow-up ou automacao pos-envio

## Validation

- `npm run typecheck`
- inspecionar o proposal bootstrap em `reports/`
- confirmar por leitura que ele deriva do workspace operacional anterior
- confirmar que o arquivo referencia explicitamente o `resultFile` do stage anterior
