# Arquitetura: Sistema de Pesquisa e Análise Automática de Oportunidades no Upwork

> [!IMPORTANT]
> Este documento é contexto histórico/arquitetural. Ele descreve uma versão anterior do sistema e nao define o escopo ativo deste vault.
> Referencias como `scoring engine` e os nomes de projetos antigos devem ser lidas como legado ou benchmark, nao como diretriz operacional atual.

## 📋 Visão Geral

Sistema automatizado que:
1. **Pesquisa** oportunidades no Upwork baseado no perfil do usuário
2. **Avalia** oportunidades com scoring inteligente (0-100)
3. **Seleciona** as 3 melhores oportunidades
4. **Analisa** requisitos e elabora proposta completa
5. **Salva** localmente (sem enviar automaticamente)
6. **Monitora** respostas manualmente supervisionadas

---

## 🏗️ Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    UPWORK AUTOMATION SYSTEM                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Browser-First│  │   Feed       │  │   AI         │      │
│  │  (Chromium)  │──│ Browser Agent │──│   Analyzer   │      │
│  │              │  │  (Profile)   │  │  & Scorer    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           ▼                                 │
│                  ┌──────────────────┐                       │
│                  │   Database       │                       │
│                  │   (SQLite/Supabase) │                    │
│                  └──────────────────┘                       │
│                           │                                 │
│        ┌──────────────────┼──────────────────┐              │
│        ▼                  ▼                  ▼              │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐          │
│  │ Opps     │      │ Proposals│      │ Responses│          │
│  │Collected │      │ Draft    │      │ Monitor  │          │
│  └──────────┘      └──────────┘      └──────────┘          │
│        │                  │                  │              │
│        └──────────────────┼──────────────────┘              │
│                           ▼                                 │
│              ┌─────────────────────┐                        │
│              │   Dashboard UI      │                        │
│              │   + Manual Review   │                        │
│              │   + Send Control    │                        │
│              └─────────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Stack Técnico Recomendado

### Backend
- **Node.js + TypeScript** (melhor para browser automation)
- **Playwright/Puppeteer** (headless browser automation)
- **LLM API** (Claude/OpenAI para análise)
- **SQLite** (local) ou **Supabase** (cloud + sync)

### Frontend
- **React + TypeScript**
- **TailwindCSS** (UI)
- **TanStack Query** (state management)

### Infraestrutura
- **GitHub Actions** (scheduler para browser automation)
- **Vercel/Railway** (deploy backend)
- **Cloudflare Workers** (optional, para requests proxied)

---

## 📊 Fluxo de Dados Detalhado

### Fase 1: Configuração Inicial

```javascript
// 1. Upload do perfil Upwork
{
  userId: "user_123",
  upworkProfile: {
    url: "https://www.upwork.com/freelancers/~your-profile",
    skills: ["React", "Node.js", "Python"],
    categories: ["Web Development", "Full Stack"],
    experience: {
      yearsExperience: 5,
      languages: ["Portuguese", "English", "Spanish"]
    },
    opportunityHistory: [
      { title: "E-commerce", category: "Web Dev", value: 5000 },
      { title: "API Development", category: "Backend", value: 3000 }
    ]
  },
  // Critérios de busca
  searchCriteria: {
    minBudget: 500,
    maxBudget: 10000,
    minRating: 4.5,
    excludeKeywords: ["cheap", "no budget"],
    preferredTypes: ["fixed-price", "hourly"],
    minWords: 100 // descrição mínima
  },
  // Peso de scoring
  scoringWeights: {
    skillMatch: 0.35,      // 35% - aderência de skills
    budgetAlign: 0.20,     // 20% - orçamento apropriado
    clientHistory: 0.15,   // 15% - histórico do cliente
    projectComplexity: 0.15, // 15% - alinhamento complexidade
    description: 0.10,     // 10% - qualidade descrição
    timeframe: 0.05        // 5% - timeline
  }
}
```

### Fase 2: Navegação de Oportunidades

```javascript
// Usando Playwright (mais confiável que Puppeteer para Upwork)
class UpworkOpportunityBrowserAgent {
  async collectOpportunities(profile) {
    // 1. Fazer login
    await this.login(profile.email, profile.password);
    
    // 2. Navegar para o feed "best-matches"
    await page.goto('https://www.upwork.com/nx/find-work/best-matches');
    
    // 3. Extrair dados (com retry para CAPTCHA)
    const opportunities = await this.extractOpportunitiesWithCaptchaHandling();
    
    // 4. Guardar estrutura
    return opportunities.map(opportunity => ({
      opportunityId: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      budget: opportunity.budget,
      category: opportunity.category,
      client: {
        rating: opportunity.clientRating,
        projectsPosted: opportunity.projectsPosted,
        hiredFreelancers: opportunity.hiredFreelancers,
        history: opportunity.paymentHistory
      },
      requirements: this.extractRequirements(opportunity.description),
      timeline: opportunity.timeline,
      experience_level: opportunity.experienceLevel,
      raw_html: opportunity.html // para análise posterior
    }));
  }
}
```

### Fase 3: Scoring Inteligente

```javascript
// Scoring Algorithm
class OpportunityScoringEngine {
  calculateScore(opportunity, userProfile, weights) {
    const scores = {
      // 1. SKILL MATCH (0-100)
      skillMatch: this.calculateSkillMatch(opportunity, userProfile),
      
      // 2. BUDGET ALIGNMENT (0-100)
      budgetAlign: this.calculateBudgetAlignment(
        opportunity.budget,
        userProfile.avgRate,
        opportunity.timeline
      ),
      
      // 3. CLIENT TRUSTWORTHINESS (0-100)
      clientHistory: this.evaluateClientHistory(opportunity.client),
      
      // 4. PROJECT COMPLEXITY MATCH (0-100)
      complexity: this.matchComplexityToExperience(
        opportunity.description,
        userProfile.experience
      ),
      
      // 5. DESCRIPTION QUALITY (0-100)
      descriptionQuality: this.analyzeDescriptionQuality(opportunity.description),
      
      // 6. TIMELINE FEASIBILITY (0-100)
      timeframe: this.evaluateTimeframe(opportunity.timeline, userProfile.availability)
    };
    
    // Calcular score weighted
    const finalScore = Object.entries(scores).reduce((acc, [key, value]) => {
      return acc + (value * weights[key]);
    }, 0);
    
    return {
      totalScore: finalScore,
      breakdown: scores,
      recommendation: finalScore >= 75 ? "HIGH" : 
                     finalScore >= 50 ? "MEDIUM" : "LOW"
    };
  }
  
  // Exemplo: Skill Match
  calculateSkillMatch(opportunity, userProfile) {
    const opportunitySkills = this.extractSkillsFromDescription(opportunity.description);
    const userSkills = userProfile.skills;
    
    const matches = opportunitySkills.filter(skill => 
      userSkills.some(userSkill => 
        this.isSimilarSkill(skill, userSkill)
      )
    );
    
    return (matches.length / opportunitySkills.length) * 100;
  }
  
  // Exemplo: Budget Alignment
  calculateBudgetAlignment(budget, userAvgRate, timeline) {
    const estimatedHours = this.estimateHours(timeline);
    const minimumExpected = userAvgRate * estimatedHours * 1.2; // +20% buffer
    const score = (budget / minimumExpected) * 100;
    
    return Math.min(100, score); // cap at 100
  }
}
```

### Fase 4: Seleção e Análise dos Top 3

```javascript
class ProposalGenerator {
  async generateProposalFor(opportunity, userProfile) {
    // 1. Análise profunda com LLM
    const analysis = await this.analyzeOpportunityWithLLM(opportunity);
    
    return {
      opportunityId: opportunity.opportunityId,
      score: opportunity.score,
      timestamp: new Date(),
      status: "DRAFT", // DRAFT, SENT, WAITING, WON, LOST
      
      // 2. ANÁLISE DE REQUISITOS
      analysis: {
        mainRequirements: analysis.requirements,
        technicalStack: analysis.technologies,
        potentialChallenges: analysis.challenges,
        clientExpectations: analysis.expectations
      },
      
      // 3. PROPOSTA
      proposal: {
        title: analysis.suggestedTitle,
        coverLetter: analysis.suggestedCoverLetter,
        highlights: [
          `${userProfile.yearsExperience}+ years in ${analysis.mainTech}`,
          `Successfully delivered ${userProfile.successfulProjects} similar projects`,
          `Average client rating: ${userProfile.avgRating}/5`
        ]
      },
      
      // 4. ESTIMATIVA TÉCNICA
      estimation: {
        estimatedHours: analysis.estimatedHours,
        breakdownByPhase: {
          discovery: analysis.discoveryHours,
          development: analysis.devHours,
          testing: analysis.testingHours,
          deployment: analysis.deploymentHours
        },
        buffer: analysis.bufferPercentage // 15-20%
      },
      
      // 5. PROPOSTA FINANCEIRA
      financialProposal: {
        budgetRequested: analysis.budgetRecommendation,
        rationale: analysis.budgetRationale,
        paymentSchedule: [
          { milestone: "50%", trigger: "Project kick-off & architecture" },
          { milestone: "30%", trigger: "Core features completed" },
          { milestone: "20%", trigger: "Testing & deployment" }
        ],
        comparison: {
          clientBudget: opportunity.budget,
          difference: opportunity.budget - analysis.budgetRecommendation,
          recommendation: this.getBudgetRecommendation(opportunity.budget, analysis.budgetRecommendation)
        }
      },
      
      // 6. RECURSOS NECESSÁRIOS
      resources: {
        technologies: analysis.technologies,
        tools: analysis.requiredTools,
        potentialThirdParties: analysis.thirdPartyServices,
        estimatedCost: analysis.costOfResources
      },
      
      // 7. ESTRUTURA VISUAL DA PROPOSTA
      proposalStructure: {
        section1: "Executive Summary",
        section2: "Understanding of Requirements",
        section3: "Proposed Solution & Approach",
        section4: "Timeline & Milestones",
        section5: "Investment & Payment Terms",
        section6: "Why Choose Us",
        section7: "Next Steps"
      }
    };
  }
}
```

---

## 💾 Estrutura de Banco de Dados

```sql
-- Opportunities Collected
CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  budget DECIMAL,
  category TEXT,
  client_id TEXT,
  client_rating DECIMAL,
  requirements TEXT, -- JSON
  timeline TEXT,
  experience_level TEXT,
  score DECIMAL,
  collected_at TIMESTAMP,
  extracted_data JSON,
  status TEXT DEFAULT 'NEW' -- NEW, SCORED, TOP_3, ANALYZED, PROPOSED
);

-- User Profile
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  upwork_url TEXT,
  skills TEXT, -- JSON array
  avg_rate DECIMAL,
  years_experience INT,
  avg_rating DECIMAL,
  successful_projects INT,
  portfolio_projects TEXT, -- JSON
  search_criteria JSON,
  scoring_weights JSON,
  last_updated TIMESTAMP
);

-- Proposals Draft
CREATE TABLE proposals (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id),
  status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, WAITING_RESPONSE, WON, LOST
  analysis JSON,
  proposal_text TEXT,
  estimation JSON,
  financial_proposal JSON,
  resources JSON,
  created_at TIMESTAMP,
  sent_at TIMESTAMP NULL,
  response_received_at TIMESTAMP NULL,
  response_text TEXT,
  final_status TEXT,
  notes TEXT
);

-- Monitoring
CREATE TABLE monitoring (
  id TEXT PRIMARY KEY,
  proposal_id TEXT REFERENCES proposals(id),
  check_date TIMESTAMP,
  client_viewed BOOLEAN,
  responses_count INT,
  last_message TEXT,
  status_change TEXT,
  notes TEXT
);
```

---

## 🤖 Componentes Principais

### 1. Browser-First (Playwright)

```javascript
// config/browser.config.ts
export const browserConfig = {
  headless: false, // Visualizar o que está fazendo
  timeout: 30000,
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--start-maximized'
  ],
  proxies: process.env.PROXY_LIST?.split(','), // Rotação de IPs
  blockResourceTypes: ['image', 'stylesheet', 'font'], // Mais rápido
};
```

### 2. LLM Integration (Claude/GPT-4)

```javascript
// services/llm-analyzer.ts
class LLMOpportunityAnalyzer {
  async analyzeOpportunity(opportunityDescription, userProfile) {
    const prompt = `
Analize this Upwork opportunity posting and provide a structured analysis:

JOB DESCRIPTION:
${opportunityDescription}

USER PROFILE:
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.yearsExperience} years
- Avg Rate: $${userProfile.avgRate}/hour

Please provide a JSON response with:
1. Main requirements (array)
2. Technologies needed (array)
3. Estimated hours to complete
4. Potential challenges
5. Recommended budget
6. Suggested proposal opening
7. Key selling points for this user

Format your response as valid JSON only.
    `;
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });
    
    return JSON.parse(response.content[0].text);
  }
}
```

### 3. Scheduler (Cron)

```javascript
// services/scheduler.ts
import cron from 'node-cron';

export class OpportunityScheduler {
  static initiate() {
    // Executar automação de navegador a cada 4 horas
    cron.schedule('0 */4 * * *', async () => {
      console.log('🔄 Starting browser automation run...');
      await collectUpworkOpportunities();
      await scoreAndRank();
      await notifyUser();
    });
    
    // Monitorar respostas diariamente
    cron.schedule('0 9 * * *', async () => {
      console.log('📊 Checking for responses...');
      await monitorProposalResponses();
    });
  }
}
```

### 4. Dashboard UI

```jsx
// components/dashboard.tsx
export function Dashboard() {
  const [opportunities, setOpportunities] = useState<OpportunityWithScore[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithScore | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  return (
    <div className="flex gap-6 p-6">
      {/* Left Panel: Opportunities Collected */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">🔍 Opportunities Collected Today</h2>
        <OpportunitiesList 
          opportunities={opportunities.slice(0, 3)}
          onSelect={setSelectedOpportunity}
        />
      </div>
      
      {/* Center Panel: Opportunity Details & Scoring */}
      <div className="flex-1">
        {selectedOpportunity && (
          <>
            <h3 className="text-xl font-bold mb-2">{selectedOpportunity.title}</h3>
            <ScoreBreakdown score={selectedOpportunity.score} />
            <RequirementsAnalysis opportunity={selectedOpportunity} />
          </>
        )}
      </div>
      
      {/* Right Panel: Draft Proposals */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">📝 Draft Proposals</h2>
        <ProposalsList 
          proposals={proposals}
          onReview={(id) => reviewProposal(id)}
          onSend={(id) => sendProposal(id)}
        />
      </div>
    </div>
  );
}
```

---

## 🔐 Segurança e Boas Práticas

### Autenticação Upwork
```javascript
// Usar Secure Storage (não hardcoded)
const credentials = {
  email: process.env.UPWORK_EMAIL,
  password: process.env.UPWORK_PASSWORD, // Usar manager de secrets
  2faCode: await prompt('Enter 2FA code') // Manual se necessário
};

// Session Management
class SessionManager {
  async maintainSession(page) {
    // Salvar cookies após login
    const cookies = await page.context().cookies();
    await fs.writeFile('upwork_cookies.json', JSON.stringify(cookies));
    
    // Reusar cookies nas próximas execuções
    await page.context().addCookies(savedCookies);
  }
}
```

### Rate Limiting & Comportamento Humano
```javascript
// Simular comportamento humano
class HumanBehavior {
  async randomDelay(min = 500, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    await page.waitForTimeout(delay);
  }
  
  async randomScroll(page) {
    const scrolls = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < scrolls; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await this.randomDelay();
    }
  }
  
  async mouseMovements(page) {
    // Mover mouse de forma natural
    await page.mouse.move(100, 100);
    await this.randomDelay(100, 500);
    await page.mouse.move(200, 200);
  }
}
```

---

## 🚀 Fluxo de Execução Completo

```
1️⃣  PESQUISA (Automática, a cada 4h)
    └─ Fazer login + pesquisar o feed "best-matches"
    └─ Salvar oportunidades no DB
    └─ Extrair requisitos com regex/AI
    
2️⃣  SCORING (Automático)
    └─ Aplicar scoring engine
    └─ Ranquear por score
    └─ Selecionar TOP 3
    
3️⃣  ANÁLISE PROFUNDA (Automático)
    └─ Chamar LLM para análise completa
    └─ Gerar estimativa técnica
    └─ Calcular proposta financeira
    
4️⃣  DRAFT DE PROPOSTA (Automático)
    └─ Estruturar proposta
    └─ Salvar como DRAFT no DB
    └─ NÃO enviar automaticamente
    
5️⃣  REVISÃO HUMANA (Manual, 1x/dia)
    └─ Usuário acessa dashboard
    └─ Revisa os 3 drafts
    └─ Pode editar conteúdo
    └─ Clica "ENVIAR" manualmente
    
6️⃣  MONITORAMENTO (Automático + Manual)
    └─ Verificar respostas diariamente
    └─ Notificar usuário
    └─ Atualizar status das propostas
```

---

## 📱 Interface de Controle Manual

```
┌─────────────────────────────────────────────────┐
│  UPWORK AUTOMATION DASHBOARD                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  🎯 TOP 3 JOBS TODAY                            │
│  ┌──────────────────────────────────────────┐   │
│  │ 1. React Dashboard - Score: 92/100       │   │
│  │    Budget: $2,000-3,000 | 2-3 weeks      │   │
│  │                                          │   │
│  │    📋 VIEW ANALYSIS | ✏️ EDIT | ✉️ SEND    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 2. Next.js API - Score: 87/100           │   │
│  │    Budget: $1,500-2,000 | 3-4 weeks      │   │
│  │                                          │   │
│  │    📋 VIEW ANALYSIS | ✏️ EDIT | ✉️ SEND    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 3. Mobile App - Score: 81/100            │   │
│  │    Budget: $3,000-5,000 | 4-6 weeks      │   │
│  │                                          │   │
│  │    📋 VIEW ANALYSIS | ✏️ EDIT | ✉️ SEND    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  📊 MONITORED PROPOSALS                         │
│  ┌──────────────────────────────────────────┐   │
│  │ ✅ Sent 2 days ago - 1 response          │   │
│  │ ⏳ Waiting - 5 days                       │   │
│  │ ❌ Rejected - 3 days ago                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Implementação Step-by-Step

### Step 1: Setup Inicial
```bash
npm init -y
npm install playwright @anthropic-ai/sdk sqlite3 express cors dotenv
npm install -D typescript ts-node @types/node
```

### Step 2: Autenticação e Navegação
- Implementar login com Playwright
- Salvar cookies para reutilização
- Implementar CAPTCHA detection e retry

### Step 3: Scoring Engine
- Criar scoring weights configurável
- Testar com oportunidades reais
- Calibrar pesos conforme feedback

### Step 4: LLM Integration
- Integrar Claude API
- Testar análise de requisitos
- Gerar propostas estruturadas

### Step 5: Dashboard UI
- Montar interface React
- Integrar com backend API
- Adicionar funcionalidades de edição

### Step 6: Deploy
- Deploy backend (Railway/Vercel)
- Deploy frontend (Vercel)
- Setup GitHub Actions para scheduler

---

## ⚠️ Considerações Importantes

1. **Termos de Serviço Upwork**: Verifique se browser automation é permitido
2. **Rate Limiting**: Implementar delays para não sobrecarregar Upwork
3. **2FA**: Sistema para entrada manual de código 2FA quando necessário
4. **Cookies Expiram**: Implementar refresh automático de session
5. **HTML Changes**: Upwork pode mudar HTML - usar retry com update de selectors
6. **Budget**: Custos com LLM API (Claude) - ~$0.10-0.50 por análise

---

## 📈 Próximos Passos

1. ✅ Definir scoring weights baseado em seu histórico
2. ✅ Configurar credenciais Upwork seguramente
3. ✅ Testar browser automation com 10-20 oportunidades reais
4. ✅ Validar scoring vs. suas melhores oportunidades passadas
5. ✅ Ajustar pesos de scoring conforme aprendizado
6. ✅ Deploy em produção com monitoramento

---

## 💡 Otimizações Futuras

- [ ] Machine Learning para aprender scoring dinamicamente
- [ ] Integração com Google Workspace (salvar propostas em Docs)
- [ ] Notificações push/email quando top oportunidades aparecem
- [ ] Análise de sentimento nas respostas dos clientes
- [ ] Histórico de conversão (qual tipo de proposta resulta em mais wins)
- [ ] A/B testing de diferentes abordagens de proposta
- [ ] Integração com calendário para timeline planning

---

**Pronto para começar? Qual é o seu próximo passo?**
