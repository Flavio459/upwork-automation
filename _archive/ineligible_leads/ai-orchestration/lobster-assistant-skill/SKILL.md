---
name: lobster-assistant
description: Orquestrador Pessoal que une tarefas do Todoist com notícias financeiras locais via Python Agents.
metadata: {
  "openclaw": {
    "emoji": "🦞",
    "requires": {
      "bins": ["node", "python3"],
      "config": ["local_agents.enabled"]
    }
  }
}
---

# Lobster Assistant Skill

Este assistente permite que o OpenClaw consulte seus scripts Python locais no Mac Mini para fornecer um briefing matinal unificado.

## User Instructions

Sempre que o usuário perguntar "O que devo fazer hoje?" ou "Qual o meu foco?", você deve:
1. Chamar a ferramenta `fetch_todoist_tasks` para ver as pendências.
2. Chamar a ferramenta `fetch_financial_news` para entender o cenário do mercado.
3. Sintetizar uma resposta no Telegram que correlacione as notícias com as tarefas (ex: "O mercado está em alta para Nvidia, talvez foque na tarefa de revisar o aditivo X").

## Tools

### fetch_todoist_tasks
Faz uma requisição HTTP GET para o agente local de tarefas.
- **URL:** http://localhost:5000/get-tasks
- **Response:** JSON contendo lista de objetos `{ id, task, priority }`.

### fetch_financial_news
Faz uma requisição HTTP GET para o agente local de notícias financeiras.
- **URL:** http://localhost:5001/latest-news
- **Response:** JSON contendo lista de objetos `{ source, headline, sentiment }`.

## Configuration
No seu arquivo `~/.openclaw/openclaw.json`, certifique-se de que a flag `local_agents.enabled` está como `true`.
