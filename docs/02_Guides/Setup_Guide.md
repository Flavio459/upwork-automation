# Setup Guide - Upwork Solo OS

> [!IMPORTANT]
> Este guia existe apenas para orientar a entrada no cofre e no fluxo atual. Ele nao define a operacao principal.
> As fontes de verdade sao [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]], [[docs/00_Governance/Reference_Map|Mapa de Referências]], [[docs/02_Guides/Roadmap|Roadmap]] e [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]].

## Objetivo

Colocar um novo operador ou agente no caminho certo sem misturar setup historico com o sistema operacional atual.

## O que este projeto e

- um sistema operacional solo para Upwork
- uma oferta principal baseada em `AI Systems Audit Sprint`
- uma operacao interna em `pt-BR`
- uma superficie externa localizada por cliente
- um cofre Obsidian orientado a documentos, templates e checklists

## O que este projeto nao e

- um manual de implementacao tecnica antiga
- um pacote de automacao de pipeline ja pronta
- um CRM completo
- uma aplicacao com estado de execucao em tempo real

## Como comecar

1. Abra [[docs/Home|Home]].
2. Leia [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]].
3. Leia [[docs/00_Governance/Reference_Map|Mapa de Referências]].
4. Leia [[docs/02_Guides/Roadmap|Roadmap Operacional]].
5. Leia [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]].
6. Se for trabalhar uma oportunidade, siga [[research/README|Research Canonical Flow]].
7. Use os templates em [[docs/03_Templates/Opportunity_Intake_and_Fit|Templates operacionais]] para qualificar, estimar, propor, localizar e entregar.

## Ordem Canonica de Uso

### 1. Pesquisa

- usar o fluxo de research para achar oportunidades
- separar oportunidade boa de ruído
- nao escrever proposta antes do fit estar claro

### 2. Qualificacao

- aplicar `AI_Qualification_Framework.md`
- decidir `Accept`, `Watch` ou `Reject`
- registrar `Fit Lane`

### 3. Viabilidade e Preco

- validar capacidade tecnica e operacional
- definir `Feasibility`
- calcular `target_price`, `price_floor` e margem

### 4. Proposta e Localizacao

- gerar o artefato mestre em `pt-BR`
- localizar para a lingua do cliente
- passar o gate em `Localization_Review_Checklist.md`

### 5. Kickoff, Delivery e Handoff

- usar os trackers e playbooks da fase de delivery
- registrar mudancas, riscos e aceite
- manter hypercare por `7 dias` salvo excecao documentada

### 6. Pos-venda e Expansao

- capturar `case`, `testimonial`, `upsell` ou `referral`
- registrar a proxima oportunidade de contrato

## Fonte De Verdade

Use estes arquivos como referencia principal:

- [[docs/Home|Home]]
- [[docs/00_Governance/Chat_Bootstrap|Chat Bootstrap]]
- [[docs/00_Governance/Reference_Map|Mapa de Referências]]
- [[docs/02_Guides/Roadmap|Roadmap Operacional]]
- [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]]
- [[research/README|Research Canonical Flow]]
- [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]]
- [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
- [[docs/03_Templates/Translation_Style_Glossary|Translation Style Glossary]]
- [[docs/03_Templates/Localization_Review_Checklist|Localization Review Checklist]]

## Artefatos De Trabalho

Os arquivos abaixo sao os blocos operacionais do sistema:

- [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]
- [[docs/03_Templates/Feasibility_and_Capability_Assessment|Feasibility and Capability Assessment]]
- [[docs/03_Templates/Costing_Pricing_and_Timeline|Costing, Pricing and Timeline]]
- [[docs/03_Templates/Proposal_and_Localization_Pack|Proposal and Localization Pack]]
- [[docs/03_Templates/Proposal_Follow_Up_Tracker|Proposal Follow-Up Tracker]]
- [[docs/03_Templates/Kickoff_Action_Plan_and_Risk_Register|Kickoff Action Plan and Risk Register]]
- [[docs/03_Templates/Client_Request_and_Change_Order_Log|Client Request and Change Order Log]]
- [[docs/03_Templates/Delivery_Control_and_PR_Log|Delivery Control and PR Log]]
- [[docs/03_Templates/QA_Acceptance_and_Handoff|QA Acceptance and Handoff]]
- [[docs/03_Templates/Post_Sale_Expansion_Playbook|Post Sale Expansion Playbook]]

## Configuracao Do Vault

Se voce estiver abrindo este repositório no Obsidian:

- abra a raiz em `W:\flavi\Aplicativos\Automação UPWORK`
- mantenha `.obsidian/` versionado
- use `docs/Home.md` como tela inicial
- prefira links relativos curtos e nomes canônicos
- nao use `docs/.obsidian/`; o vault suportado fica apenas na raiz

## Material Legado

Material antigo de implementacao ainda pode existir por compatibilidade e contexto historico.

Nao use estes arquivos como verdade atual:

- `docs/04_Archive/upwork-code.js`
- `legacy/`
- trechos tecnicos antigos que falavam de browser agent, scoring engine ou schema de app
- docs arquivados marcados como historicos

Se precisar de contexto historico, leia o arquivo legado. Se precisar operar, siga o [[docs/02_Guides/Roadmap|Roadmap]].

## Regra Final

Se houver conflito entre este guia e o sistema operacional atual, o sistema operacional vence.
