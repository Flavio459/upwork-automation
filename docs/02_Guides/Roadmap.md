# Roadmap Operacional

Este roadmap traduz o estado atual do projeto em uma sequência objetiva de implantação.

## Avaliação de Completude

### Completo na V1

- tese comercial definida em `AI Systems Audit Sprint`
- sistema operacional solo documentado
- camada multilíngue formalizada
- templates operacionais criados
- exemplo preenchido `Adjacency` criado
- handoff entre research, qualificação, proposta e delivery documentado

### Incompleto ou Pendente

- validação do fluxo completo em lead real
- primeiro ciclo completo: proposta, fechamento, kickoff, delivery e pós-venda
- exemplo preenchido de `Core Offer`
- exemplo preenchido de `Reject`

## Leitura Atual

O sistema documental está suficientemente completo para operar.
O projeto ainda não está completamente validado em produção.

Em termos práticos:

- `documentação base`: pronta
- `operação assistida`: pronta para uso
- `workspace operacional por oportunidade`: pronto, com indice e stage docs em `reports/operator-workspaces/<lead_id>/`
- `idioma interno de desenvolvimento`: `pt-BR`
- `idioma do cliente`: resolvido apenas quando a proposta for preparada para envio externo
- `validação comercial`: pendente
- `validação de delivery`: pendente
- `producao do servico/produto vendido`: ainda precisa de prova end-to-end
- `dois motores`: comercial-operacional e producao
- `controle operacional do loop`: ativo, com painel e politica de recuperacao

No estado atual, o projeto ja nao depende de memoria informal para saber se a automacao esta viva.
O ponto de controle minimo ficou assim:

- fila canonica em `automation/antigravity-queue.json`
- objetivo de parada em `automation/antigravity-goal.json`
- snapshot gerencial em `reports/antigravity/status.md`
- status estruturado em `reports/antigravity/status.json`
- regra de operacao em `docs/02_Guides/Antigravity_Delegation_and_Review.md`

Leitura operacional objetiva:

- a infraestrutura recorrente esta funcional
- o painel ja distingue `completed`, `dispatched`, `blocked` e `needs_attention`
- o gargalo atual deixou de ser observabilidade
- o gargalo atual e obter prova de entrega nas tarefas verticais em andamento

Para a transicao de sistema documental para aplicacao validada, use tambem:

- [Mission Compass](Mission_Compass.md)
- [Application Finalization Plan](Application_Finalization_Plan.md)
- [Antigravity Delegation and Review](Antigravity_Delegation_and_Review.md)

## Fases do Roadmap

### Fase 0 - Fechamento Documental

Status: `quase concluida`

Objetivo:

- remover ambiguidades restantes
- consolidar um ponto único de navegação
- registrar pendências reais

Itens:

- [x] consolidar o sistema operacional
- [x] formalizar localização multilíngue
- [x] criar worked example `Adjacency`
- [x] limpar a maior parte da nomenclatura antiga
- [x] reescrever `Setup_Guide.md`
- [x] consolidar painel de status e politica de recuperacao do Antigravity

Critério de saída:

- não existir doc ativo concorrendo com o fluxo principal
- existir um unico ponto de controle para saber o estado da automacao sem depender de chat

### Fase 1 - Operação Comercial Real

Status: `em andamento`

Objetivo:

- usar o sistema com uma oportunidade real

Itens:

- [x] rodar `research`
- [x] gerar handoff estruturado de research
- [x] fechar `operator-workspace-bootstrap`
- [x] concluir `handoff-contract-audit`
- [x] gerar `Proposal_and_Localization_Pack.md` ou bootstrap equivalente
- [ ] revisar com `Localization_Review_Checklist.md`
- [ ] enviar proposta

Critério de saída:

- primeira proposta localizada pronta para envio, derivada do fluxo novo sem reinterpretacao manual do operador
- o artefato mestre permanece em `pt-BR` ate o cliente e o idioma de envio estarem definidos

### Fase 2 - Fechamento e Kickoff

Status: `pendente`

Objetivo:

- provar que o sistema fecha contrato e entra em execução controlada

Itens:

- [ ] registrar follow-up no tracker
- [ ] fechar uma oportunidade `Won`
- [ ] preencher `Kickoff_Action_Plan_and_Risk_Register.md`
- [ ] confirmar critérios de aceite
- [ ] confirmar acessos, dependências e cadência

Critério de saída:

- primeiro kickoff formal concluído

### Fase 3 - Delivery Validado

Status: `pendente`

Objetivo:

- validar execução, QA, handoff, hypercare e o workspace de producao do servico/produto vendido

Itens:

- [ ] provisionar o workspace de producao do servico/produto vendido
- [ ] registrar progresso em `Delivery_Control_and_PR_Log.md`
- [ ] registrar mudanças em `Client_Request_and_Change_Order_Log.md`
- [ ] concluir `QA_Acceptance_and_Handoff.md`
- [ ] cumprir janela de hypercare

Critério de saída:

- primeira entrega completa com aceite e handoff

### Fase 4 - Pós-Venda e Prova Comercial

Status: `pendente`

Objetivo:

- transformar entrega em ativo comercial reutilizável

Itens:

- [ ] preencher `Post_Sale_Expansion_Playbook.md`
- [ ] capturar `testimonial`, `case`, `upsell` ou `referral`
- [ ] registrar aprendizados de pricing, escopo e objeções
- [ ] consolidar um example pack de `Core Offer`

Critério de saída:

- primeiro ciclo completo de venda, entrega e expansão documentado

### Fase 5 - Validação da Tese

Status: `pendente`

Objetivo:

- decidir se a tese sobe de hipótese forte para prática comprovada

Itens:

- [ ] repetir de `3` a `5` ciclos reais
- [ ] medir taxa de resposta
- [ ] medir taxa de fechamento
- [ ] medir margem real
- [ ] medir aderência entre escopo vendido e escopo entregue
- [ ] revisar pricing e naming se necessário

Critério de saída:

- dados reais suficientes para confirmar, ajustar ou rejeitar a tese atual

## Prioridade Imediata

1. manter a proposta mestre em `pt-BR` enquanto o cliente final nao estiver identificado
2. revisar o `Localization_Review_Checklist.md` antes de enviar qualquer proposta externa
3. registrar o primeiro `Core Offer` completo

## Regra de Decisão

Não abrir novas frentes antes de fechar o primeiro ciclo real.
O próximo gargalo do projeto não é documentação. É prova operacional de que os stages ativos entregam artefato verificavel.
