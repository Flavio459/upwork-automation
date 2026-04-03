import EmailParser from '../gmail-flow/services/email-parser';
import ScoringEngine from '../../services/scoring-engine';
import * as dotenv from 'dotenv';

dotenv.config();

// MOCK DATA
const MOCK_EMAILS = [
    {
        id: 'msg_123',
        subject: 'Opportunity Match - Senior Python/AI Automation Expert Needed',
        body: `
            Hi there,
            Here is a new opportunity that matches your profile:
            
            <b>Senior AI Automation Engineer (n8n, Python, LLM)</b>
            <br>
            <b>Budget:</b> $1,500.00
            <br>
            <b>Description:</b>
            We are a Real Estate Tech startup looking for a Senior Engineer to build an end-to-end lease processing pipeline.
            Must have experience with Google Vertex AI, Claude, and n8n workflows.
            The goal is to automatically extract data from PDF leases and update our CRM.
            This is a long-term opportunity for the right candidate.
            <br>
            <a href="https://www.upwork.com/jobs/~0123456789">View Opportunity</a>
        `
    },
    {
        id: 'msg_456',
        subject: 'Opportunity Match - Fix my printer script',
        body: `
            Hi,
            New opportunity match:
            
            <b>Need python script help</b>
            <br>
            <b>Budget:</b> $20.00
            <br>
            <b>Description:</b>
            I have a script that is not working. Need quick fix.
        `
    }
];

// Profile Configuration (Same as main.ts)
const USER_PROFILE = {
    skills: ['Python', 'JavaScript', 'TypeScript', 'API REST', 'SQL', 'AI', 'LLM', 'n8n', 'Automation', 'Real Estate'],
    avgRate: 60, minBudget: 500, yearsExperience: 20,
    keywords: ['AI', 'LLM', 'Automation', 'n8n', 'Real Estate']
};
const SCORING_WEIGHTS = { skillMatch: 0.35, scopeClarity: 0.20, clientReputation: 0.20, roiTime: 0.15, impactPotential: 0.10 };

async function runSimulation() {
    console.log('🧪 Starting Simulation Mode...\n');

    const parser = new EmailParser();
    const scoringEngine = new ScoringEngine(USER_PROFILE, SCORING_WEIGHTS);

    // Simulando o contexto de ambiente
    console.log('🔗 Modo de Integração OpenClaw Ativo: O LLM será acionado externamente.');

    // Processar
    for (const email of MOCK_EMAILS) {
        console.log(`\n📨 Parsing Email: "${email.subject}"`);
        const opportunity = parser.parseEmail(email.body, email.subject);

        if (!opportunity) { console.log('❌ Failed to parse'); continue; }

        console.log(`   🔹 Opportunity: ${opportunity.title} | Budget: ${opportunity.budget}`);

        const score = scoringEngine.scoreOpportunity(opportunity);
        console.log(`   🔸 Score: ${score.totalScore}/100 [${score.recommendation}]`);
        if (score.rejectionReason) console.log(`      ⛔ Rejection: ${score.rejectionReason}`);

        if (score.recommendation !== 'REJEITAR') {
            console.log('   🤖 Triggering OpenClaw Delegation...');
            console.log(`      > Payload pronto: \${JSON.stringify({ event: 'OPPORTUNITY_READY_FOR_AI', opportunityId: email.id })}`);
        }
    }
}

runSimulation();
