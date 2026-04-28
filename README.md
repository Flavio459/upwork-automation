# Upwork Solo OS

Repositório do sistema operacional solo para Upwork, com pesquisa assistida por navegador, seleção de oferta, qualificação, proposta localizada, produção do serviço/produto vendido e handoff operacional documentado.

Pitch de 10 segundos:

Um sistema operacional que encontra oportunidades no Upwork, fecha com criterio e produz o serviço/produto vendido dentro de um fluxo guiado, com controle de entrega e menos improviso.

O projeto combina duas camadas:

- `research/` e os scripts de navegador para ler oportunidades reais do Upwork
- `docs/00_Governance/`, `docs/02_Guides/`, `docs/03_Templates/` e `docs/05_Ideation/` como fontes canônicas do fluxo comercial, templates, checklist e delivery
- `docs/01_Architecture/` e `docs/04_Archive/` como contexto histórico e referência

## Estado Atual

- operação interna em `pt-BR`
- artefatos externos localizados por cliente
- tese principal: `AI Systems Audit Sprint`
- fluxo comercial documentado de ponta a ponta
- pesquisa já separada do fluxo de proposta e delivery

## Entrada Recomendada

1. Leia [docs/00_Governance/Chat_Bootstrap.md](docs/00_Governance/Chat_Bootstrap.md)
2. Leia [docs/00_Governance/Reference_Map.md](docs/00_Governance/Reference_Map.md)
3. Leia [docs/05_Ideation/AI_Systems_Audit_Sprint.md](docs/05_Ideation/AI_Systems_Audit_Sprint.md)
4. **Leia [docs/00_Governance/Eligibility_Filter.md](docs/00_Governance/Eligibility_Filter.md)** (Portão de Entrada)
5. Leia [docs/02_Guides/Development_Handoff_Log.md](docs/02_Guides/Development_Handoff_Log.md)
6. Abra [docs/Home.md](docs/Home.md)
7. Use [research/README.md](research/README.md) para selecionar oportunidades
8. Use os templates em [docs/03_Templates](docs/03_Templates) para operar o ciclo

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run delegate:antigravity` | Abre uma tarefa estruturada no Antigravity |
| `npm run antigravity:run-next` | Dispara a proxima tarefa elegivel em modo explicito `um task por vez` |
| `npm run antigravity:review` | Revisa a tarefa `running`, valida o `resultFile` e desbloqueia dependencias |
| `npm run antigravity:status` | Gera o painel gerencial autoritativo da fila atual |
| `npm run antigravity:shadow:enqueue` | Registra a proxima tarefa elegivel no shadow mode `BullMQ + Redis + SQLite` |
| `npm run antigravity:shadow:status` | Gera o snapshot candidato de status em `reports/antigravity/status.shadow.*` |
| `npm run handoff:refresh` | Regenera o dossie humano e o espelho estruturado de handoff entre motores |
| `npm run antigravity:orchestrate` | Legado/deprecated. Nao e mais o caminho oficial |
| `npm run antigravity:register` | Legado/deprecated. Nao reative scheduler recorrente |
| `npm run antigravity:unregister` | Remove a task legada do Agendador do Windows |
| `npm run login` | Abre o fluxo de login manual persistente no Chrome |
| `npm run research` | Executa o fluxo de research com o browser persistente e escreve o handoff operacional em `reports/` |
| `npm run research:headless` | Executa o research em modo headless quando necessário |
| `npm run typecheck` | Valida o TypeScript |

## Fluxo Operacional

Controle de execucao:

1. `OpenClaw/Codex` controla a fila local e decide quando iniciar ou revisar uma tarefa
2. `Antigravity` atua como executor lateral de uma tarefa por vez
3. o caminho oficial e `run-next -> esperar resultFile -> review -> next`

1. Rodar `research` e coletar oportunidades visíveis no feed autenticado
2. Escolher a melhor oportunidade por fit, margem e executabilidade
2.5 **Filtrar elegibilidade com [Eligibility_Filter.md](docs/00_Governance/Eligibility_Filter.md)** (Gate Binário US$ 400+)
3. Qualificar com [AI_Qualification_Framework.md](docs/05_Ideation/AI_Qualification_Framework.md)
4. Validar viabilidade com [Feasibility_and_Capability_Assessment.md](docs/03_Templates/Feasibility_and_Capability_Assessment.md)
5. Estimar preço e cronograma com [Costing_Pricing_and_Timeline.md](docs/03_Templates/Costing_Pricing_and_Timeline.md)
6. Gerar proposta em `pt-BR`
7. Localizar para a língua do cliente com o gate de revisão
8. Provisionar o workspace de produção e executar kickoff, delivery, QA, handoff e hypercare
9. Capturar `case`, `testimonial`, `upsell` ou `referral`

## Documentação Canônica

- [Chat Bootstrap](docs/00_Governance/Chat_Bootstrap.md)
- [Home do Vault](docs/Home.md)
- [Mapa de Referências](docs/00_Governance/Reference_Map.md)
- [Filtro de Elegibilidade](docs/00_Governance/Eligibility_Filter.md)
- [Roadmap Operacional](docs/02_Guides/Roadmap.md)
- [Development Handoff Log](docs/02_Guides/Development_Handoff_Log.md)
- [Mission Compass](docs/02_Guides/Mission_Compass.md)
- [Application Finalization Plan](docs/02_Guides/Application_Finalization_Plan.md)
- [Delivery Methodology](docs/02_Guides/Delivery_Methodology.md)
- [Antigravity Delegation and Review](docs/02_Guides/Antigravity_Delegation_and_Review.md)
- [Setup Guide](docs/02_Guides/Setup_Guide.md)
- [Research Canonical Flow](research/README.md)
- [AI Systems Audit Sprint](docs/05_Ideation/AI_Systems_Audit_Sprint.md)
- [AI Qualification Framework](docs/05_Ideation/AI_Qualification_Framework.md)

## Artefatos Operacionais

- [Opportunity Intake and Fit](docs/03_Templates/Opportunity_Intake_and_Fit.md)
- [Feasibility and Capability Assessment](docs/03_Templates/Feasibility_and_Capability_Assessment.md)
- [Costing, Pricing and Timeline](docs/03_Templates/Costing_Pricing_and_Timeline.md)
- [Proposal and Localization Pack](docs/03_Templates/Proposal_and_Localization_Pack.md)
- [Production Workspace Bootstrap](docs/03_Templates/Production_Workspace_Bootstrap.md)
- [Localization Review Checklist](docs/03_Templates/Localization_Review_Checklist.md)
- [Proposal Follow-Up Tracker](docs/03_Templates/Proposal_Follow_Up_Tracker.md)
- [Kickoff Action Plan and Risk Register](docs/03_Templates/Kickoff_Action_Plan_and_Risk_Register.md)
- [Delivery Control and PR Log](docs/03_Templates/Delivery_Control_and_PR_Log.md)
- [QA Acceptance and Handoff](docs/03_Templates/QA_Acceptance_and_Handoff.md)
- [Post Sale Expansion Playbook](docs/03_Templates/Post_Sale_Expansion_Playbook.md)

## Arquivos e Saídas

- sessão persistente do browser: `.upwork-session` local e ignorada
- relatórios e métricas de execução: `reports/` local e ignorado
- base de research: `upwork_research.db` local e ignorada
- exemplar histórico de métricas: `docs/04_Archive/Browser_Run_Metrics_Example.json`
- código e fluxos arquivados: `legacy/`
- fila local controlada por OpenClaw/Codex: `automation/antigravity-queue.json`
- condicao de parada da missao Antigravity: `automation/antigravity-goal.json`
- dossie e estado estruturado de continuidade: `docs/02_Guides/Development_Handoff_Log.md` e `reports/runtime-handoff.json`
- shadow mode BullMQ/Redis/SQLite: `reports/antigravity/antigravity-shadow.sqlite` e `reports/antigravity/status.shadow.*`
- workspace operacional por oportunidade: `reports/operator-workspaces/<lead_id>/README.md`
- proposal bootstrap starter pack: `reports/proposal-bootstrap/<lead_id>/README.md`

## Requisitos

- Node.js
- Redis local ou VPS acessivel via `ANTIGRAVITY_REDIS_HOST` e `ANTIGRAVITY_REDIS_PORT`
- Google Chrome
- `.env` configurado para o fluxo local

## Regra de Operação

Não enviar proposta sem:

- qualificação concluída
- viabilidade validada
- preço calculado
- revisão de localização aprovada
- revisão humana final
