export type ResearchSurface = 'Talent Marketplace' | 'Project Catalog' | 'Both';

export type CaseStrategy = 'real' | 'hybrid';

export type ResearchRecommendation = 'PURSUE' | 'WATCH' | 'REJECT';

export interface ResearchWeights {
    demand: number;
    ticket: number;
    competition: number;
    complexity: number;
    fit: number;
    speed: number;
    economics: number;
}

export interface ResearchAssumptions {
    internalHourlyCostUsd: number;
    minimumMarginRatio: number;
    minimumAiExecutabilityScore: number;
    pricingMode: 'market' | 'productized';
    weights: ResearchWeights;
}

export interface TicketRange {
    minUsd: number;
    maxUsd: number;
}

export interface NicheResearchCandidate {
    id: string;
    name: string;
    surface: ResearchSurface;
    category: string;
    subcategory?: string;
    skillCluster: string[];
    demandScore: number;
    ticketRangeUsd: TicketRange;
    competitionPressureScore: number;
    complexityPressureScore: number;
    fitScore: number;
    speedToCashScore: number;
    aiExecutabilityScore?: number;
    estimatedDeliveryHours: number;
    estimatedTokenCostUsd: number;
    estimatedInfraCostUsd?: number;
    estimatedLaborCostUsd?: number;
    internalHourlyCostUsd?: number;
    expectedNegotiatedValueUsd?: number;
    aspirationalStrategicValueUsd?: number;
    caseStrategy: CaseStrategy;
    evidence?: string[];
    sourceUrls?: string[];
    notes?: string;
}

export interface NicheResearchEvaluation extends NicheResearchCandidate {
    expectedNegotiatedValueUsd: number;
    aspirationalStrategicValueUsd: number;
    estimatedLaborCostUsd: number;
    estimatedInfraCostUsd: number;
    estimatedDeliveryCostUsd: number;
    marginUsd: number;
    marginRatio: number;
    ticketScore: number;
    competitionAttractivenessScore: number;
    complexityAttractivenessScore: number;
    unitEconomicsScore: number;
    aiExecutabilityScore: number;
    totalScore: number;
    recommendation: ResearchRecommendation;
    hardRejectReason?: string;
}

export interface ResearchInputFile {
    assumptions?: Partial<ResearchAssumptions>;
    candidates: NicheResearchCandidate[];
}

export type ResearchHandoffSelectionMode = 'pursue' | 'fallback-first-candidate' | 'no-candidates';

export interface ResearchHandoffPayload {
    generatedAt: string;
    sourcePath: string;
    selectionMode: ResearchHandoffSelectionMode;
    selectionReason: string;
    selectionCount: {
        total: number;
        pursue: number;
        watch: number;
        reject: number;
    };
    identification: {
        lead_id: string;
        source_url: string;
        client_name: string;
        client_language: string;
        internal_language: 'pt-BR';
        offer_fit: 'Core Offer' | 'Adjacency' | 'Reject';
        proposal_status: 'New';
        localized_artifact_status: 'Not Started';
    };
    summary: {
        problem_summary: string;
        budget_range: string;
        fit_initial: string;
        decision_initial: string;
        feasibility_status: 'Go' | 'Go with Constraints' | 'No-Go';
    };
    economicSignals: {
        target_price: string;
        price_floor: string;
        price_floor_basis: string;
        margin_ratio: string;
        expected_value: string;
        estimated_delivery_cost: string;
        estimated_labor_cost: string;
        estimated_infra_cost: string;
        aspirational_strategic_value: string;
    };
    nextTemplates: string[];
    transitionNotes: string[];
    limitations: string[];
    candidateSnapshot?: {
        name: string;
        category: string;
        subcategory: string | null;
        surface: ResearchSurface;
        recommendation: ResearchRecommendation;
        totalScore: number;
        evidence: string[];
        sourceUrls: string[];
        notes: string | null;
    };
}

export const DEFAULT_RESEARCH_WEIGHTS: ResearchWeights = {
    demand: 0.22,
    ticket: 0.12,
    competition: 0.15,
    complexity: 0.13,
    fit: 0.18,
    speed: 0.05,
    economics: 0.15
};

export const DEFAULT_RESEARCH_ASSUMPTIONS: ResearchAssumptions = {
    internalHourlyCostUsd: 25,
    minimumMarginRatio: 0.25,
    minimumAiExecutabilityScore: 90,
    pricingMode: 'market',
    weights: DEFAULT_RESEARCH_WEIGHTS
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function midpoint(range: TicketRange): number {
    return (range.minUsd + range.maxUsd) / 2;
}

function productizedValue(range: TicketRange): number {
    const midpointValue = midpoint(range);
    const floorValue = range.maxUsd * 1.25;
    return Math.max(midpointValue, floorValue);
}

function ticketScoreFromAmount(amountUsd: number): number {
    if (amountUsd <= 0) return 0;
    if (amountUsd < 400) return 10;
    if (amountUsd < 1000) return 45; // Discovery Tier (Entry)
    if (amountUsd < 2500) return 60;
    if (amountUsd < 5000) return 75;
    if (amountUsd < 10000) return 88;
    return 95;
}

function aiExecutabilityScoreFromCandidate(candidate: NicheResearchCandidate): number {
    const text = [candidate.name, candidate.category, candidate.subcategory, candidate.skillCluster.join(' '), candidate.evidence?.join(' '), candidate.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    let score = 50;

    const positiveTerms = [
        ['automation', 18],
        ['workflow', 12],
        ['api', 12],
        ['integration', 10],
        ['architecture', 12],
        ['orchestration', 18],
        ['multi-agent', 18],
        ['discovery', 10],
        ['strategy', 8],
        ['roadmap', 8],
        ['audit', 8],
        ['governance', 8],
        ['compliance', 10],
        ['rag', 15],
        ['vector database', 12],
        ['python', 10],
        ['javascript', 8],
        ['typescript', 8],
        ['llm', 15],
        ['openai', 15],
        ['claude', 15],
        ['chatbot', 10],
        ['backend', 8],
        ['build', 8],
        ['develop', 8],
        ['fix', 6],
        ['debug', 6],
        ['stabilize', 6],
        ['n8n', 10],
        ['make.com', 10],
        ['zapier', 10]
    ] as const;

    const negativeTerms = [
        ['data entry', 35],
        ['virtual assistant', 30],
        ['copywriting', 30],
        ['proofreading', 30],
        ['transcription', 30],
        ['customer support', 25],
        ['social media', 20],
        ['marketing', 18],
        ['seo', 18],
        ['design', 22],
        ['graphic design', 25],
        ['video editing', 25],
        ['sales', 20],
        ['phone', 20],
        ['call', 20],
        ['meeting', 18],
        ['on-site', 30],
        ['in person', 30],
        ['manual', 18],
        ['research', 12]
    ] as const;

    for (const [term, delta] of positiveTerms) {
        if (text.includes(term)) {
            score += delta;
        }
    }

    for (const [term, delta] of negativeTerms) {
        if (text.includes(term)) {
            score -= delta;
        }
    }

    if (/(build|create|automate|integrate|debug|fix|optimize)/i.test(text) && /(llm|api|workflow|automation|python|javascript|typescript)/i.test(text)) {
        score += 8;
    }

    return clamp(score, 0, 100);
}

function chooseRecommendation(totalScore: number, hardRejectReason?: string): ResearchRecommendation {
    if (hardRejectReason) return 'REJECT';
    if (totalScore >= 65) return 'PURSUE';
    if (totalScore >= 45) return 'WATCH';
    return 'REJECT';
}

export class NicheResearchAnalyzer {
    constructor(private readonly assumptions: ResearchAssumptions = DEFAULT_RESEARCH_ASSUMPTIONS) {}

    evaluate(candidate: NicheResearchCandidate): NicheResearchEvaluation {
        const expectedNegotiatedValueUsd =
            candidate.expectedNegotiatedValueUsd ??
            (this.assumptions.pricingMode === 'productized'
                ? productizedValue(candidate.ticketRangeUsd)
                : midpoint(candidate.ticketRangeUsd));
        const aspirationalStrategicValueUsd = candidate.aspirationalStrategicValueUsd ?? 0;
        const estimatedLaborCostUsd =
            candidate.estimatedLaborCostUsd ??
            candidate.estimatedDeliveryHours * (candidate.internalHourlyCostUsd ?? this.assumptions.internalHourlyCostUsd);
        const estimatedInfraCostUsd = candidate.estimatedInfraCostUsd ?? 0;
        const estimatedDeliveryCostUsd = round2(
            estimatedLaborCostUsd + candidate.estimatedTokenCostUsd + estimatedInfraCostUsd
        );
        const marginUsd = round2(expectedNegotiatedValueUsd - estimatedDeliveryCostUsd);
        const marginRatio = expectedNegotiatedValueUsd > 0 ? round2(marginUsd / expectedNegotiatedValueUsd) : 0;

        const demandScore = clamp(candidate.demandScore, 0, 100);
        const ticketBasis =
            candidate.expectedNegotiatedValueUsd ??
            (this.assumptions.pricingMode === 'productized'
                ? productizedValue(candidate.ticketRangeUsd)
                : midpoint(candidate.ticketRangeUsd));
        const ticketScore = ticketScoreFromAmount(ticketBasis);
        const competitionAttractivenessScore = clamp(100 - candidate.competitionPressureScore, 0, 100);
        const complexityAttractivenessScore = clamp(100 - candidate.complexityPressureScore, 0, 100);
        const fitScore = clamp(candidate.fitScore, 0, 100);
        const speedScore = clamp(candidate.speedToCashScore, 0, 100);
        const aiExecutabilityScore = clamp(
            candidate.aiExecutabilityScore ?? aiExecutabilityScoreFromCandidate(candidate),
            0,
            100
        );
        const unitEconomicsScore = clamp(marginRatio * 100, 0, 100);
        const weights = this.assumptions.weights;

        const hardRejectReason =
            aiExecutabilityScore < this.assumptions.minimumAiExecutabilityScore
                ? `AI executability below minimum threshold (${Math.round(this.assumptions.minimumAiExecutabilityScore)}%).`
                : ticketBasis < 400
                    ? 'Budget below absolute project floor (US$ 400.00).'
                    : marginUsd <= 0
                        ? 'Delivery cost is higher than or equal to negotiated value.'
                        : marginRatio < this.assumptions.minimumMarginRatio
                            ? `Margin ratio below minimum threshold (${Math.round(this.assumptions.minimumMarginRatio * 100)}%).`
                            : undefined;

        const totalScore = round2(
            demandScore * weights.demand +
                ticketScore * weights.ticket +
                competitionAttractivenessScore * weights.competition +
                complexityAttractivenessScore * weights.complexity +
                fitScore * weights.fit +
                speedScore * weights.speed +
                unitEconomicsScore * weights.economics
        );

        const recommendation =
            hardRejectReason
                ? 'REJECT'
                : totalScore >= 65
                    ? 'PURSUE'
                    : totalScore >= 45
                        ? 'WATCH'
                        : 'REJECT';

        return {
            ...candidate,
            expectedNegotiatedValueUsd,
            aspirationalStrategicValueUsd,
            estimatedLaborCostUsd: round2(estimatedLaborCostUsd),
            estimatedInfraCostUsd: round2(estimatedInfraCostUsd),
            estimatedDeliveryCostUsd,
            marginUsd,
            marginRatio,
            ticketScore,
            competitionAttractivenessScore,
            complexityAttractivenessScore,
            unitEconomicsScore: round2(unitEconomicsScore),
            aiExecutabilityScore,
            totalScore,
            recommendation,
            hardRejectReason
        };
    }

    evaluateMany(candidates: NicheResearchCandidate[]): NicheResearchEvaluation[] {
        return candidates.map(candidate => this.evaluate(candidate)).sort((a, b) => {
            if (a.recommendation === 'REJECT' && b.recommendation !== 'REJECT') return 1;
            if (a.recommendation !== 'REJECT' && b.recommendation === 'REJECT') return -1;
            return b.totalScore - a.totalScore;
        });
    }
}

export function formatMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

export function buildResearchReportMarkdown(options: {
    generatedAt: Date;
    sourcePath: string;
    assumptions: ResearchAssumptions;
    candidates: NicheResearchEvaluation[];
    officialSignals?: unknown;
}): string {
    const { generatedAt, sourcePath, assumptions, candidates, officialSignals } = options;
    const pursued = candidates.filter(candidate => candidate.recommendation === 'PURSUE');
    const watched = candidates.filter(candidate => candidate.recommendation === 'WATCH');
    const rejected = candidates.filter(candidate => candidate.recommendation === 'REJECT');
    const aiReady = candidates.filter(candidate => candidate.aiExecutabilityScore >= assumptions.minimumAiExecutabilityScore);
    const topThree = candidates.slice(0, 3);

    const markdownTable = [
        '| # | Niche | Surface | Category | Subcategory | Demand | Ticket Range | Target Anchor | Competition | Complexity | Fit | AI Exec | Cost | Real Value | Margin | Score | Decision |',
        '| --- | --- | --- | --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
        ...candidates.map((candidate, index) => {
            const range = `${formatMoney(candidate.ticketRangeUsd.minUsd)}-${formatMoney(candidate.ticketRangeUsd.maxUsd)}`;
            const anchor = candidate.aspirationalStrategicValueUsd > 0 ? formatMoney(candidate.aspirationalStrategicValueUsd) : '-';
            const recommendation = candidate.hardRejectReason ? `REJECT: ${candidate.hardRejectReason}` : candidate.recommendation;

            return `| ${index + 1} | ${escapeCell(candidate.name)} | ${escapeCell(candidate.surface)} | ${escapeCell(candidate.category)} | ${escapeCell(candidate.subcategory || '-')} | ${candidate.demandScore.toFixed(0)} | ${escapeCell(range)} | ${anchor} | ${candidate.competitionPressureScore.toFixed(0)} | ${candidate.complexityPressureScore.toFixed(0)} | ${candidate.fitScore.toFixed(0)} | ${candidate.aiExecutabilityScore.toFixed(0)} | ${escapeCell(formatMoney(candidate.estimatedDeliveryCostUsd))} | ${escapeCell(formatMoney(candidate.expectedNegotiatedValueUsd))} | ${escapeCell(formatMoney(candidate.marginUsd))} | ${candidate.totalScore.toFixed(1)} | ${escapeCell(recommendation)} |`;
        })
    ].join('\n');

    const topThreeSection = topThree.length
        ? topThree
              .map(
                  candidate =>
                      `- **${candidate.name}**: score ${candidate.totalScore.toFixed(1)}, AI exec ${candidate.aiExecutabilityScore.toFixed(0)}%, real margin ${formatMoney(candidate.marginUsd)} (${formatPercent(candidate.marginRatio)}), decision ${candidate.hardRejectReason ? 'REJECT' : candidate.recommendation}.`
              )
              .join('\n')
        : '- No candidates were provided.';

    const rejectedSection = rejected.length
        ? rejected
              .map(candidate => `- **${candidate.name}**: ${candidate.hardRejectReason || 'Rejected by score.'}`)
              .join('\n')
        : '- None.';

    const officialSignalsSection = officialSignals
        ? `\n## Official Upwork Signals\n\n${JSON.stringify(officialSignals, null, 2)}\n`
        : '';

    return `# Niche Selection Report

Generated at: ${generatedAt.toISOString()}
Source file: \`${sourcePath}\`

## Assumptions

- Internal hourly cost: ${formatMoney(assumptions.internalHourlyCostUsd)}
- Minimum margin ratio: ${formatPercent(assumptions.minimumMarginRatio)}
- Pricing mode: ${assumptions.pricingMode}

## Summary

- Candidates evaluated: ${candidates.length}
- Pursue: ${pursued.length}
- Watch: ${watched.length}
- Reject: ${rejected.length}
- AI-executable: ${aiReady.length}

## Ranked Shortlist

${markdownTable}

## Top Candidates

${topThreeSection}

## Rejected Due to Economics

${rejectedSection}

${officialSignalsSection}`.trim() + '\n';
}

function escapeCell(value: string): string {
    return value.split('|').join('\\|').replace(/\n/g, ' ');
}

function formatOptionalMoney(value: number | undefined): string {
    return typeof value === 'number' && Number.isFinite(value) ? formatMoney(value) : 'unknown';
}

function formatOptionalPercent(value: number | undefined): string {
    return typeof value === 'number' && Number.isFinite(value) ? formatPercent(value) : 'unknown';
}

function mapOfferFit(recommendation: ResearchRecommendation): 'Core Offer' | 'Adjacency' | 'Reject' {
    if (recommendation === 'PURSUE') {
        return 'Core Offer';
    }

    if (recommendation === 'WATCH') {
        return 'Adjacency';
    }

    return 'Reject';
}

function mapFeasibilityStatus(recommendation: ResearchRecommendation): 'Go' | 'Go with Constraints' | 'No-Go' {
    if (recommendation === 'PURSUE') {
        return 'Go';
    }

    if (recommendation === 'WATCH') {
        return 'Go with Constraints';
    }

    return 'No-Go';
}

function chooseResearchHandoffCandidate(candidates: NicheResearchEvaluation[]): {
    candidate?: NicheResearchEvaluation;
    selectionMode: ResearchHandoffSelectionMode;
    selectionReason: string;
} {
    const pursue = candidates.find(candidate => candidate.recommendation === 'PURSUE');

    if (pursue) {
        return {
            candidate: pursue,
            selectionMode: 'pursue',
            selectionReason: 'Selected the first PURSUE candidate from the ranked shortlist.'
        };
    }

    if (candidates.length > 0) {
        return {
            candidate: candidates[0],
            selectionMode: 'fallback-first-candidate',
            selectionReason: 'No PURSUE candidate was available, so the first ranked candidate was used with an explicit limitation.'
        };
    }

    return {
        selectionMode: 'no-candidates',
        selectionReason: 'No evaluated candidates were available to seed the handoff.'
    };
}

export function buildResearchHandoffPayload(options: {
    generatedAt: Date;
    sourcePath: string;
    assumptions: ResearchAssumptions;
    candidates: NicheResearchEvaluation[];
    officialSignals?: unknown;
}): ResearchHandoffPayload {
    const { generatedAt, sourcePath, assumptions, candidates } = options;
    const pursueCount = candidates.filter(candidate => candidate.recommendation === 'PURSUE').length;
    const watchCount = candidates.filter(candidate => candidate.recommendation === 'WATCH').length;
    const rejectCount = candidates.filter(candidate => candidate.recommendation === 'REJECT').length;
    const chosen = chooseResearchHandoffCandidate(candidates);
    const candidate = chosen.candidate;

    if (!candidate) {
        return {
            generatedAt: generatedAt.toISOString(),
            sourcePath,
            selectionMode: chosen.selectionMode,
            selectionReason: chosen.selectionReason,
            selectionCount: {
                total: candidates.length,
                pursue: pursueCount,
                watch: watchCount,
                reject: rejectCount
            },
            identification: {
                lead_id: 'unknown',
                source_url: 'unknown',
                client_name: 'unknown',
                client_language: 'unknown',
                internal_language: 'pt-BR',
                offer_fit: 'Reject',
                proposal_status: 'New',
                localized_artifact_status: 'Not Started'
            },
            summary: {
                problem_summary: 'No evaluated opportunities were available to seed the handoff.',
                budget_range: 'unknown',
                fit_initial: 'unknown',
                decision_initial: 'No-Go',
                feasibility_status: 'No-Go'
            },
            economicSignals: {
                target_price: 'unknown',
                price_floor: 'unknown',
                price_floor_basis: 'unknown',
                margin_ratio: 'unknown',
                expected_value: 'unknown',
                estimated_delivery_cost: 'unknown',
                estimated_labor_cost: 'unknown',
                estimated_infra_cost: 'unknown',
                aspirational_strategic_value: 'unknown'
            },
            nextTemplates: [
                'docs/03_Templates/Opportunity_Intake_and_Fit.md',
                'docs/03_Templates/Feasibility_and_Capability_Assessment.md',
                'docs/03_Templates/Costing_Pricing_and_Timeline.md'
            ],
            transitionNotes: [
                'No opportunity was available, so the operator must refresh the research input before qualification.'
            ],
            limitations: [
                'No evaluated candidate was available, so the handoff is only a structural placeholder.'
            ]
        };
    }

    const sourceUrl = candidate.sourceUrls?.[0] || 'unknown';
    const budgetRange = `${formatMoney(candidate.ticketRangeUsd.minUsd)} - ${formatMoney(candidate.ticketRangeUsd.maxUsd)}`;
    const targetPrice = formatOptionalMoney(candidate.expectedNegotiatedValueUsd);
    const priceFloorValue = candidate.estimatedDeliveryCostUsd / Math.max(0.01, 1 - assumptions.minimumMarginRatio);
    const priceFloor = formatOptionalMoney(priceFloorValue);
    const marginRatio = formatOptionalPercent(candidate.marginRatio);
    const estimatedDeliveryCost = formatOptionalMoney(candidate.estimatedDeliveryCostUsd);
    const estimatedLaborCost = formatOptionalMoney(candidate.estimatedLaborCostUsd);
    const estimatedInfraCost = formatOptionalMoney(candidate.estimatedInfraCostUsd);
    const aspirationalStrategicValue = formatOptionalMoney(candidate.aspirationalStrategicValueUsd);
    const fitInitial = mapOfferFit(candidate.recommendation);
    const decisionInitial = candidate.recommendation;
    const feasibilityStatus = mapFeasibilityStatus(candidate.recommendation);
    const sourceUrls = candidate.sourceUrls?.length ? candidate.sourceUrls : sourceUrl === 'unknown' ? [] : [sourceUrl];
    const problemSummary = [
        `Selected research opportunity: ${candidate.name}.`,
        `Cluster: ${candidate.category}${candidate.subcategory ? ` / ${candidate.subcategory}` : ''}.`,
        `Budget range observed: ${budgetRange}.`
    ].join(' ');

    return {
        generatedAt: generatedAt.toISOString(),
        sourcePath,
        selectionMode: chosen.selectionMode,
        selectionReason: chosen.selectionReason,
        selectionCount: {
            total: candidates.length,
            pursue: pursueCount,
            watch: watchCount,
            reject: rejectCount
        },
        identification: {
            lead_id: candidate.id,
            source_url: sourceUrl,
            client_name: 'unknown',
            client_language: 'unknown',
            internal_language: 'pt-BR',
            offer_fit: fitInitial,
            proposal_status: 'New',
            localized_artifact_status: 'Not Started'
        },
        summary: {
            problem_summary: problemSummary,
            budget_range: budgetRange,
            fit_initial: fitInitial,
            decision_initial: decisionInitial,
            feasibility_status: feasibilityStatus
        },
        economicSignals: {
            target_price: targetPrice,
            price_floor: priceFloor,
            price_floor_basis: 'estimated_delivery_cost / (1 - minimum_margin_ratio)',
            margin_ratio: marginRatio,
            expected_value: estimatedDeliveryCost,
            estimated_delivery_cost: estimatedDeliveryCost,
            estimated_labor_cost: estimatedLaborCost,
            estimated_infra_cost: estimatedInfraCost,
            aspirational_strategic_value: aspirationalStrategicValue
        },
        nextTemplates: [
            'docs/03_Templates/Opportunity_Intake_and_Fit.md',
            'docs/03_Templates/Feasibility_and_Capability_Assessment.md',
            'docs/03_Templates/Costing_Pricing_and_Timeline.md'
        ],
        transitionNotes: [
            `Selected mode: ${chosen.selectionMode}.`,
            'Use the selected opportunity to seed the first operational template, then move to feasibility and pricing.',
            candidate.recommendation === 'PURSUE'
                ? 'This is a strong starting point for the operational flow.'
                : 'This is a fallback selection and should be reviewed with explicit caution.'
        ],
        limitations: [
            candidate.recommendation === 'PURSUE'
                ? 'The handoff is seeded from the first PURSUE candidate, but client-specific fields remain unknown until intake.'
                : 'The selection is a fallback, so the downstream templates should treat fit and feasibility as provisional.'
        ],
        candidateSnapshot: {
            name: candidate.name,
            category: candidate.category,
            subcategory: candidate.subcategory || null,
            surface: candidate.surface,
            recommendation: candidate.recommendation,
            totalScore: candidate.totalScore,
            evidence: candidate.evidence || [],
            sourceUrls,
            notes: candidate.notes || null
        }
    };
}

export function buildResearchHandoffMarkdown(options: {
    generatedAt: Date;
    sourcePath: string;
    assumptions: ResearchAssumptions;
    candidates: NicheResearchEvaluation[];
    officialSignals?: unknown;
}): string {
    const payload = buildResearchHandoffPayload(options);

    const identificationTable = [
        '| Campo | Valor |',
        '| --- | --- |',
        `| \`lead_id\` | ${escapeCell(payload.identification.lead_id)} |`,
        `| \`source_url\` | ${escapeCell(payload.identification.source_url)} |`,
        `| \`client_name\` | ${escapeCell(payload.identification.client_name)} |`,
        `| \`client_language\` | ${escapeCell(payload.identification.client_language)} |`,
        `| \`internal_language\` | ${escapeCell(payload.identification.internal_language)} |`,
        `| \`offer_fit\` | ${escapeCell(payload.identification.offer_fit)} |`,
        `| \`proposal_status\` | ${escapeCell(payload.identification.proposal_status)} |`,
        `| \`localized_artifact_status\` | ${escapeCell(payload.identification.localized_artifact_status)} |`
    ].join('\n');

    const economicsTable = [
        '| Campo | Valor |',
        '| --- | --- |',
        `| \`target_price\` | ${escapeCell(payload.economicSignals.target_price)} |`,
        `| \`price_floor\` | ${escapeCell(payload.economicSignals.price_floor)} |`,
        `| \`price_floor_basis\` | ${escapeCell(payload.economicSignals.price_floor_basis)} |`,
        `| \`margin_ratio\` | ${escapeCell(payload.economicSignals.margin_ratio)} |`,
        `| \`expected_value\` | ${escapeCell(payload.economicSignals.expected_value)} |`,
        `| \`estimated_delivery_cost\` | ${escapeCell(payload.economicSignals.estimated_delivery_cost)} |`,
        `| \`estimated_labor_cost\` | ${escapeCell(payload.economicSignals.estimated_labor_cost)} |`,
        `| \`estimated_infra_cost\` | ${escapeCell(payload.economicSignals.estimated_infra_cost)} |`,
        `| \`aspirational_strategic_value\` | ${escapeCell(payload.economicSignals.aspirational_strategic_value)} |`
    ].join('\n');

    const candidateSection = payload.candidateSnapshot
        ? [
              '| Campo | Valor |',
              '| --- | --- |',
              `| \`name\` | ${escapeCell(payload.candidateSnapshot.name)} |`,
              `| \`category\` | ${escapeCell(payload.candidateSnapshot.category)} |`,
              `| \`subcategory\` | ${escapeCell(payload.candidateSnapshot.subcategory || 'unknown')} |`,
              `| \`surface\` | ${escapeCell(payload.candidateSnapshot.surface)} |`,
              `| \`recommendation\` | ${escapeCell(payload.candidateSnapshot.recommendation)} |`,
              `| \`totalScore\` | ${payload.candidateSnapshot.totalScore.toFixed(1)} |`,
              `| \`sourceUrls\` | ${escapeCell(payload.candidateSnapshot.sourceUrls.length ? payload.candidateSnapshot.sourceUrls.join(', ') : 'unknown')} |`
          ].join('\n')
        : '_No candidate selected._';

    const limitations = payload.limitations.length
        ? payload.limitations.map(item => `- ${item}`).join('\n')
        : '- None.';

    const transitions = [
        '- `docs/03_Templates/Opportunity_Intake_and_Fit.md`',
        '- `docs/03_Templates/Feasibility_and_Capability_Assessment.md`',
        '- `docs/03_Templates/Costing_Pricing_and_Timeline.md`'
    ].join('\n');

    return `# Research Handoff

> [!IMPORTANT]
> Este arquivo é um artefato operacional de transição. Ele não inventa dados de cliente e só consolida o que o research conseguiu inferir com segurança.

Generated at: ${payload.generatedAt}
Source file: \`${payload.sourcePath}\`

## Selection

- mode: ${payload.selectionMode}
- reason: ${payload.selectionReason}
- total evaluated: ${payload.selectionCount.total}
- pursue: ${payload.selectionCount.pursue}
- watch: ${payload.selectionCount.watch}
- reject: ${payload.selectionCount.reject}

## Identification

${identificationTable}

## Problem Summary

${escapeCell(payload.summary.problem_summary)}

## Economic Signals

${economicsTable}

## Fit And Feasibility

- fit_initial: ${escapeCell(payload.summary.fit_initial)}
- decision_initial: ${escapeCell(payload.summary.decision_initial)}
- feasibility_status: ${escapeCell(payload.summary.feasibility_status)}

## Candidate Snapshot

${candidateSection}

## Next Transition

1. docs/03_Templates/Opportunity_Intake_and_Fit.md
2. docs/03_Templates/Feasibility_and_Capability_Assessment.md
3. docs/03_Templates/Costing_Pricing_and_Timeline.md

## Transition Notes

${payload.transitionNotes.map(item => `- ${item}`).join('\n')}

## Limitations

${limitations}

## Operating Rule

This handoff is the bridge from shortlist to the solo operating system. It should be used as the first input to intake, not as a substitute for qualification or proposal work.
`.trim() + '\n';
}
