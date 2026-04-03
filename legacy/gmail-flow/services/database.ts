import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';

class OpportunityDatabase {
    private db: Database | null = null;
    private dbPath: string;

    constructor() {
        this.dbPath = path.resolve(process.cwd(), 'upwork_opportunities.db');
    }

    async initialize(): Promise<void> {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.createTables();
    }

    private async createTables(): Promise<void> {
        // Tabela Opportunities adaptada para E-mail (menos campos obrigatórios do cliente)
        await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY, -- Pode ser o URL hash ou ID do email
        title TEXT NOT NULL,
        description TEXT,
        budget TEXT,
        url TEXT,
        opportunity_type TEXT,
        score REAL,
        recommendation TEXT,
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'NEW', -- NEW, PROCESSED, ARCHIVED
        email_id TEXT -- ID da mensagem do Gmail para referência
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        opportunity_id TEXT NOT NULL REFERENCES opportunities(id),
        analysis JSON,
        proposal_text TEXT,
        estimation JSON,
        financial_proposal JSON,
        status TEXT DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }

    async saveOpportunity(opportunity: any): Promise<void> {
        // Usar URL como ID único se possível, senão gerar um hash
        const opportunityId = opportunity.id || Buffer.from(opportunity.url || opportunity.title + Date.now()).toString('base64');

        // Verificar se já existe
        const existing = await this.db!.get('SELECT id FROM opportunities WHERE url = ?', opportunity.url);
        if (existing && opportunity.url) {
            // Já existe, pular
            return;
        }

        const stmt = await this.db!.prepare(`
      INSERT OR REPLACE INTO opportunities
      (id, title, description, budget, url, opportunity_type, score, recommendation, email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        await stmt.run(
            opportunityId,
            opportunity.title,
            opportunity.description,
            opportunity.budget,
            opportunity.url,
            opportunity.opportunityType,
            opportunity.score?.totalScore || 0,
            opportunity.score?.recommendation || 'LOW',
            opportunity.emailId
        );

        await stmt.finalize();
    }

    async saveProposal(proposal: any): Promise<void> {
        const stmt = await this.db!.prepare(`
      INSERT INTO proposals
      (id, opportunity_id, analysis, proposal_text, estimation, financial_proposal, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        await stmt.run(
            proposal.id,
            proposal.opportunityId,
            JSON.stringify(proposal.analysis),
            proposal.proposalText,
            JSON.stringify(proposal.estimation),
            JSON.stringify(proposal.financialProposal),
            'DRAFT'
        );

        await stmt.finalize();
    }

    async getRecentOpportunities(limit: number = 20): Promise<any[]> {
        if (!this.db) return [];
        return await this.db.all('SELECT * FROM opportunities ORDER BY collected_at DESC LIMIT ?', limit);
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
        }
    }
}

export default OpportunityDatabase;
