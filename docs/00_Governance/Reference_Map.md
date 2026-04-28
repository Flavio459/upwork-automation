# Mapa de Referências

> [!IMPORTANT]
> Este é o mapa canônico de leitura e navegação do vault.
> Se houver conflito entre arquivos, siga este documento e atualize o mapa antes de criar nova referência paralela.

## Objetivo

Explicitar onde estão os documentos de referência, o que é canônico, o que é compatibilidade histórica e qual é a ordem correta de uso no Obsidian.

## Padrão De Desenvolvimento

O projeto adota um padrão docs-first inspirado na disciplina Anthropic:

- referências explícitas, não implícitas
- uma função por documento canônico
- progressive disclosure: começar pela visão geral e descer para o detalhe só quando necessário
- nenhuma camada operacional depende de memória informal
- legado existe apenas como contexto, nunca como fonte de verdade

Referências a outros projetos, como `AmazonFlow` e `Justiça Ágil`, podem aparecer como benchmark, estilo ou contexto histórico. Elas não entram no escopo ativo deste vault, salvo indicação explícita.

## Ordem De Leitura

1. [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]]
2. [[docs/00_Governance/Constitution|Constituição Global]]
3. [[docs/Home|Home]]
4. [[docs/02_Guides/Development_Handoff_Log|Development Handoff Log]]
5. [[docs/02_Guides/Roadmap|Roadmap Operacional]]
6. [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]]
7. [[research/README|Research Canonical Flow]]
7.5 [[docs/00_Governance/Eligibility_Filter|Filtro de Elegibilidade]] (Entry Gate)
8. [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]] (Tese de Oferta)
9. [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
10. [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]
11. [[docs/03_Templates/Proposal_and_Localization_Pack|Proposal and Localization Pack]]

## Fontes De Verdade

Estes são os documentos canônicos do projeto:

- [[docs/00_Governance/Reference_Map|Mapa de Referências]]
- [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]]
- [[docs/00_Governance/Constitution|Constituição Global]]
- [[docs/00_Governance/Eligibility_Filter|Filtro de Elegibilidade]]
- [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]]
- [[docs/00_Governance/Obsidian_Skill_Registry|Obsidian Skill Registry]]
- [[docs/Home|Home]]
- [[docs/02_Guides/Development_Handoff_Log|Development Handoff Log]]
- [[docs/02_Guides/Mission_Compass|Mission Compass]]
- [[docs/02_Guides/Roadmap|Roadmap Operacional]]
- [[docs/02_Guides/Antigravity_Delegation_and_Review|Antigravity Delegation and Review]]
- [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]]
- [[research/README|Research Canonical Flow]]
- [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
- [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]
- `docs/03_Templates/`

## Fluxo Operacional

Use a sequência abaixo para operar qualquer oportunidade:

1. Research
2. **Eligibility Filtering** (O Gate Principal)
3. Research handoff
3. Operator workspace bootstrap
4. Qualification
5. Feasibility
6. Pricing
7. Proposal bootstrap
8. Localization
9. Follow-up
10. Kickoff
11. Production workspace bootstrap
12. Delivery
13. QA
14. Handoff
15. Hypercare
16. Expansion

## Controle Operacional

Se a duvida for "o que esta acontecendo agora", a ordem certa de leitura nao e o chat. E esta:

1. `reports/antigravity/status.md`
2. `reports/runtime-handoff.json`
3. `automation/antigravity-queue.json`
4. `automation/antigravity-goal.json`
5. `reports/antigravity/orchestrator.log`

Papeis:

- `status.md`: painel rapido para gestor
- `runtime-handoff.json`: espelho estruturado do estado de continuidade entre motores
- `status.json`: consumo estruturado
- `antigravity-queue.json`: fonte de verdade da fila e dos retries
- `antigravity-goal.json`: condicao explicita de parada
- `orchestrator.log`: trilha operacional curta

## Camadas Do Vault

### Camada 1: Navegação E Governança

- `docs/00_Governance/Chat_Bootstrap.md`
- `docs/00_Governance/Reference_Map.md`
- `docs/00_Governance/Constitution.md`
- `docs/00_Governance/Eligibility_Filter.md`
- `docs/00_Governance/Obsidian_Skill_Registry.md`
- `docs/Home.md`
- `docs/02_Guides/Development_Handoff_Log.md`

### Camada 2: Operação

- `docs/02_Guides/Mission_Compass.md`
- `docs/02_Guides/Roadmap.md`
- `docs/02_Guides/Antigravity_Delegation_and_Review.md`
- `docs/02_Guides/Delivery_Methodology.md`
- `docs/02_Guides/Setup_Guide.md`
- `docs/02_Guides/Antigravity_Execution_Playbook.md`

### Camada 2B: Controle Da Automacao

- `automation/antigravity-queue.json`
- `automation/antigravity-goal.json`
- `reports/antigravity/status.md`
- `reports/antigravity/status.json`
- `reports/runtime-handoff.json`
- `reports/antigravity/orchestrator.log`

### Camada 3: Pesquisa E Tese

- `research/README.md`
- `research/official-signals.json`
- `docs/05_Ideation/AI_Systems_Audit_Sprint.md`
- `docs/05_Ideation/AI_Qualification_Framework.md`
- `docs/05_Ideation/Idea_Space.md` como brainstorming e contexto histórico

### Camada 4: Planejamento Em Andamento

- `docs/plans/` como planos de execução ativos, sujeitos a revisão
- cada plano do Antigravity deve apontar para um `resultFile` previsivel em `reports/antigravity/`

### Camada 5: Templates

#### Operacionais

- `docs/03_Templates/Opportunity_Intake_and_Fit.md`
- `docs/03_Templates/Feasibility_and_Capability_Assessment.md`
- `docs/03_Templates/Costing_Pricing_and_Timeline.md`
- `docs/03_Templates/Proposal_and_Localization_Pack.md`
- `docs/03_Templates/Production_Workspace_Bootstrap.md`
- `docs/03_Templates/Proposal_Follow_Up_Tracker.md`
- `docs/03_Templates/Kickoff_Action_Plan_and_Risk_Register.md`
- `docs/03_Templates/Client_Request_and_Change_Order_Log.md`
- `docs/03_Templates/Delivery_Control_and_PR_Log.md`
- `docs/03_Templates/QA_Acceptance_and_Handoff.md`
- `docs/03_Templates/Post_Sale_Expansion_Playbook.md`

#### Suporte

- `docs/03_Templates/AI_Systems_Audit_Sprint_Proposal_Template.md`
- `docs/03_Templates/AI_Systems_Audit_Sprint_Upwork_Pack.md`
- `docs/03_Templates/Translation_Style_Glossary.md`
- `docs/03_Templates/Localization_Review_Checklist.md`

#### Legado

- `docs/03_Templates/Proposal_Template.md`

### Camada 6: Arquivo E Contexto Histórico

- `docs/01_Architecture/`
- `docs/04_Archive/`
- `legacy/` como arquivo técnico frio de código e fluxos antigos
- `docs/06_Research/Index.md` como ponte de compatibilidade

## Regra De Uso No Obsidian

- abra o vault na raiz `W:\flavi\Aplicativos\Automação UPWORK`
- comece por [[docs/Home|Home]]
- siga os links canônicos antes de abrir arquivos antigos
- não crie um segundo guia principal se este mapa já resolve a dúvida
- se um documento novo virar referência, adicione-o aqui

## Regra Final

Se um arquivo não estiver citado aqui, ele não deve ser tratado como fonte de verdade sem uma decisão explícita.
