# Worked Example - AI Systems Audit Sprint Production Workspace

> [!IMPORTANT]
> Este arquivo e um exemplo de referencia/historico. Nao e um resultado entregue pelo projeto atual nem uma diretriz operacional.
> Ele mostra como um workspace de producao pode ser estruturado quando o servico/produto vendido e um sprint de auditoria e arquitetura de IA, e nao uma automacao de banco de dados.

## Status

- `reference opportunity`
- `audit and architecture study`
- `not a delivered client result`
- `offer_fit`: `Core`
- `client_language`: `en-US`
- `internal_language`: `pt-BR`

## 1. Intake e Fit

| Campo | Valor |
| --- | --- |
| `lead_id` | `upwork-ai-ops-audit-20260402` |
| `source_url` | `https://www.upwork.com/jobs/~ai-systems-audit-example` |
| `client_name` | `nao identificado no brief ficticio` |
| `budget_range` | `US$ 5.000 - US$ 7.500 total` |
| `problem_summary` | auditoria de workflow para atendimento e operacoes, com Zendesk, HubSpot, Google Sheets e Slack fragmentados; necessidade de mapear risco, automacao e governanca antes de implementar IA |
| `offer_fit` | `Core` |
| `proposal_status` | `Approved for Send` |
| `localized_artifact_status` | `Approved for Send` |

Leitura:

- o cliente nao precisa de codigo primeiro; precisa de clareza de arquitetura
- o trabalho pede mapeamento de processo, dados, risco e decisao humana
- a automacao faz sentido depois da auditoria, nao antes
- existe valor claro para um `AI Systems Audit Sprint` com escopo bem recortado

Decisao:

- seguir como `Core`
- usar como prova de capacidade para auditoria de workflow, arquitetura e roadmap

## 2. Viabilidade e Capacidade

### Stack e Competencias Necessarias

- Python para analise e automacao de suporte ao discovery
- APIs e integracoes com Zendesk, HubSpot, Slack e Google Drive
- orquestracao de workflow e governanca de dados
- LLMs com grounding e revisao humana
- documentacao executavel para handoff e fase 2

### Recursos Necessarios

| Recurso | Status | Observacao |
| --- | --- | --- |
| acesso ao helpdesk | pendente | necessario para mapear tickets, tags e SLAs |
| acesso ao CRM | pendente | necessario para entender handoffs e ownership |
| exemplos de tickets reais | pendente | importante para calibrar classificacao e risco |
| exports de relatorios | pendente | base para baseline e metricas |
| canal de alinhamento com stakeholders | disponivel | usado para validar prioridades e aceite |

### Restricoes Tecnicas

- nao automatizar antes de entender o fluxo atual
- nao enviar dados sensiveis para LLM sem criterio de governanca
- separar regras deterministicas de assistencia generativa
- registrar decisao humana em cada ponto de aprovacao

## 3. Escopo e Discovery

Objetivo recomendado para a fase 1:

- mapear o fluxo atual de atendimento e operacoes
- identificar onde ha triagem manual, retrabalho e perda de contexto
- definir o que pode ser assistido por IA e o que precisa continuar deterministico
- entregar um roadmap com ordem de implementacao, risco e impacto

Perguntas obrigatorias antes de estimar em definitivo:

1. Quais sistemas entram no fluxo atual?
2. Quais eventos disparam classificacao, roteamento ou escalacao?
3. Quais dados podem ser usados com IA e quais exigem restricao?
4. Quais metricas definem sucesso: tempo de resposta, resolucao, qualidade, custo?
5. Existe governanca para aprovacao humana antes de qualquer automacao sensivel?

## 4. Estimativa, Custos e Precificacao

### Leitura Comercial

O budget publicado funciona se o recorte for uma auditoria com arquitetura e roadmap, nao uma implementacao completa.

### Estimativa Inicial

| Bloco | Horas |
| --- | --- |
| discovery tecnico | 8 |
| mapeamento do fluxo atual | 10 |
| inventario de oportunidades | 8 |
| arquitetura recomendada | 8 |
| roadmap e handoff | 6 |
| buffer | 4 |
| total | 44 |

### Custos Externos

| Item | Estimativa | Observacao |
| --- | --- | --- |
| ferramentas de helpdesk / CRM | variavel | depende do stack do cliente |
| uso de LLMs | baixo a medio | se a fase pedir testes controlados |
| armazenamento de evidencias | baixo | docs, exports e relatarios |

### Leitura de Pricing

- `target_price`: sprint consultivo com entregaveis claros
- `price_floor`: nao aceitar discovery sem acesso minimo e objetivo definido
- modelo recomendado: fase fixa curta com saida auditavel e roadmap executavel

## 5. Proposta-Base em PT-BR

Hipotese comercial:

- nao vender automacao cega
- vender auditoria que mostra onde IA reduz retrabalho, melhora triagem e diminui risco operacional

Mensagem-mestra:

- o risco nao esta em chamar um modelo
- o risco esta em governar dados, roteamento, aprovacao humana e responsabilidade operativa

Oferta sugerida:

- `AI Systems Audit Sprint`
- foco em `support + CRM + workflow automation`
- saida: mapa do estado atual, matriz de oportunidades e roadmap por fases

## 6. Versao Localizada para o Cliente

### Cover Letter Curta em Ingles

```text
Hi,

I would not automate this workflow blindly. The real risk is in mapping ticket intake, routing, approvals, knowledge retrieval, and reporting across multiple systems without creating a brittle or unsafe process.

I would start with an audit sprint that documents the current state, identifies the highest-value AI opportunities, and defines a phased roadmap for implementation. That gives you a safer architecture and avoids expensive point solutions.
```

### Resposta Curta para a Pergunta Tecnica

```text
I would model the workflow as a current-state map plus an opportunity matrix. Each step would capture the source system, owner, human gate, and data sensitivity. From there, I would define which parts are safe for AI-assisted triage, which should stay deterministic, and where retrieval or orchestration is actually justified.
```

`localized_artifact_status`: `Approved for Send`

## 7. Kickoff e Solicitacoes ao Cliente

Itens a solicitar:

- acesso ao helpdesk
- acesso ao CRM
- exemplos de tickets e escalacoes reais
- relatorios exportados
- lista de SLAs e regras de negocio
- criterio de aceite para a fase 1

## 8. Registro de Riscos

| Risco | Impacto | Mitigacao |
| --- | --- | --- |
| dados sensiveis expostos em prompts | alto | governanca, redacao e filtros antes de qualquer teste |
| automacao precoce sem mapa do fluxo | alto | discovery e state map antes de implementar |
| ownership difuso entre ferramentas | medio | matriz de decisao por etapa |
| metricas nao definidas | alto | baseline obrigatorio na fase 1 |
| escopo virar "bot magico" | alto | change order e limites claros |

## 9. Checkpoints de Delivery

1. discovery validado
2. current-state map aprovado
3. opportunity matrix priorizada
4. arquitetura e roadmap entregues
5. review com stakeholders concluido
6. handoff e decisao sobre fase 2

## 10. Expansao Comercial

Oportunidades de fase 2:

- assistente de triagem para suporte
- retrieval sobre base de conhecimento
- sincronizacao com CRM
- dashboard de metricas operacionais
- governanca e revisao de prompts

Ativos gerados:

- prova de capacidade em audit sprint
- referencia arquitetural para workflow automation
- base para proposta de implementacao paga
