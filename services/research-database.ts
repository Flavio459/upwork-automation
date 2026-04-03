import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';
import { NicheResearchEvaluation } from './niche-research';

class ResearchDatabase {
    private db: Database | null = null;
    private dbPath: string;

    constructor() {
        this.dbPath = path.resolve(process.cwd(), 'upwork_research.db');
    }

    async initialize(): Promise<void> {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.createTables();
    }

    private async createTables(): Promise<void> {
        await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS niche_research_candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        surface TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        skill_cluster_json TEXT NOT NULL,
        demand_score REAL NOT NULL,
        ticket_min_usd REAL NOT NULL,
        ticket_max_usd REAL NOT NULL,
        competition_pressure_score REAL NOT NULL,
        complexity_pressure_score REAL NOT NULL,
        fit_score REAL NOT NULL,
        speed_to_cash_score REAL NOT NULL,
        estimated_delivery_hours REAL NOT NULL,
        estimated_token_cost_usd REAL NOT NULL,
        estimated_infra_cost_usd REAL NOT NULL,
        estimated_labor_cost_usd REAL NOT NULL,
        expected_negotiated_value_usd REAL NOT NULL,
        estimated_delivery_cost_usd REAL NOT NULL,
        margin_usd REAL NOT NULL,
        margin_ratio REAL NOT NULL,
        total_score REAL NOT NULL,
        recommendation TEXT NOT NULL,
        hard_reject_reason TEXT,
        case_strategy TEXT NOT NULL,
        evidence_json TEXT,
        source_urls_json TEXT,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }

    async saveEvaluations(evaluations: NicheResearchEvaluation[]): Promise<void> {
        if (!this.db) {
            throw new Error('Research database is not initialized.');
        }

        const stmt = await this.db.prepare(`
      INSERT OR REPLACE INTO niche_research_candidates (
        id,
        name,
        surface,
        category,
        subcategory,
        skill_cluster_json,
        demand_score,
        ticket_min_usd,
        ticket_max_usd,
        competition_pressure_score,
        complexity_pressure_score,
        fit_score,
        speed_to_cash_score,
        estimated_delivery_hours,
        estimated_token_cost_usd,
        estimated_infra_cost_usd,
        estimated_labor_cost_usd,
        expected_negotiated_value_usd,
        estimated_delivery_cost_usd,
        margin_usd,
        margin_ratio,
        total_score,
        recommendation,
        hard_reject_reason,
        case_strategy,
        evidence_json,
        source_urls_json,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        try {
            for (const evaluation of evaluations) {
                await stmt.run(
                    evaluation.id,
                    evaluation.name,
                    evaluation.surface,
                    evaluation.category,
                    evaluation.subcategory || null,
                    JSON.stringify(evaluation.skillCluster),
                    evaluation.demandScore,
                    evaluation.ticketRangeUsd.minUsd,
                    evaluation.ticketRangeUsd.maxUsd,
                    evaluation.competitionPressureScore,
                    evaluation.complexityPressureScore,
                    evaluation.fitScore,
                    evaluation.speedToCashScore,
                    evaluation.estimatedDeliveryHours,
                    evaluation.estimatedTokenCostUsd,
                    evaluation.estimatedInfraCostUsd,
                    evaluation.estimatedLaborCostUsd,
                    evaluation.expectedNegotiatedValueUsd,
                    evaluation.estimatedDeliveryCostUsd,
                    evaluation.marginUsd,
                    evaluation.marginRatio,
                    evaluation.totalScore,
                    evaluation.recommendation,
                    evaluation.hardRejectReason || null,
                    evaluation.caseStrategy,
                    JSON.stringify(evaluation.evidence || []),
                    JSON.stringify(evaluation.sourceUrls || []),
                    evaluation.notes || null
                );
            }
        } finally {
            await stmt.finalize();
        }
    }

    async getEvaluations(limit: number = 50): Promise<any[]> {
        if (!this.db) {
            return [];
        }

        return this.db.all(
            'SELECT * FROM niche_research_candidates ORDER BY total_score DESC, updated_at DESC LIMIT ?',
            limit
        );
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}

export default ResearchDatabase;
