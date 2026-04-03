# Antigravity Delegation and Review

Este guia define como delegar trabalho ao Antigravity sem aumentar significativamente o custo de revisao.

## Objetivo

O principio e simples:

- delegar com escopo estreito
- exigir resposta estruturada
- revisar apenas o delta

## Dois Motores

As tarefas do Antigravity devem ser agrupadas em dois tipos de trabalho:

- motor comercial-operacional: research, qualificacao, proposta, fechamento e organizacao do workspace operacional.
- motor de producao: workspace de producao, implementacao, QA, handoff e evidencias de entrega.

Essa divisao evita misturar tarefa de venda com tarefa de entrega.

## Regra de Delegacao

Toda tarefa enviada ao Antigravity deve:

- ter objetivo unico e verificavel
- listar arquivos relevantes
- definir o que esta fora de escopo
- definir criterios objetivos de aceite
- definir comandos de validacao

Antes de paralelizar trabalho de documentacao com trabalho de producao, tambem deve:

- congelar o contrato do artefato de saida
- apontar a fonte de verdade do contrato, template ou schema
- registrar um checkpoint curto de revisao antes do proximo salto estrutural

## Regra de Resposta

Toda resposta final do Antigravity deve conter:

1. `Summary`
2. `Files Changed`
3. `Validation Run`
4. `Key Diffs`
5. `Residual Risks`
6. `Preserved By Contract`

Sem isso, a revisao fica mais cara do que deveria.

## Regra de Revisao

Ao revisar uma delegacao:

1. Ler apenas o resumo e os arquivos alterados.
2. Rodar `git diff -- <arquivos>` ou `git diff --stat` para ver o delta.
3. Rodar `rg` apenas nos padroes que a tarefa pretendia alterar.
4. Rodar validacao objetiva, como `npm run typecheck`, apenas se o escopo tocar runtime.
5. Ler trechos pontuais, nao arquivos inteiros, exceto se o diff fugir do escopo.

## Quando Aprofundar

Ler mais do que o delta apenas se houver:

- arquivo alterado fora do escopo
- validacao ausente
- diff maior do que o esperado
- mudanca estrutural nao pedida
- sinais de regressao ou ambiguidade

## Wrapper

Use o wrapper local para abrir a sessao com contrato de auditoria anexado automaticamente:

```powershell
powershell -ExecutionPolicy Bypass -Command "& { ./scripts/delegate-antigravity.ps1 -TaskFile 'docs/plans/minha-tarefa.md' -AddFile 'README.md','scripts/research.ts' -ReuseWindow }"
```

Se for realmente necessario remover o contrato de auditoria:

```powershell
powershell -ExecutionPolicy Bypass -Command "& { ./scripts/delegate-antigravity.ps1 -TaskFile 'docs/plans/minha-tarefa.md' -AddFile 'README.md' -ReuseWindow -SkipAuditContract }"
```

## Queue and Explicit Control

O modo oficial agora e `one-at-a-time`.

Fonte de verdade:

- `automation/antigravity-queue.json` continua como espelho operacional durante o rollout
- `BullMQ + Redis + SQLite` agora formam a fonte candidata em `shadow mode`
- `automation/antigravity-goal.json` continua sendo a condicao explicita de parada
- `scripts/antigravity-run-next.ps1` inicia a proxima tarefa elegivel
- `scripts/antigravity-review-task.ps1` revisa o `resultFile` e libera dependencias
- `scripts/antigravity-status.ps1` gera um snapshot gerencial em `reports/antigravity/status.json` e `status.md`
- `scripts/antigravity-shadow.ts` registra fila, aceite, review e `status.shadow.*`
- `scripts/delegate-antigravity.ps1` continua como wrapper de baixo nivel e rejeita arquivos fora do workspace ou com padroes obvios de segredo/chave privada
- `scripts/antigravity-orchestrator.ps1` e `scripts/register-antigravity-orchestrator-task.ps1` ficam apenas como legado/deprecated

Estados esperados por tarefa:

- `blocked`
- `pending`
- `queued` no shadow mode
- `accepted` no shadow mode
- `running`
- `review_pending` no shadow mode
- `completed`
- `needs_attention`

Campos principais por tarefa:

- `taskFile`
- `resultFile`
- `contextFiles`
- `validationCommands`
- `status`
- `startedAt`
- `launchPid`
- `launchProfile`
- `dispatchPromptFile`
- `resultObservedAt`
- `reviewedAt`
- `queueJobId` no shadow mode
- `dependsOn` quando houver dependencia entre tarefas

Fluxo oficial:

1. `OpenClaw/Codex` roda `antigravity:run-next`
2. o shadow mode registra `queued`
3. o wrapper local devolve `accepted=true` com `launchPid`, `acceptedAt`, `launchProfile` e `dispatchPromptFile`
4. a tarefa entra em `running`
5. o painel mostra `pid`, `profile`, `age` e o `resultFile` esperado
6. quando o `resultFile` aparecer, `OpenClaw/Codex` roda `antigravity:review`
7. a revisao valida contrato de resposta e comandos de validacao
8. a tarefa vira `completed` ou `needs_attention`
9. so entao a proxima tarefa pode ser iniciada

Controle operacional minimo:

- `npm run antigravity:status` deve mostrar o estado atual da fila sem depender de chat
- `reports/antigravity/status.md` deve ser o painel rapido para saber se o sistema esta `idle`, `running` ou `needs_attention`
- `reports/antigravity/status.shadow.md` deve mostrar a fonte candidata `BullMQ + Redis + SQLite`
- o painel deve mostrar, por tarefa, `status`, `owner`, `age` e `nextAction`
- o painel deve mostrar, para a tarefa atual, `launchPid`, `profile` e `expectedResultPath`

## Politica De Recuperacao

Nao existe mais retry automatico em background.

Regra pratica:

- se a tarefa estiver `running` e ainda nao houver `resultFile`, ela continua aguardando revisao explicita
- se o `resultFile` existir mas o contrato estiver incompleto, a tarefa vira `needs_attention`
- se a validacao falhar, a tarefa vira `needs_attention`
- se a execucao antiga tiver deixado estado ambiguo, a tarefa deve voltar para `pending` por decisao explicita, nunca por retry silencioso

Objetivo:

- evitar silencio operacional
- reduzir dependencia de heuristica
- deixar a intervencao humana concentrada no ponto certo: `run-next` ou `review`

A execucao explicita continua disponivel ate `automation/antigravity-goal.json` marcar:

- `modelTested: true`

Quando isso acontecer, nenhuma nova tarefa deve ser iniciada.

Tambem para quando:

- `automation/antigravity-goal.json` tiver `stopRequested: true`

## Regra De Missao

A fila nao deve ser usada como deposito de tarefas desconexas.

Ela deve representar uma sequencia evolutiva que leve a:

1. fechamento do fluxo principal
2. evidencia end-to-end
3. decisao objetiva sobre `modelTested`

Quando houver tarefa de producao, ela deve consumir o briefing do motor comercial-operacional e produzir um artefato previsivel em `reports/` antes de qualquer smoke run.

## Roteamento De Perfil

Os perfis na fila sao rotulos de roteamento operacional, nao identificadores fixos de modelo.

- `implementation-strong` aponta para tarefas que geram ou estruturam artefatos
- `review-fast` aponta para auditoria, gate e validacao
- se o perfil nao estiver definido, o wrapper usa o perfil padrao do Antigravity
- se quiser comparar modelos reais, registre a configuracao local do perfil separadamente

## Paralelismo Controlado

O modo oficial atual nao paraleliza tarefas do Antigravity.

Regra pratica:

- manter apenas `1` tarefa `running`
- revisar o artefato antes de liberar a proxima
- usar `OpenClaw/Codex` como plano de controle entre uma execucao e outra

Para tarefas de desenvolvimento, a orientacao de perfil fica no briefing da tarefa e no wrapper do Antigravity.
