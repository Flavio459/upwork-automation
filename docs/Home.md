# Upwork Automation - Dashboard

Este vault agora funciona como cockpit operacional do projeto.

> [!IMPORTANT]
> O projeto já está documentado o suficiente para operar.
> O gargalo atual não é documentação. É validação operacional em lead real.
> O sistema agora opera com dois motores: um comercial-operacional e um de producao.

## Entrada Rápida

Se você abrir o cofre para trabalhar agora, entre por aqui:

1. [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]]
2. [[docs/00_Governance/Reference_Map|Reference Map]]
3. [[docs/02_Guides/Development_Handoff_Log|Development Handoff Log]]
4. [[docs/02_Guides/Mission_Compass|Mission Compass]]
5. [[docs/02_Guides/Roadmap|Roadmap Operacional]]
6. [[research/README|Research Canonical Flow]]
7. [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
8. [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]
9. [[docs/03_Templates/Proposal_and_Localization_Pack|Proposal and Localization Pack]]

## Estado Atual

- `tese ativa`: [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]]
- `modo operacional`: sistema solo com operação interna em `pt-BR`
- `camada externa`: proposta e comunicação localizadas por cliente
- `workspace operacional por oportunidade`: ativo em `reports/operator-workspaces/<lead_id>/`
- `camada de producao`: workspace de execucao para entregar o servico/produto vendido
- `motor comercial-operacional`: pesquisa, qualificação, proposta e fechamento
- `motor de producao`: workspace, implementacao, QA e handoff
- `status real`: pronto para operar, ainda não validado em ciclo completo real

## Fluxo Canônico

1. `research`
2. `qualification`
3. `feasibility`
4. `pricing`
5. `proposal`
6. `localization`
7. `follow-up`
8. `kickoff`
9. `delivery`
10. `QA`
11. `handoff`
12. `hypercare`
13. `expansion`

Referência principal:

- [[docs/02_Guides/Delivery_Methodology|Professional Delivery Methodology]]

## Próxima Execução

O próximo ciclo real deve seguir esta sequência:

1. rodar a pesquisa e escolher uma oportunidade com chance de `Accept`
2. preencher intake, viabilidade e pricing
3. gerar proposta mestre em `pt-BR`
4. localizar para a língua do cliente
5. provisionar o workspace de producao do servico/produto vendido
6. enviar e registrar follow-up

Referências:

- [[research/README|Research Canonical Flow]]
- [[docs/05_Ideation/AI_Qualification_Framework|Qualification]]
- [[docs/03_Templates/Opportunity_Intake_and_Fit|Intake]]
- [[docs/03_Templates/Feasibility_and_Capability_Assessment|Feasibility]]
- [[docs/03_Templates/Costing_Pricing_and_Timeline|Costing, Pricing and Timeline]]
- [[docs/03_Templates/Proposal_and_Localization_Pack|Proposal and Localization Pack]]
- [[docs/03_Templates/Production_Workspace_Bootstrap|Production Workspace Bootstrap]]
- [[docs/03_Templates/Localization_Review_Checklist|Localization Review Checklist]]

## Guias e Operação

- [[docs/02_Guides/Roadmap|Operational Roadmap]]
- [[docs/02_Guides/Development_Handoff_Log|Development Handoff Log]]
- [[docs/02_Guides/Mission_Compass|Mission Compass]]
- [[docs/02_Guides/Delivery_Methodology|Professional Delivery Methodology]]
- [[docs/02_Guides/Setup_Guide|Setup Guide]]

> [!NOTE]
> O `Setup_Guide` agora e um guia de arranque e orientacao. Use o [[docs/02_Guides/Roadmap|Roadmap]] e o [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]] como fonte de verdade operacional.

## Casos e Modelos

- [[docs/03_Templates/AI_Systems_Audit_Sprint_Proposal_Template|AI Systems Audit Sprint Proposal Template]]
- [[docs/03_Templates/AI_Systems_Audit_Sprint_Upwork_Pack|AI Systems Audit Sprint Upwork Pack]]
- [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]
- [[docs/03_Templates/Proposal_and_Localization_Pack|Proposal and Localization Pack]]
- [[docs/03_Templates/Translation_Style_Glossary|Translation Style Glossary]]
- [[docs/03_Templates/Localization_Review_Checklist|Localization Review Checklist]]
- [[docs/03_Templates/Proposal_Follow_Up_Tracker|Proposal Follow-Up Tracker]]
- [[docs/03_Templates/Kickoff_Action_Plan_and_Risk_Register|Kickoff, Action Plan and Risk Register]]
- [[docs/03_Templates/Delivery_Control_and_PR_Log|Delivery Control and PR Log]]
- [[docs/03_Templates/QA_Acceptance_and_Handoff|QA, Acceptance and Handoff]]
- [[docs/03_Templates/Post_Sale_Expansion_Playbook|Post-Sale Expansion Playbook]]

## Ideação e Tese

- [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]]
- [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
- [[docs/05_Ideation/Idea_Space|Idea Space]]

## Research

- [[research/README|Research Canonical Flow]]
- [[docs/06_Research/Index|Research Index]]

## Arquitetura e Referência

- [[docs/00_Governance/Reference_Map|Mapa de Referências]]
- [[docs/00_Governance/Constitution|Constituição Global]]
- `reports/runtime-handoff.json` como espelho estruturado do estado atual para consumo por motores e validação
- [[docs/01_Architecture/Technical_Paper|Technical Paper]]
- [[docs/01_Architecture/User_Guide|User Guide]]
- ![[docs/01_Architecture/Flowchart.png|Fluxograma]]

## Arquivo Técnico

- [[docs/04_Archive/Worked_Example_Cinematic_Adjacency|Worked Example - Cinematic Adjacency]]
- [[docs/04_Archive/Case_Cinematic_Interactive_Experience|Reference Case - Cinematic Interactive Experience]]
- [[docs/04_Archive/Summary_Archive|Summary Archive]]
- [[docs/04_Archive/upwork-code.js|Código Legado (JS)]]

## Ferramentas do Repositório

- `browser automation`: Playwright com perfil persistente
- `research output`: shortlist em markdown, JSON e SQLite como runtime local
- `database`: `upwork_research.db` local e ignorado
- `headless`: usar apenas quando realmente necessário
- `legacy/`: arquivo técnico frio, fora da superfície operacional

## Regra de Ouro

Nenhuma proposta deve ser enviada sem revisão humana.
