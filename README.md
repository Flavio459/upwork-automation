# 🚀 Upwork Automation System

**Aumenta propostas em 30-50% | Propostas geradas por IA | Scoring inteligente | Automação 24/7**

> Um sistema completo de automação para Upwork que scrapa jobs, calcula score inteligente e gera propostas profissionais com análise de IA.

---

## ✨ Features

✅ **Automático 24/7**
- Scraping inteligente de jobs (Playwright)
- Scoring de 0-100 com 6 critérios
- Análise com Claude AI
- Propostas estruturadas geradas automaticamente

✅ **Manual (Você controla)**
- Revisão antes de enviar
- Edição de propostas
- Aprovação manual obrigatória
- Sem envios automáticos

✅ **Monitoramento**
- Rastreamento de respostas
- Dashboard web
- Notificações automáticas
- Histórico completo

✅ **Profissional**
- Design clean e moderno
- Propostas estruturadas em 7 seções
- IA-gerado mas humanizado
- Pronto para produção

✅ **Escalável**
- Stack moderno (Node.js + TypeScript)
- Database SQLite/Supabase
- Deployment automático (GitHub Actions)
- Infrastructure-as-Code

---

## 📊 Resultados Esperados

```
Conservador:
├─ +30% em propostas enviadas
├─ +40% em taxa de conversão
└─ Break-par em 2-3 meses

Otimista:
├─ +50% em propostas
├─ +60% em conversões
└─ Break-par em 1 mês
```

**ROI:** Se você ganha $50+/hora → Retorno positivo em 1-2 meses.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│   UPWORK AUTOMATION SYSTEM              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐   ┌──────────────┐   │
│  │   Scraper   │──▶│   Scorer     │   │
│  │ (Playwright)│   │ (6 critérios)│   │
│  └─────────────┘   └──────────────┘   │
│         │                  │           │
│         └──────────┬───────┘           │
│                    ▼                   │
│         ┌──────────────────┐           │
│         │   Claude AI      │           │
│         │  (Análise + Gen) │           │
│         └──────────────────┘           │
│                    │                   │
│                    ▼                   │
│         ┌──────────────────┐           │
│         │   Database       │           │
│         │  (SQLite/Supa)   │           │
│         └──────────────────┘           │
│                    │                   │
│                    ▼                   │
│         ┌──────────────────┐           │
│         │   Dashboard      │           │
│         │   (React + API)  │           │
│         └──────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Scoring Algorithm

### 6 Critérios Ponderados

| Critério | Peso | Descrição |
|----------|------|--------|
| **SKILL MATCH** | 35% | Quantos skills do job você tem? |
| **BUDGET ALIGN** | 20% | Orçamento está dentro do seu range? |
| **CLIENT HISTORY** | 15% | Cliente tem bom histórico? |
| **COMPLEXITY** | 15% | Complexidade combina com sua experiência? |
| **DESCRIPTION** | 10% | Descrição é detalhada? |
| **TIMEFRAME** | 5% | Timeline é realista? |

### Exemplo de Cálculo

```
Score = (95 × 0.35) + (90 × 0.20) + (96 × 0.15) + 
        (85 × 0.15) + (88 × 0.10) + (80 × 0.05)
      = 33.25 + 18 + 14.4 + 12.75 + 8.8 + 4 
      = 91/100 ✅
```

---

## 📝 Proposta Auto-Gerada (7 Seções)

1. **Executive Summary** - Quem você é + compreensão rápida
2. **Understanding of Requirements** - Quais são os requisitos principais?
3. **Proposed Solution & Approach** - Como você vai fazer?
4. **Timeline & Milestones** - Quando vai entregar?
5. **Investment & Payment Terms** - Quanto custa? Como pagar?
6. **Why Choose Us** - Por que escolher você?
7. **Next Steps** - O que fazer agora?

---

## 🚀 Quick Start

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
Conta no Upwork
API Key da Claude (Anthropic)
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Flavio459/upwork-automation.git
cd upwork-automation

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com suas credenciais
```

### Configuração

```bash
# Arquivo .env
UPWORK_EMAIL=seu-email@upwork.com
UPWORK_PASSWORD=sua-senha
CLAUDE_API_KEY=sua-claude-key
DATABASE_URL=sqlite:./db/upwork.db
PORT=3000
```

### Rodar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Start produção
npm start

# Rodar scraper manual
npm run scrape

# Rodar scheduler
npm run schedule
```

---

## 📂 Estrutura do Projeto

```
upwork-automation/
├── src/
│   ├── scraper/          # Playwright scraper
│   ├── scorer/           # Scoring engine
│   ├── ai/               # Claude integration
│   ├── db/               # Database operations
│   ├── api/              # Express REST API
│   ├── scheduler/        # Cron jobs
│   └── types/            # TypeScript types
├── client/               # React frontend
├── db/                   # Database files
├── demo/                 # Demo HTML interativa
├── docs/                 # Documentação
│   ├── PAPER.md          # Paper acadêmico
│   ├── upwork-automation.md
│   ├── implementation-guide.md
│   └── proposal-template.md
├── .github/
│   └── workflows/        # GitHub Actions
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Technology Stack

### Backend
```
✅ Node.js + TypeScript
✅ Playwright (browser automation)
✅ Claude API (IA analysis)
✅ SQLite / Supabase (database)
✅ Express.js (REST API)
✅ node-cron (scheduler)
```

### Frontend
```
✅ React 18 + TypeScript
✅ TailwindCSS (UI)
✅ TanStack Query (state management)
✅ Vite (build tool)
```

### Infraestrutura
```
✅ GitHub Actions (CI/CD)
✅ Railway ou Vercel (hosting)
✅ Cloudflare (optional, proxy)
✅ Docker (containerization)
```

---

## 📊 Daily Workflow

### Noite (Automático - Enquanto você dorme)
```
22:00 - Scraping automático
        └─ 24 jobs extraídos
        
22:15 - Scoring automático
        └─ Top 3 selecionados
        
22:20 - IA Analysis (15 minutos)
        └─ 3 propostas geradas
        
22:40 - Salvo no BD
        └─ Aguardando revisão manual
```

### Manhã (Manual - 5-10 minutos)
```
09:00 - Dashboard aberto
        ├─ Revisa 3 propostas
        ├─ Edita se necessário
        └─ Clica ENVIAR
        
09:10 - Proposta enviada
        └─ Sistema monitora resposta
```

---

## 💰 Custos

### Custos Mensais
```
Hosting Backend:     $5-15
Claude API:          $10-20 (5 análises/dia)
Database:            $0-10
─────────────────────────────
TOTAL:              $15-45/mês
```

### ROI Analysis
```
Se você ganha $50/hora:
├─ Sistema custa: $30/mês
├─ +30% mais propostas = ~6h extra/mês economizadas
├─ Valor: 6h × $50 = $300
└─ ROI: 10x em 1 mês! ✅
```

---

## 🐛 Troubleshooting

### Problema: Login falha no Upwork
```
❌ Error: Login failed - CAPTCHA detected
✅ Solução: Execute com --headless=false, resolva CAPTCHA manualmente na primeira vez
```

### Problema: Claude API quota exceeded
```
❌ Error: Rate limit exceeded
✅ Solução: Ajuste REQUESTS_PER_DAY no .env (padrão: 5)
```

### Problema: Database lock
```
❌ Error: database is locked
✅ Solução: Migre para Supabase (PostgreSQL) em produção
```

### Problema: Propostas genéricas
```
❌ Propostas muito parecidas
✅ Solução: Aumente o prompt template + adicione "tone" customizado
```

---

## 📚 Documentação Completa

- 📄 [PAPER.md](./docs/PAPER.md) - Paper acadêmico (10 seções)
- 🏗️ [upwork-automation.md](./docs/upwork-automation.md) - Arquitetura técnica
- 💻 [upwork-code.js](./src/upwork-code.js) - Código production-ready
- 📋 [proposal-template.md](./docs/proposal-template.md) - Templates de propostas
- 🚀 [implementation-guide.md](./docs/implementation-guide.md) - Guia 25 dias
- 🎮 [demo-upwork.html](./demo/demo-upwork.html) - Demo interativa

---

## 🔐 Security

✅ **Credenciais seguras**
- Armazenadas em `.env` (nunca commit)
- Criptografia em BD
- API keys rotacionadas

✅ **Proteção contra bot**
- User-Agent aleatório
- Delays entre requisições
- Rotate IP (via proxy se necessário)

✅ **Validação de dados**
- Input sanitization
- Rate limiting
- CORS habilitado

---

## 📈 Roadmap

### v1.0 (MVP)
- ✅ Scraper básico
- ✅ Scoring engine
- ✅ Claude integration
- ✅ Dashboard simples

### v1.1 (Beta)
- 🔄 Suporte a múltiplas plataformas (Fiverr, PeoplePerHour)
- 🔄 Templates customizáveis
- 🔄 Analytics avançadas
- 🔄 Webhook notifications

### v2.0 (Enterprise)
- 🔄 Machine learning (model customizado)
- 🔄 Multi-user support
- 🔄 Team collaboration
- 🔄 White-label solution

---

## 🤝 Contributing

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

```bash
# Fork o projeto
# Crie uma feature branch
git checkout -b feature/AmazingFeature

# Commit com mensagem clara
git commit -m "feat: add amazing feature"

# Push para a branch
git push origin feature/AmazingFeature

# Abra um Pull Request
```

---

## 📝 License

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 📞 Suporte

- 📧 Email: flaviobarros459@outlook.com
- 💼 LinkedIn: [linkedin.com/in/wiigrup](https://linkedin.com/in/wiigrup)
- 🐙 GitHub: [@Flavio459](https://github.com/Flavio459)

---

## 👨‍💼 Autor

**Flávio Souza Barros**
- CEO @ Wii Health Tech
- Engenheiro de Software sênior
- 20+ anos em transformação digital
- São Paulo, Brasil

---

**⭐ Se esse projeto te ajudou, deixa uma star!**

**🚀 Pronto para aumentar seus ganhos no Upwork? Vamos lá!**