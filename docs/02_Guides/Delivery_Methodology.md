# Sistema Operacional Solo para Upwork

Este guia define o fluxo operacional oficial do projeto para um operador solo no Upwork.

Objetivo:

- qualificar melhor
- prometer menos e entregar melhor
- proteger margem
- formalizar a camada multilíngue
- transformar cada entrega em ativo reutilizável

## Princípios

- qualificar antes de precificar
- validar capacidade antes de prometer prazo
- manter `discovery-first` quando o escopo ainda tem incerteza real
- operar internamente em `pt-BR`
- manter o artefato mestre em `pt-BR` durante o desenvolvimento
- localizar toda superfície comercial e de relacionamento externo para a língua do cliente apenas no momento de envio
- usar `25%` como margem mínima padrão
- usar `phased fixed-price` como modelo padrão
- usar `50/50` como split padrão para audit package, salvo justificativa documentada
- exigir `change order` formal para crescimento de escopo
- exigir critério de aceite antes do kickoff
- manter janela padrão de `7 dias` de hypercare após entrega, salvo exclusão explícita
- toda entrega deve gerar pelo menos um ativo de expansão: `case`, `testimonial`, `upsell` ou `referral`

## Vocabulário Operacional Compartilhado

### Fit Lane

- `Core Offer`
- `Adjacency`
- `Reject`

### Feasibility

- `Go`
- `Go with Constraints`
- `No-Go`

### Pipeline Status

- `New`
- `Qualified`
- `Estimating`
- `Proposed`
- `Localized`
- `Follow-Up`
- `Won`
- `Lost`
- `Kickoff`
- `In Delivery`
- `QA`
- `Delivered`
- `Hypercare`
- `Expansion`
- `Closed`

### Campos Obrigatórios dos Trackers

- `lead_id`
- `source_url`
- `client_name`
- `client_language`
- `internal_language`
- `offer_fit`
- `problem_summary`
- `budget_range`
- `target_price`
- `price_floor`
- `margin_ratio`
- `feasibility_status`
- `proposal_status`
- `localized_artifact_status`
- `next_follow_up_date`
- `kickoff_date`
- `delivery_stage`
- `testimonial_status`
- `next_contract_opportunity`

### Defaults Fixos

- `internal_language`: `pt-BR`
- `localized_artifact_status` inicial: `Not Started`

## Camada Multilíngue

### Regra

Nunca traduzir literalmente sem revisão de intenção comercial.

Sequência correta:

1. gerar o artefato mestre em `pt-BR`
2. resolver o idioma do cliente quando a oportunidade for confirmada para envio
3. adaptar para a língua do cliente
4. revisar tom, precisão técnica e naturalidade
5. marcar como pronto para envio somente após o gate de localização

### Superfícies que Devem Ser Localizadas

- cover letter
- proposta longa
- follow-up
- kickoff externo
- requests e updates para o cliente
- handoff externo
- comunicação de pós-venda

### Gate de Localização

Antes de enviar qualquer artefato localizado, validar:

- fidelidade ao escopo
- tom compatível com a proposta
- linguagem natural para o cliente
- termos técnicos consistentes
- ausência de tradução literal ruim
- CTA preservado

## Estágios Oficiais do Pipeline

Cada estágio abaixo tem objetivo, entrada, artefato obrigatório, saída e gate.

### 1. Intake

Objetivo:

- decidir se a oportunidade merece atenção

Entrada:

- oportunidade, lead inbound ou indicação

Artefato obrigatório:

- `Opportunity_Intake_and_Fit.md`

Saída:

- `Core Offer`, `Adjacency` ou `Reject`

Gate:

- só avança se houver problema real, cliente plausível e ticket não trivial

### 2. Qualificação

Objetivo:

- confirmar se a oportunidade cabe na tese comercial atual

Entrada:

- intake preenchido

Artefato obrigatório:

- `AI_Qualification_Framework.md`

Saída:

- `Accept`, `Watch` ou `Reject`

Gate:

- só avança se for `Accept`

### 3. Viabilidade e Capacidade

Objetivo:

- decidir se conseguimos entregar sem comprometer qualidade, prazo ou margem

Entrada:

- oportunidade aceita

Artefato obrigatório:

- `Feasibility_and_Capability_Assessment.md`

Saída:

- `Go`, `Go with Constraints` ou `No-Go`

Gate:

- só avança se `Go` ou `Go with Constraints`

### 4. Discovery e Escopo

Objetivo:

- reduzir incerteza antes da estimativa

Entrada:

- viabilidade aprovada

Artefatos obrigatórios:

- `Opportunity_Intake_and_Fit.md`
- `Kickoff_Action_Plan_and_Risk_Register.md` em modo pré-kickoff, se necessário

Saída:

- escopo inicial
- lista de suposições
- lista de riscos
- dependências e acessos necessários

Gate:

- só avança quando o problema, o output e os limites mínimos estiverem claros

### 5. Estimativa, Custos e Precificação

Objetivo:

- transformar escopo em número e proteger margem

Entrada:

- escopo inicial

Artefato obrigatório:

- `Costing_Pricing_and_Timeline.md`

Saída:

- `target_price`
- `price_floor`
- `margin_ratio`
- cronograma proposto
- exclusões

Gate:

- só avança se a margem mínima estiver preservada ou se a exceção estiver documentada

### 6. Proposta e Localização

Objetivo:

- converter a estimativa em decisão de compra

Entrada:

- pricing aprovado internamente

Artefatos obrigatórios:

- `Proposal_and_Localization_Pack.md`
- `Localization_Review_Checklist.md`
- `Translation_Style_Glossary.md`

Saída:

- proposta mestre em `pt-BR`
- proposta localizada
- status `Localized`

Gate:

- só avança se o gate de localização for aprovado

### 7. Follow-Up e Fechamento

Objetivo:

- remover atrito e fechar o contrato

Entrada:

- proposta enviada

Artefato obrigatório:

- `Proposal_Follow_Up_Tracker.md`

Saída:

- `Won` ou `Lost`

Gate:

- se `Won`, avança para kickoff
- se `Lost`, registrar razão de perda

### 8. Kickoff

Objetivo:

- alinhar execução, comunicação e aceite antes do trabalho começar

Entrada:

- contrato ganho

Artefato obrigatório:

- `Kickoff_Action_Plan_and_Risk_Register.md`

Saída:

- plano de ação
- cadência
- checkpoints
- critérios de aceite

Gate:

- só avança quando acessos, responsabilidades e critérios de aceite estiverem claros

### 9. Delivery

Objetivo:

- executar com previsibilidade e controle de escopo

Entrada:

- kickoff aprovado

Artefatos obrigatórios:

- `Delivery_Control_and_PR_Log.md`
- `Client_Request_and_Change_Order_Log.md`

Saída:

- incrementos entregues
- mudanças registradas
- bloqueios visíveis

Gate:

- qualquer expansão de escopo exige `change order`

### 10. QA e Aceite

Objetivo:

- provar que a entrega está correta antes do handoff

Entrada:

- entrega funcional

Artefato obrigatório:

- `QA_Acceptance_and_Handoff.md`

Saída:

- aceite
- pendências finais
- handoff pronto

Gate:

- só avança com checklist de QA e aceite do cliente ou sinal de aceite definido

### 11. Handoff e Hypercare

Objetivo:

- garantir uso real após a entrega

Entrada:

- aceite funcional

Artefato obrigatório:

- `QA_Acceptance_and_Handoff.md`

Saída:

- handoff concluído
- hypercare iniciado

Gate:

- manter suporte limitado por `7 dias`, salvo acordo diferente

### 12. Pós-Venda e Expansão

Objetivo:

- converter o trabalho entregue em nova receita ou prova comercial

Entrada:

- hypercare concluído

Artefato obrigatório:

- `Post_Sale_Expansion_Playbook.md`

Saída:

- `case`, `testimonial`, `upsell`, `retainer` ou `referral`

Gate:

- nenhum projeto fecha sem registrar uma tentativa de expansão ou reaproveitamento comercial

## Regras de Controle

### Change Order

Abrir `change order` quando houver:

- crescimento de escopo
- nova integração
- nova plataforma ou idioma
- atraso causado por dependência externa
- novo ciclo de revisão fora do combinado

### Aceite

Aceite deve ser definido antes do kickoff com:

- o que será entregue
- o que não será entregue
- como será validado
- quem aprova
- o que conta como concluído

### Pricing

Defaults operacionais:

- `discovery-first` por padrão
- `25%` de margem mínima
- `phased fixed-price` por padrão
- `50/50` para audit package
- exceção de pricing exige justificativa

## Ordem Recomendada de Operação

1. intake
2. qualificação
3. viabilidade
4. discovery
5. estimativa
6. proposta
7. localização
8. follow-up
9. fechamento
10. kickoff
11. delivery
12. QA
13. handoff
14. hypercare
15. expansão

## Regra Final

Venda, delivery e pós-venda são um único sistema. O operador profissional não trata proposta, execução e expansão como etapas soltas. Tudo deve deixar rastro, decisão explícita e próximo passo claro.
