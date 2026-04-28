# Eligibility Filter

> [!IMPORTANT]
> Este documento é um **gate de entrada**. Nenhum lead avança para qualificação sem passar pelos 4 critérios abaixo. Não há "3 de 4 com ressalva". A lógica é binária: `PASS` ou `REJECT`.

## Por que este documento existe

O fluxo anterior ia direto de research para qualificação sem um filtro formal.
O resultado foi gasto de ciclos em leads estruturalmente incompatíveis com a tese
(automação pessoal, budget abaixo do piso, clientes sem histórico).

Este documento fecha esse gap. Ele é lido **antes** de abrir qualquer template operacional.

---

## As 4 flags de elegibilidade

Todas as 4 precisam retornar `true` para o lead avançar.

---

### Flag 1 — Alinhamento de tese

**Pergunta:** O problema descrito é de Arquitetura, Fluxo ou Sistemas de AI — ou é apenas Coding/Scripting isolado?

| Sinal de PASS | Sinal de REJECT |
|---|---|
| Cliente quer entender, auditar ou redesenhar um fluxo | Cliente quer "codar isso aqui pra mim agora" |
| Menciona pipelines, agentes, integrações, dados | Menciona scripts, automação pessoal, tarefas pontuais |
| Problema tem ambiguidade que exige Discovery | Escopo já está 100% definido sem espaço consultivo |
| Linguagem de negócio + linguagem técnica misturadas | Apenas linguagem técnica de execução |

**Veto direto:** qualquer menção a "automação pessoal", "script rápido", "tarefa simples" sem contexto de sistema → `REJECT` imediato.

---

### Flag 2 — Piso financeiro

**Pergunta:** O budget declarado ou o histórico do cliente suporta uma entrada mínima de **US$ 400**?

| Situação | Decisão |
|---|---|
| Budget declarado ≥ US$ 400 | `PASS` |
| Budget declarado < US$ 400 | `REJECT` automático |
| Budget não declarado | Verificar histórico do cliente: se tem jobs pagos acima de US$ 400 anteriores, `PASS` condicional. Caso contrário, `REJECT` |

**Racional:** O piso de US$ 400 elimina tarefas de commodity ($50–$150 que dominam o feed) sem fechar a torneira em fase de volume baixo. O preço de tabela do AI Systems Audit Sprint é US$ 5.000 — leads nessa faixa são candidatos a sprint completo. Leads entre $400–$999 podem ser abordados como discovery ou entrada de sprint menor.

> [!NOTE]
> **Régua de escalonamento:** Este piso deve ser revisado para cima conforme a demanda aumentar. Referência de revisão: quando a taxa de conversão de propostas superar 20% ou o pipeline ativo tiver mais de 5 leads simultâneos, considerar subir o piso para US$ 1.000.

---

### Flag 3 — Maturidade do cliente

**Pergunta:** O perfil do cliente indica profissionalismo e capacidade de conduzir um engajamento consultivo?

| Critério | Peso |
|---|---|
| Hire rate ≥ 50% | Obrigatório |
| Pelo menos 1 job concluído com avaliação visível | Obrigatório |
| Payment method verificado | Obrigatório |
| Avaliações indicam clareza, feedback construtivo, respeito ao processo | Recomendado |

**Veto direto:**
- 0 jobs concluídos + payment unverified → `REJECT`
- Avaliações de freelancers anteriores descrevendo scope creep, não-pagamento ou microgerenciamento agressivo → `REJECT`

---

### Flag 4 — Profundidade do escopo

**Pergunta:** A descrição do projeto permite estruturar um Discovery — ou é um pedido de execução imediata sem espaço para pensar?

| Sinal de PASS | Sinal de REJECT |
|---|---|
| Cliente descreve um problema, não uma solução pronta | Cliente descreve a solução e quer apenas implementação |
| Há menção a contexto de negócio, stakeholders ou impacto | Há apenas uma lista de tarefas técnicas |
| O escopo tem ambiguidade legítima que justifica Discovery | O escopo é tão fechado que não há espaço para arquitetura |
| Cliente pergunta "o que você recomenda" ou "como você abordaria" | Cliente pergunta "você consegue fazer exatamente isso" |

**Nota:** Escopo ambíguo demais também é um sinal de risco. Se não há nenhum problema descrito — apenas "preciso de ajuda com AI" — isso é falta de maturidade, não oportunidade de Discovery. Avaliar com critério.

---

## Decisão final

```
Flag 1 (tese)     = true
Flag 2 (budget)   = true
Flag 3 (cliente)  = true
Flag 4 (escopo)   = true
────────────────────────
PASS → avança para AI_Qualification_Framework.md
```

```
Qualquer flag = false
────────────────────────
REJECT → registrar motivo e descartar sem gastar ciclos adicionais
```

Não existe caminho intermediário. Se a tentação for "mas esse lead tem potencial se eu ajustar X", isso é o sinal de que o filtro está funcionando — e o lead deve ser descartado.

---

## Registro de rejeição

Ao rejeitar um lead, registrar no workspace de research:

```
lead_id: [id]
data: [data]
motivo_rejeicao: [flag que falhou]
observacao: [uma linha de contexto]
```

Esse registro alimenta o refinamento do filtro ao longo do tempo.

---

## Integração no fluxo

Este documento é referenciado:

- em `docs/00_Governance/Chat_Bootstrap.md` — entre os itens 7 (Research) e o fluxo de qualificação
- em `docs/00_Governance/Reference_Map.md` — como documento canônico de governança
- no fluxo operacional do `README.md` — como etapa 2.5 entre research e qualificação

**Ordem de operação:**

```
research → Eligibility_Filter.md → AI_Qualification_Framework.md → templates operacionais
```

---

## Revisão deste documento

Este filtro deve ser revisado a cada 10 leads processados ou após qualquer rejeição pós-proposta
(quando um lead passou pelo filtro mas a proposta não converteu por razões que o filtro deveria ter capturado).
