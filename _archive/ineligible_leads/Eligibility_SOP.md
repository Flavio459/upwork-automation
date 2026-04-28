# ⚖️ Protocolo de Elegibilidade e Pré-Seleção (PS & E)

Este documento define os critérios obrigatórios de entrada para qualquer projeto no sistema UPWORK Automation. Nenhum recurso (tokens, tempo, arquitetura) deve ser gasto antes da validação deste protocolo.

## 1. Critério de Pré-Seleção (Filtro 0)
O lead só é elegível para análise se atender a pelo menos **dois** destes critérios:
- **Especialidade:** Automação de Processos, IA, Desenvolvimento Web ou Integração de APIs.
- **Transparência:** Or orçamento (Fixed ou Hourly) está claramente definido no post.
- **Urgência/Potencial:** O cliente possui histórico de contratação e depoimentos positivos.

---

## 2. Cálculo de Elegibilidade (A Regra dos 12%)
Todo projeto deve passar pelo cálculo de **Viabilidade Financeira Real**.

### A Fórmula:
1. **$H_{expert}$**: Estimativa de horas para entrega profissional (não apenas "fazer funcionar", mas entrega com documentação e QA).
2. **$R_{op}$**: Taxa operacional padrão (atualmente definida como **US$ 100/hora** para projetos especializados).
3. **$C_{real} = H_{expert} \times R_{op}$**.
4. **$B_{client}$**: Orçamento máximo declarado pelo cliente.
5. **$T_{max} = B_{client} \times 1.12$** (Tolerância de 12% acima do teto).

### O Veredito:
- **ELEGÍVEL:** Se $C_{real} \le T_{max}$.
- **INELEGÍVEL:** Se $C_{real} > T_{max}$.

> [!CAUTION]
> **REGRA DE OURO:** Se o projeto for INELEGÍVEL, ele deve ser arquivado imediatamente como "Bad Fit". Não tente "reduzir o escopo" ou "fazer mais barato" para caber no budget, a menos que haja ganho estratégico colossal (ex: Parceria de Longo Prazo).

---

## 3. Aplicação Operacional
O documento `01_opportunity_intake_and_fit.md` deve conter este cálculo obrigatoriamente no início.
- Se o campo `Eligibility` for `Ineligible`, o Agente (IA) está proibido de gerar o documento `04_protocolo_tecnico_e_auditoria`.
