# Estratégia Histórica de Automação de Navegador no Upwork

> [!IMPORTANT]
> Este documento é legado de arquitetura. Ele preserva contexto histórico apenas e nao faz parte do escopo ativo deste projeto.

Este documento define a direção operacional para automação no Upwork, com foco em browser automation supervisionada e observabilidade, conforme os pilares da [[docs/00_Governance/Constitution|Constituição]].

---

## 1. O Dilema: API vs. Browser Automation

### 🔹 Caminho A: API Oficial (Prioridade)
A API oficial é o único método 100% seguro. No entanto, o Upwork é rigoroso na concessão de chaves.
- **Critérios de Aprovação:** Perfil verificado, método de pagamento ativo, caso de uso legítimo (ex: integração de agência).
- **Ação:** Devemos solicitar a chave como uma ferramenta de "Gestão de Leads e CRM Interno".

### 🔸 Caminho B: Browser Automation Supervisionada
Quando a API não cobre o fluxo desejado, a automação de navegador deve ser tratada como uma interface operacional, não como uma extração passiva de HTML.

---

## 2. Protocolo de "Junta de Agentes"

A "Junta de Agentes" é um processo decisório interno onde múltiplos modelos analisam o risco da próxima ação.

| Agente | Função | Foco |
| :--- | :--- | :--- |
| **Pesquisador** | Analisar defesas (Cloudflare, Beacons). | Detecção Técnica. |
| **Estrategista** | Definir intervalos de tempo e padrões de scroll. | Comportamento Humano. |
| **Analista de Risco** | Avaliar a "temperatura" da conta. | Prevenção de Bloqueio. |

### Regras de Ouro da Automação:
1. **Session Persistence:** Reutilizar a sessão autenticada para reduzir fricção e risco operacional.
2. **Small Steps:** Executar ações pequenas e observáveis.
3. **Observability First:** Registrar cada passo, estado e falha para depuração.
4. **Human Review:** Qualquer ação sensível permanece supervisionada.

---

## 3. Arquitetura de Modelos (Contexto Legado)

Este trecho foi preservado para contexto histórico. O fluxo operacional ativo agora é o sistema solo descrito em `docs/02_Guides/Delivery_Methodology.md`, com pesquisa, qualificação, proposta, localização e delivery documentados separadamente.

Na versão legada, o projeto de automação era tratado como uma habilidade interna da pilha antiga, sem instanciar modelos separados. O sistema herdaria uma cadeia de escalonamento legada:

1. **Camada 0 (Baseline/Scoring):** Gemini 3 Flash (`google-antigravity/gemini-3-flash`) - Rápido, barato, ideal para triagem em massa.
2. **Camada 1 (Produção/Draft de Propostas):** DeepSeek Chat - Fallback imediato se o Gemini falhar.
3. **Camada de Emergência (Failover):** Moonshot Kimi-k2.5 para instabilidade de billing.
4. **Camada Elite (Estratégia Clara):** Claude Opus 4.6 Thinking - Usado apenas para propostas de extremo alto valor via invocação manual.

***Vantagem:*** Economia de tokens, gerenciamento unificado de billing e contexto integrado com a pilha central legada.

---

## ✍️ Justificativa para API Key (Draft)

"Solicitamos acesso à API para integrar o fluxo de descoberta de oportunidades ao nosso sistema interno de gestão de talentos. O objetivo é automatizar a triagem inicial de oportunidades que coincidam com nossa stack técnica (React, Node.js, Playwright) para reduzir o tempo de resposta aos clientes, mantendo toda a fase de proposta e comunicação sob supervisão humana direta."

---
*Assinado pela Junta de Agentes - Versão 1.0*
