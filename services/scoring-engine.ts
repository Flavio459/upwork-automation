interface ScoringWeights {
    skillMatch: number;
    scopeClarity: number;
    clientReputation: number;
    roiTime: number;
    impactPotential: number;
}

interface ScoringResult {
    totalScore: number;
    breakdown: Record<string, number>;
    recommendation: 'ACEITAR' | 'ANALISAR' | 'REJEITAR';
    hardFilterReject?: boolean;
    rejectionReason?: string;
}

class ScoringEngine {
    private userProfile: any;
    private weights: ScoringWeights;

    constructor(userProfile: any, weights: ScoringWeights) {
        this.userProfile = userProfile;
        this.weights = weights;
    }

    scoreOpportunity(opportunity: any): ScoringResult {
        // 2) Hard filters
        const rejection = this.checkHardFilters(opportunity);
        if (rejection) {
            return {
                totalScore: 0,
                breakdown: {},
                recommendation: 'REJEITAR',
                hardFilterReject: true,
                rejectionReason: rejection
            };
        }

        const scores = {
            skillMatch: this.calculateSkillMatch(opportunity),
            scopeClarity: this.calculateScopeClarity(opportunity),
            clientReputation: 50, // Conservador: neutro para e-mail
            roiTime: this.calculateROITime(opportunity),
            impactPotential: this.estimateImpact(opportunity)
        };

        const totalScore =
            (scores.skillMatch * this.weights.skillMatch) +
            (scores.scopeClarity * this.weights.scopeClarity) +
            (scores.clientReputation * this.weights.clientReputation) +
            (scores.roiTime * this.weights.roiTime) +
            (scores.impactPotential * this.weights.impactPotential);

        let recommendation: 'ACEITAR' | 'ANALISAR' | 'REJEITAR' = 'ANALISAR';
        if (totalScore >= 75) recommendation = 'ACEITAR';
        else if (totalScore < 50) recommendation = 'REJEITAR';

        return {
            totalScore: Math.round(totalScore),
            breakdown: scores,
            recommendation
        };
    }

    private checkHardFilters(opportunity: any): string | null {
        const budgetVal = this.extractBudget(opportunity.budget);
        if (budgetVal > 0 && budgetVal < (this.userProfile.minBudget || 500)) return `Budget (${opportunity.budget}) < Min`;

        const skillScore = this.calculateSkillMatch(opportunity);
        if (skillScore < 40) return `Fit Técnico Baixo (${Math.round(skillScore)}%)`;

        return null; // Aprovado
    }

    private calculateSkillMatch(opportunity: any): number {
        const text = (opportunity.title + ' ' + (opportunity.description || '')).toLowerCase();
        const keywords = this.userProfile.keywords || ['ai', 'python'];
        let matches = 0;
        const primary = ['ai', 'llm', 'automation', 'n8n', 'python'];

        keywords.forEach((kw: string) => {
            if (text.includes(kw.toLowerCase())) matches += primary.includes(kw.toLowerCase()) ? 2 : 1;
        });
        return Math.min(matches * 10, 100);
    }

    private calculateScopeClarity(opportunity: any): number {
        if (!opportunity.description) return 0;
        let score = 50;
        if (opportunity.description.length > 500) score += 20;
        if (opportunity.description.includes('- ') || opportunity.description.includes('• ')) score += 15;
        return Math.min(Math.max(score, 0), 100);
    }

    private calculateROITime(opportunity: any): number {
        const budgetVal = this.extractBudget(opportunity.budget);
        if (budgetVal === 0) return 50;
        // Simplificado: Se for Hourly, assume $35 média. Se Fixed, assume projeto 20h.
        let hourly = opportunity.opportunityType === 'Hourly' ? 35 : budgetVal / 20;
        return Math.min((hourly / (this.userProfile.avgRate || 60)) * 100, 100);
    }

    private estimateImpact(opportunity: any): number {
        const words = ['startup', 'long term', 'equity', 'lead'];
        let score = 40;
        const text = (opportunity.description || '').toLowerCase();
        words.forEach(w => { if (text.includes(w)) score += 10; });
        return Math.min(score, 100);
    }

    private extractBudget(str: string): number {
        if (!str || str.includes('Negotiable')) return 0;
        const matches = str.replace(/,/g, '').match(/\d+/g);
        return matches ? Math.max(...matches.map(n => parseInt(n))) : 0;
    }
}

export default ScoringEngine;
