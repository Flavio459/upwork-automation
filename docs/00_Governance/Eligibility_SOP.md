# Eligibility SOP

> [!IMPORTANT]
> Este SOP define o procedimento operacional padrão para decidir se um lead pode ou não entrar no fluxo principal.
> Ele existe para impedir que research avance leads ruins para qualificação, proposta e delivery.

## Objetivo

Transformar o `Eligibility_Filter.md` em procedimento operacional executável, simples e repetível.

## Fonte de Verdade

- Regra conceitual: [[docs/00_Governance/Eligibility_Filter|Eligibility Filter]]
- Script de apoio: [scripts/check_eligibility.py](W:\flavi\Aplicativos\Automação UPWORK\scripts\check_eligibility.py)

## Momento de Uso

Aplicar este SOP imediatamente depois do research e antes de:

- abrir `Opportunity_Intake_and_Fit`
- iniciar qualificação
- estimar proposta
- gastar tempo em localização ou delivery

Fluxo:

`research -> eligibility -> qualification -> feasibility -> pricing -> proposal`

## Procedimento

### 1. Validar alinhamento de tese

Responder:

- o lead pede arquitetura, auditoria, fluxo, integração ou sistema?
- ou pede apenas coding isolado, script rápido ou execução pontual?

Decisão:

- se for trabalho de sistema, discovery ou arquitetura: continuar
- se for commodity, automação pessoal ou script avulso: rejeitar

### 2. Validar piso financeiro

Aplicar o piso absoluto:

- se `budget_client < 400`: rejeitar imediatamente

Se o budget for utilizável, calcular elegibilidade econômica:

```bash
python scripts/check_eligibility.py <hours_est> <rate_op> <budget_client>
```

Regra:

- `real_cost = hours_est * rate_op`
- `max_allowed = budget_client * 1.12`
- se `real_cost <= max_allowed`: elegível
- se `real_cost > max_allowed`: rejeitar

### 3. Validar maturidade do cliente

Confirmar:

- payment verified
- pelo menos um job anterior concluído ou outro sinal real de maturidade
- ausência de sinais fortes de scope creep, não-pagamento ou comportamento tóxico

Regra:

- cliente sem histórico + payment unverified: rejeitar
- histórico ruim documentado: rejeitar

### 4. Validar profundidade do escopo

Confirmar:

- existe problema de negócio ou sistema a ser entendido?
- há espaço para diagnóstico, recomendação ou desenho?

Regra:

- se há discovery legítimo: continuar
- se o escopo é implementação fechada sem espaço consultivo: rejeitar

## Regra de Decisão

O lead só entra no fluxo se as 4 condições passarem:

1. tese
2. budget
3. cliente
4. escopo

Se qualquer item falhar:

- marcar como `REJECT`
- registrar o motivo
- não abrir intake
- não seguir para proposal

## Registro Mínimo de Rejeição

Registrar:

- `lead_id`
- `date`
- `failed_gate`
- `one_line_reason`

## Saída Esperada

### Se aprovado

- abrir [[docs/03_Templates/Opportunity_Intake_and_Fit|Opportunity Intake and Fit]]

### Se rejeitado

- encerrar o lead sem consumo adicional de ciclo

## Observação de Reconstrução

Este SOP faz parte do núcleo novo do projeto. Ele deve permanecer pequeno, operacional e imune a deriva de escopo.
