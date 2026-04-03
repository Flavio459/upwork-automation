# Application Finalization Plan

Este guia define a sequencia de entrega para sair de um sistema documental maduro e chegar a uma aplicacao validada.

Para a visao macro com checkpoints e mapa visual, veja tambem:

- [Mission Compass](Mission_Compass.md)

## Executive Read

Leitura objetiva do estado atual:

- `documentacao operacional`: madura o suficiente para orientar build e uso assistido
- `runtime de research`: existente e funcional como vertical inicial
- `camada de handoff`: implementada para research e workspace operacional; proposta e continuidade ainda dependem de automacao adicional
- `camada de proposta e continuidade`: ainda dependente de operacao manual e templates
- `modelo testado`: ainda inexistente

Conclusao:

O repositorio ja tem contexto suficiente para desenvolver com direcao.
Ele ainda nao tem evidencia suficiente para ser considerado uma aplicacao finalizada.

## Decision Authority

Responsabilidades claras:

- `OpenClaw/Codex` controla a fila, define quando iniciar ou revisar uma tarefa e decide se o modelo esta pronto para pre-producao com base em evidencia objetiva
- `usuario` tem a palavra final para parar, continuar ou marcar o modelo como testado
- `antigravity` executa uma tarefa por vez e coleta evidencia
- `BullMQ + Redis + SQLite` registram o shadow mode operacional durante a migracao

## Stop Rules

A execucao explicita para quando:

- `automation/antigravity-goal.json` tiver `modelTested: true`
- `automation/antigravity-goal.json` tiver `stopRequested: true`
- o usuario interromper manualmente a execucao

## What Counts As Success

Consideraremos a missao concluida quando existir evidencia para todos os pontos abaixo:

1. `npm run research` gera shortlist e artefato de handoff operacional dedicado.
2. O operador consegue abrir um workspace deterministico da oportunidade escolhida sem reinterpretar o fluxo manualmente.
3. O sistema gera um bootstrap real para intake, viabilidade, pricing e proposta.
4. O sistema gera um workspace de producao acionavel para implementar o servico/produto vendido.
5. Existe pelo menos um ciclo end-to-end registrado como smoke run do modelo atual.
6. O gate final confirma, por evidencia, se o modelo deve ou nao ser marcado como testado.

## Maturidade Dos Documentos

Os documentos canonicos ja sao suficientes para:

- definir a tese comercial
- orientar a selecao de oportunidades
- conduzir qualificacao, pricing, proposta e handoff
- governar a delegacao e a revisao do Antigravity

Os documentos ainda nao substituem:

- evidencia de execucao end-to-end
- automacao do fluxo pos-research
- criterio objetivo de `modelo testado` com artefatos reais

## Sequencia Evolutiva

### Stage 1 - Close The Research Handoff Gap

Objetivo:

- transformar o research em entrada real do sistema operacional

Tarefa ligada:

- `research-handoff-output`

Saida esperada:

- `reports/research-handoff.md` ou equivalente real no runtime

### Stage 2 - Create An Operator Workspace

Objetivo:

- materializar um workspace por oportunidade acionavel

Tarefa ligada:

- `operator-workspace-bootstrap`

Saida esperada:

- pasta estruturada em `reports/operator-workspaces/<lead_id>/` com README de indice e stage docs separados para intake, viabilidade e pricing
- contrato de saida registrado em `reports/antigravity/` para revisao posterior

### Stage 3 - Bootstrap Proposal Flow

Objetivo:

- reduzir o salto manual entre workspace operacional e proposta

Tarefa ligada:

- `proposal-bootstrap-pack`

Saida esperada:

- starter pack preenchido a partir da oportunidade selecionada

### Stage 4 - Bootstrap Production Workspace

Objetivo:

- transformar o escopo vendido em ambiente real de execucao da entrega

Tarefa ligada:

- `production-workspace-bootstrap`

Saida esperada:

- artefato previsivel em `reports/` com ambiente, checkpoints de implementacao, QA e handoff

### Stage 5 - Prove The Vertical End-To-End

Objetivo:

- executar e registrar um fluxo completo do modelo atual

Tarefa ligada:

- `end-to-end-smoke-run`

Saida esperada:

- evidencia reproduzivel em `reports/` de um ciclo completo do runtime atual

### Stage 6 - Close The Tested Model Gate

Objetivo:

- verificar se o modelo atual realmente ja merece encerrar o loop

Tarefa ligada:

- `tested-model-gate`

Saida esperada:

- parecer final com evidencias, residuos e decisao de marcar `modelTested: true`

## Model Routing

O Antigravity pode receber um perfil por tarefa quando isso fizer sentido.

- tarefas de codificacao devem preferir o perfil mais forte para programacao
- tarefas de analise e gate devem preferir o perfil mais rapido ou mais economico quando o escopo permitir
- se nenhum perfil estiver definido, o wrapper usa o perfil padrao do Antigravity

Os perfis sao rotulos de roteamento operacional, nao promessas de modelo fixo.
O modelo efetivo depende da configuracao local do perfil no app Antigravity.

## Papel Do Codex

O OpenClaw/Codex passa a operar como responsavel pelo desenvolvimento:

- manter a fila alinhada a finalizacao da aplicacao
- iniciar apenas `1` tarefa Antigravity por vez
- registrar `queued -> accepted -> running -> completed|needs_attention` no shadow mode
- revisar o `resultFile` antes de liberar a proxima tarefa
- revisar entregas do Antigravity por delta e evidencia
- propor a proxima tarefa quando a dependencia anterior fechar
- nao declarar `modelo testado` sem artefato e verificacao

## Regra De Priorizacao

Prioridade maxima:

- tarefas que fecham o fluxo vertical da aplicacao

Prioridade media:

- tarefas de hardening, naming residual e documentacao complementar

Prioridade baixa:

- expansoes laterais antes de existir evidencia do fluxo principal

## Regra De Paralelismo

O modo oficial atual e conservador:

- `1` tarefa Antigravity ativa por vez
- revisao explicita entre uma tarefa e a proxima
- sem scheduler recorrente no caminho critico

Paralelismo so volta a ser aceitavel quando houver evidencia de que o executor responde com aceite e entrega de forma confiavel.

Enquanto isso nao existir, documentacao, fila e revisao continuam centralizadas em `OpenClaw/Codex`.

## Shadow Mode Atual

Durante a migracao:

- `automation/antigravity-queue.json` continua como espelho operacional
- `reports/antigravity/antigravity-shadow.sqlite` guarda estado operacional candidato
- `reports/antigravity/status.shadow.json` e `status.shadow.md` mostram a projeção BullMQ/Redis/SQLite
- `Redis` passa a ser prerequisito para validar a proxima fase do rollout
