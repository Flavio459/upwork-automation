import EmailService from './services/email-service';
import EmailParser from './services/email-parser';
import ScoringEngine from '../../services/scoring-engine';
import { UpworkBrowserEnricher } from './services/upwork-scraper';
import OpportunityDatabase from './services/database';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

function parseHeadlessFlag(): boolean {
    const value = process.env.UPWORK_HEADLESS;

    if (!value) {
        return false;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

// Profile Configuration
const USER_PROFILE = {
    skills: [
        'Python', 'JavaScript', 'TypeScript', 'API REST', 'SQL',
        'AI', 'LLM', 'Claude', 'Vertex', 'Gemini',
        'n8n', 'Automation', 'Integration', 'Workflow', 'Document Processing',
        'Real Estate', 'Property Tech', 'Backoffice'
    ],
    avgRate: 60,
    minBudget: 500,
    yearsExperience: 20,
    keywords: [
        'AI', 'LLM', 'Chatbot', 'Automation', 'API Integration', 'n8n',
        'Workflow', 'Document Processing', 'MVP',
        'Real Estate', 'Property Tech', 'Data Pipeline'
    ]
};

const SCORING_WEIGHTS = {
    skillMatch: 0.35,
    scopeClarity: 0.20,
    clientReputation: 0.20,
    roiTime: 0.15,
    impactPotential: 0.10
};

async function main() {
    console.log('🚀 Upwork Automation (legacy email + AI triage) iniciado...');

    if (!fs.existsSync('credentials.json')) {
        console.error('❌ Falta: credentials.json (Google Cloud OAuth2)');
        return;
    }

    const emailService = new EmailService();
    const parser = new EmailParser();
    const db = new OpportunityDatabase();

    // PRINCIPLE: OpenClaw Architecture
    // Este script agora funciona como uma *Skill de Triagem*. O processamento LLM pesado
    // (Geração de Proposta) será feito pelo agente pai (Flavius/Pico-Open) via banco de dados ou payload JSON.
    try {
        await db.initialize();
        await emailService.initialize();

        const rawEmails = await emailService.fetchNewOpportunities();
        console.log(`📨 Inbox: ${rawEmails.length} novos alertas de opportunity.\n`);

        const scoringEngine = new ScoringEngine(USER_PROFILE, SCORING_WEIGHTS);

        for (const email of rawEmails) {
            const opportunity = parser.parseEmail(email.body, email.subject);

            if (!opportunity) {
                // PRINCIPLE: Observability (Log o ignore)
                console.log(`⬜ Ignorado (Parser falhou ou irrelevante): ${email.subject}`);
                continue;
            }

            // 1. Scoring (Cheap Filter)
            const score = scoringEngine.scoreOpportunity(opportunity);

            if (score.recommendation === 'REJEITAR') {
                // PRINCIPLE: Observability (Why rejected?)
                console.log(`🔴 Rejeitado: ${opportunity.title}`);
                console.log(`   Motivo: ${score.rejectionReason || 'Score baixo (' + score.totalScore + ')'}`);
                await db.saveOpportunity({ ...opportunity, score, emailId: email.id, status: 'REJECTED' });
                continue;
            }

            // 2. Playwright Stealth: Enriquecimento de Dados
            // Se o score for positivo, não aceitamos apenas o E-mail. Mandamos o robô ler a página real
            // para fugir das omissões do e-mail do Upwork.
            const browserEnricher = new UpworkBrowserEnricher({
                headless: parseHeadlessFlag()
            });
            const enrichedData = await browserEnricher.enrichOpportunityContext(opportunity.url);

            // 3. Persistir para OpenClaw (Delegation)
            // A opportunity aprovada + dados da página real são salvos.
            const finalOpportunityData = {
                ...opportunity,
                score,
                emailId: email.id,
                status: 'PENDING_ANALYSIS',
                clientHistory: enrichedData.clientHistory,
                fullDescription: enrichedData.fullDescription || opportunity.description
            };

            await db.saveOpportunity(finalOpportunityData);
            
            console.log(`   ✅ Opportunity persistida no SQLite. Aguardando processamento LLM pelo OpenClaw.`);
            console.log(JSON.stringify({ event: 'OPPORTUNITY_READY_FOR_AI', opportunityId: email.id, title: opportunity.title }));
        }

    } catch (error) {
        console.error('❌ Erro de Execução:', error);
    } finally {
        await db.close();
    }
}

main();
