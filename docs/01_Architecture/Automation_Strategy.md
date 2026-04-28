# 🛡️ Estratégia Ativa de Automação de Navegador (Antigravity v2.0)

> [!IMPORTANT]
> Este documento define a estratégia operacional ativa para coleta de dados no Upwork, abandonando métodos baseados em 'bot behavior' (navegação automatizada via CDP) em favor de protocolos de 'Supervisão Ativa'.

---

## 1. O Novo Paradigma: Passive-Reader

O Upwork utiliza defesas de borda avançadas (Cloudflare, Beacons). Tentativas de automação que controlam o ciclo de navegação (`page.goto()`, interações forçadas de DOM) são detectadas e bloqueadas com erros 403.

### 🔹 Estratégia: Conexão via Porta 9222 (Debugger)
A conexão de confiança é estabelecida através de um navegador Chrome já aberto manualmente pelo operador.

1.  **Warm-Tab Principle**: O Agente Antigravity não abre a página; ele se anexa a uma aba já "aquecida" (com cookies e desafios de Cloudflare resolvidos pelo humano).
2.  **Navegação Zero**: O bot apenas lê o conteúdo presente no DOM. Se for necessário navegar para o próximo pacote de vagas, o bot pode solicitar ao humano ou usar comandos de scroll sutis, mas nunca redirecionamentos bruscos de `window.location`.

---

## 2. Protocolo de "Resiliência Operacional"

Diferente da versão 1.0, o foco agora é a **defesa da conta**.

| Elemento | Regra de Ouro | Por que? |
| :--- | :--- | :--- |
| **Identidade** | Persistent Session (W:\.upwork-session) | Manter o 'Trust Score' da conta. |
| **Coleta** | Passive Scraping em Lote | Evitar disparar monitoramento de DOM mutante. |
| **Frequência** | On-Demand (Gatilho Manual) | Automações 24/7 são bandeiras vermelhas imediatas. |

---

## 3. Estratégia Econômica: Productized Audit Sprint

Abandonamos a "Corrida para o Fundo" (baixo valor/alta competição) em favor de uma oferta premium consultiva.

1.  **Triagem (Scoring)**: Focar em leads com alta complexidade técnica e baixa pressão de preço.
2.  **Front-end Offer**: Vender um **Audit & Architecture Sprint** de US$ 5,000 (10 dias).
3.  **Justificativa**: Substituição de "Codificação por hora" por "Segurança de Arquitetura e Redução de Riscos".

---

## 4. Cockpit Operacional: Obsidian Interface

A interface do usuário não é mais o terminal, mas sim arquivos **Markdown** consumidos via **Obsidian**.
- `reports/` atua como o banco de dados dinâmico.
- `docs/` atua como o manual canônico e guias de entrega.

---
*Assinado pelo Operador Antigravity - Atualizado em 2026-04-04*
