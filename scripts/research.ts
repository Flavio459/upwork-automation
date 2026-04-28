import * as fs from 'fs';
import * as path from 'path';
import { BrowserFlow } from '../services/browser-flow';
import { buildBrowserRunMetrics, createBrowserRunTelemetry, writeBrowserRunMetrics } from '../services/browser-metrics';
import type { LiveUpworkOpportunityCard } from '../services/upwork-feed-collector';
import ResearchDatabase from '../services/research-database';
import {
    DEFAULT_RESEARCH_ASSUMPTIONS,
    CaseStrategy,
    NicheResearchAnalyzer,
    NicheResearchCandidate,
    ResearchSurface,
    ResearchAssumptions,
    ResearchInputFile,
    TicketRange,
    buildResearchHandoffMarkdown,
    buildResearchHandoffPayload,
    buildResearchReportMarkdown
} from '../services/niche-research';
import type { OfficialSignalsDoc } from '../services/upwork-research-agent';

interface CliArgs {
    inputPath: string;
    outputPath: string;
    jsonOutputPath: string;
    handoffOutputPath: string;
    handoffJsonOutputPath: string;
    officialSignalsPath: string;
    pricingMode: 'market' | 'productized';
    headless: boolean;
    challengeTimeoutMs: number;
    challengeIntervalMs: number;
}

function parseArgs(argv: string[]): CliArgs {
    const args: Record<string, string> = {};

    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index];
        if (!value.startsWith('--')) {
            continue;
        }

        const next = argv[index + 1];
        if (next && !next.startsWith('--')) {
            args[value.slice(2)] = next;
            index += 1;
        } else {
            args[value.slice(2)] = 'true';
        }
    }

    return {
        inputPath: path.resolve(process.cwd(), args.input || 'research/niche-candidates.json'),
        outputPath: path.resolve(process.cwd(), args.output || 'reports/niche-selection-report.md'),
        jsonOutputPath: path.resolve(process.cwd(), args.jsonOutput || 'reports/niche-selection-report.json'),
        handoffOutputPath: path.resolve(process.cwd(), args.handoffOutput || 'reports/research-handoff.md'),
        handoffJsonOutputPath: path.resolve(process.cwd(), args.handoffJsonOutput || 'reports/research-handoff.json'),
        officialSignalsPath: path.resolve(process.cwd(), args.officialSignals || 'research/official-signals.json'),
        pricingMode: args.pricingMode === 'productized' || process.env.UPWORK_RESEARCH_PRICING_MODE === 'productized'
            ? 'productized'
            : 'market',
        headless: args.headless === 'true' || process.env.UPWORK_RESEARCH_HEADLESS === 'true',
        challengeTimeoutMs: Number(args.challengeTimeout || process.env.UPWORK_RESEARCH_CHALLENGE_TIMEOUT_MS || 120000),
        challengeIntervalMs: Number(args.challengeInterval || process.env.UPWORK_RESEARCH_CHALLENGE_INTERVAL_MS || 2000)
    };
}

function printPreFlightInfo(args: CliArgs): void {
    console.log('\n--- [Upwork Solo OS: Research Pre-flight] ---');
    console.log(`📡 Pricing Mode: ${args.pricingMode.toUpperCase()}`);
    console.log(`👁️  Headless:     ${args.headless ? 'YES' : 'NO (Vertical Flow Mode)'}`);
    console.log(`⏱️  Timeouts:     Challenge: ${args.challengeTimeoutMs / 1000}s, Interval: ${args.challengeIntervalMs / 1000}s`);
    console.log('----------------------------------------------\n');
}

function ensureDirectory(filePath: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonFile<T>(filePath: string): T {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
}

function writeJsonFile(filePath: string, data: unknown): void {
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function isChallengeFailure(message: string): boolean {
    return /cloudflare challenge|no opportunity cards were visible|best-matches page loaded, but no opportunity cards were found|solve the browser challenge/i.test(message);
}

function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function median(values: number[]): number {
    if (!values.length) {
        return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function demandScoreFromOpportunityCount(opportunityCount: number): number {
    if (opportunityCount <= 0) return 0;
    if (opportunityCount < 5) return 20;
    if (opportunityCount < 10) return 35;
    if (opportunityCount < 20) return 50;
    if (opportunityCount < 40) return 65;
    return 80;
}

function parseBudgetValue(budget: string): number | undefined {
    const values = budget.match(/\$[\d,]+(?:\.\d+)?/g) || [];
    if (!values.length) {
        return undefined;
    }

    const parsed = values
        .map(value => Number(value.replace(/[$,]/g, '')))
        .filter(value => Number.isFinite(value) && value > 0);

    return parsed.length ? median(parsed) : undefined;
}

function parseBudgetRange(budgets: number[]): TicketRange {
    const values = budgets.filter(value => Number.isFinite(value) && value > 0);

    if (!values.length) {
        return { minUsd: 150, maxUsd: 1200 };
    }

    const observedMin = Math.min(...values);
    const observedMax = Math.max(...values);
    const flooredMin = Math.max(50, observedMin);

    return {
        minUsd: flooredMin,
        maxUsd: Math.max(flooredMin, observedMax)
    };
}

function fitScoreFromText(text: string): number {
    const lower = text.toLowerCase();
    let score = 35;
    const profileTerms = [
        'python',
        'javascript',
        'typescript',
        'automation',
        'workflow',
        'api',
        'llm',
        'ai',
        'document',
        'real estate',
        'property',
        'backoffice',
        'architecture',
        'orchestration',
        'multi-agent',
        'discovery',
        'compliance',
        'governance',
        'audit',
        'rag',
        'vector database'
    ];

    for (const term of profileTerms) {
        if (lower.includes(term)) {
            score += 8;
        }
    }

    return clamp(score, 0, 100);
}

function complexityScoreFromText(text: string): number {
    const lower = text.toLowerCase();
    let score = 35;

    if (/(llm|rag|openai|claude|machine learning|computer vision|api|backend|integration|automation|python|orchestration|multi-agent|architecture|governance|compliance|audit|vector database)/i.test(lower)) {
        score += 25;
    }

    if (/(data entry|virtual assistant|proofreading|copywriting|transcription|simple)/i.test(lower)) {
        score -= 15;
    }

    return clamp(score, 0, 100);
}

function speedToCashScoreFromOpportunities(opportunityCount: number, budgets: number[]): number {
    let score = 45;
    if (opportunityCount >= 10) score += 10;
    if (opportunityCount >= 20) score += 8;

    const medianBudget = median(budgets);
    if (medianBudget >= 400 && medianBudget <= 5000) {
        score += 12;
    } else if (medianBudget > 5000) {
        score += 6;
    } else if (medianBudget > 0 && medianBudget < 400) {
        score -= 15;
    }

    return clamp(score, 0, 100);
}

function aiExecutabilityScoreFromText(text: string): number {
    const lower = text.toLowerCase();
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
        if (lower.includes(term)) {
            score += delta;
        }
    }

    for (const [term, delta] of negativeTerms) {
        if (lower.includes(term)) {
            score -= delta;
        }
    }

    if (/(build|create|automate|integrate|debug|fix|optimize)/i.test(lower) && /(llm|api|workflow|automation|python|javascript|typescript)/i.test(lower)) {
        score += 8;
    }

    return clamp(score, 0, 100);
}

function competitionPressureFromCluster(cluster: string, opportunityCount: number): number {
    const lower = cluster.toLowerCase();
    let base = clamp(opportunityCount * 4, 15, 85);

    if (/(virtual assistant|data entry|copywriting|seo|social media)/i.test(lower)) {
        base += 10;
    }

    if (/(python|automation|llm|chatbot|workflow|api)/i.test(lower)) {
        base -= 10;
    }

    if (/(orchestration|multi-agent|architecture|discovery|governance|compliance|audit|rag|vector)/i.test(lower)) {
        base -= 8;
    }

    return clamp(base, 0, 100);
}

function mapOpportunityCategory(cluster: string): { category: string; subcategory?: string } {
    const lower = cluster.toLowerCase();

    if (/(compliance|governance|audit|discovery|strategy|roadmap|fractional|advisory|assessment|consulting)/i.test(lower)) {
        return { category: 'Consulting & Strategy', subcategory: 'AI Advisory' };
    }
    if (/(orchestration|multi-agent|architecture|rag|vector database)/i.test(lower)) {
        return { category: 'AI Services', subcategory: 'AI Orchestration' };
    }
    if (lower.includes('python')) return { category: 'Development & IT', subcategory: 'Python' };
    if (lower.includes('wordpress')) return { category: 'Development & IT', subcategory: 'WordPress' };
    if (lower.includes('seo')) return { category: 'Marketing', subcategory: 'SEO' };
    if (lower.includes('email marketing')) return { category: 'Marketing', subcategory: 'Email Marketing' };
    if (lower.includes('social media')) return { category: 'Marketing', subcategory: 'Social Media Marketing' };
    if (lower.includes('video editing')) return { category: 'Video and Audio', subcategory: 'Video Editing' };
    if (lower.includes('graphic design') || lower.includes('presentation design')) return { category: 'Design', subcategory: 'Graphic Design' };
    if (lower.includes('virtual assistant') || lower.includes('data entry')) return { category: 'Admin & Customer Support', subcategory: 'Virtual Assistant' };
    if (lower.includes('consulting')) return { category: 'Consulting & HR', subcategory: 'Business Consulting' };
    if (lower.includes('financial')) return { category: 'Consulting & HR', subcategory: 'Financial Consulting' };
    if (lower.includes('data analysis')) return { category: 'Data Science & Analytics', subcategory: 'Data Analysis' };
    if (lower.includes('ai') || lower.includes('chatbot') || lower.includes('automation') || lower.includes('integration')) return { category: 'AI Services', subcategory: 'AI Integration' };

    return { category: 'Development & IT', subcategory: 'General' };
}

function caseStrategyFromOpportunity(text: string): CaseStrategy {
    return /(api|automation|python|ai|llm|workflow|integration|architecture|orchestration|multi-agent|discovery|governance|compliance|audit|rag|vector)/i.test(text) ? 'real' : 'hybrid';
}

function clusterOpportunityText(text: string): string {
    const lower = text.toLowerCase();

    if (/(discovery phase|roadmap|audit|governance|compliance|strategy|fractional|advisory|assessment|consulting)/i.test(lower)) {
        return 'ai advisory';
    }

    if (/(systems integrator|automation architect|workflow optimization|integration fix|multi-agent|orchestration|rag|vector database|llm|openai|claude|agent|integration|systems)/i.test(lower)) {
        return 'ai orchestration';
    }

    if (/(ai integration|chatbot)/i.test(lower)) {
        return 'ai integration';
    }

    if (/(automation)/i.test(lower)) {
        return 'automation';
    }

    if (/(python)/i.test(lower)) {
        return 'python';
    }

    if (/(wordpress)/i.test(lower)) return 'wordpress';
    if (/(seo)/i.test(lower)) return 'seo';
    if (/(email marketing)/i.test(lower)) return 'email marketing';
    if (/(data analysis)/i.test(lower)) return 'data analysis';
    if (/(video editing)/i.test(lower)) return 'video editing';
    if (/(graphic design|presentation design)/i.test(lower)) return 'graphic design';
    if (/(virtual assistant|data entry)/i.test(lower)) return 'virtual assistant';
    if (/(business consulting)/i.test(lower)) return 'business consulting';
    if (/(financial consulting)/i.test(lower)) return 'financial consulting';
    if (/(lead generation)/i.test(lower)) return 'lead generation';
    if (/(content writing)/i.test(lower)) return 'content writing';
    if (/(social media marketing)/i.test(lower)) return 'social media marketing';
    if (/(web development)/i.test(lower)) return 'web development';

    return 'general development';
}

function buildCandidatesFromLiveOpportunities(opportunities: LiveUpworkOpportunityCard[], pricingMode: 'market' | 'productized'): NicheResearchCandidate[] {
    const clusters = new Map<string, typeof opportunities>();
    for (const opportunity of opportunities) {
        const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
        const cluster = clusterOpportunityText(text);
        const bucket = clusters.get(cluster) || [];
        bucket.push(opportunity);
        clusters.set(cluster, bucket);
    }

    const candidates = [...clusters.entries()].map(([cluster, bucket]) => {
        const budgets = bucket.map(opportunity => parseBudgetValue(opportunity.budget)).filter((value): value is number => typeof value === 'number');
        const budgetRange = parseBudgetRange(budgets);
        const sampleTitles = bucket.slice(0, 3).map(opportunity => opportunity.title);
        const joinedText = bucket.map(opportunity => `${opportunity.title} ${opportunity.description}`).join(' ');
        const demandScore = demandScoreFromOpportunityCount(bucket.length);
        const competitionPressureScore = competitionPressureFromCluster(cluster, bucket.length);
        const complexityPressureScore = complexityScoreFromText(joinedText);
        const fitScore = fitScoreFromText(joinedText);
        const speedToCashScore = speedToCashScoreFromOpportunities(bucket.length, budgets);
        const aiExecutabilityScore = aiExecutabilityScoreFromText(joinedText);
        const estimatedDeliveryHours = clamp(Math.round(8 + complexityPressureScore / 4), 4, 80);
        const estimatedTokenCostUsd = round2(clamp((complexityPressureScore / 100) * 15, 2, 40));
        const estimatedLaborCostUsd = round2(estimatedDeliveryHours * 25);
        const estimatedInfraCostUsd = round2(/(ai|llm|automation|api|workflow)/i.test(cluster) ? 8 : 3);
        const { category, subcategory } = mapOpportunityCategory(cluster);
        const sourceUrls = bucket.map(opportunity => opportunity.url).filter(Boolean);
        const expectedNegotiatedValueUsd = pricingMode === 'productized'
            ? Math.max((budgetRange.minUsd + budgetRange.maxUsd) / 2, budgetRange.maxUsd * 1.25)
            : undefined;

        const aspirationalStrategicValueUsd = (() => {
            const isAuditLed = /(compliance|governance|audit|discovery|strategy|roadmap|fractional|advisory|assessment|consulting)/i.test(joinedText);
            const isArchitectureLed = /(orchestration|multi-agent|architecture|rag|vector database|integration|automation|ai integration|workflow)/i.test(joinedText);
            if (isAuditLed) return 5000;
            if (isArchitectureLed) return 2500;
            return 0;
        })();

        return {
            id: slugify(cluster),
            name: cluster,
            surface: 'Talent Marketplace' as ResearchSurface,
            category,
            subcategory,
            skillCluster: [cluster, ...sampleTitles],
            demandScore,
            ticketRangeUsd: budgetRange,
            competitionPressureScore,
            complexityPressureScore,
            fitScore,
            speedToCashScore,
            aiExecutabilityScore,
            estimatedDeliveryHours,
            estimatedTokenCostUsd,
            estimatedInfraCostUsd,
            estimatedLaborCostUsd,
            expectedNegotiatedValueUsd,
            aspirationalStrategicValueUsd,
            caseStrategy: caseStrategyFromOpportunity(joinedText),
            evidence: [
                `Live opportunities analyzed: ${bucket.length}`,
                ...sampleTitles.map(title => `Live sample: ${title}`),
                ...bucket.slice(0, 3).map(opportunity => `Budget: ${opportunity.budget || 'Negotiable'}`)
            ],
            sourceUrls,
            notes: `Derived from live Upwork opportunity cards in the authenticated browser session. Pricing mode: ${pricingMode}. Aspirational anchor: ${aspirationalStrategicValueUsd || 'none'}.`
        } satisfies NicheResearchCandidate;
    });

    return candidates.sort((a, b) => {
        const aScore = a.demandScore + a.fitScore + a.speedToCashScore - a.competitionPressureScore - a.complexityPressureScore;
        const bScore = b.demandScore + b.fitScore + b.speedToCashScore - b.competitionPressureScore - b.complexityPressureScore;
        return bScore - aScore;
    });
}

function readOptionalJsonFile<T>(filePath: string): T | undefined {
    if (!fs.existsSync(filePath)) {
        return undefined;
    }

    return readJsonFile<T>(filePath);
}

function mergeCandidates(primary: NicheResearchCandidate[], fallback: NicheResearchCandidate[]): NicheResearchCandidate[] {
    const merged = new Map<string, NicheResearchCandidate>();

    for (const candidate of primary) {
        merged.set(candidate.id, candidate);
    }

    for (const candidate of fallback) {
        merged.set(candidate.id, candidate);
    }

    return [...merged.values()];
}

async function main() {
    const args = parseArgs(process.argv);
    printPreFlightInfo(args);

    const runStartedAt = new Date();

    const overrides = readOptionalJsonFile<ResearchInputFile>(args.inputPath);
    const assumptions: ResearchAssumptions = {
        ...DEFAULT_RESEARCH_ASSUMPTIONS,
        ...(overrides?.assumptions || {}),
        weights: {
            ...DEFAULT_RESEARCH_ASSUMPTIONS.weights,
            ...(overrides?.assumptions?.weights || {})
        },
        pricingMode: args.pricingMode
    };

    const officialSignals = readOptionalJsonFile<OfficialSignalsDoc>(args.officialSignalsPath);
    const browserTelemetry = createBrowserRunTelemetry();
    const browserFlow = new BrowserFlow({
        headless: args.headless,
        challengeTimeoutMs: args.challengeTimeoutMs,
        challengeIntervalMs: args.challengeIntervalMs,
        telemetry: browserTelemetry
    });
    const metricsPath = path.resolve(process.cwd(), 'reports/browser-run-metrics.json');
    const sqlitePath = path.resolve(process.cwd(), 'upwork_research.db');
    const outputPaths = {
        markdownPath: args.outputPath,
        jsonPath: args.jsonOutputPath,
        handoffMarkdownPath: args.handoffOutputPath,
        handoffJsonPath: args.handoffJsonOutputPath,
        sqlitePath
    };
    const sourceDescription = [
        'Automated Upwork browser agent',
        overrides?.candidates?.length ? `+ ${path.relative(process.cwd(), args.inputPath)} overrides` : '',
        `+ ${path.relative(process.cwd(), args.officialSignalsPath)}`
    ]
        .filter(Boolean)
        .join(' ');

    let generatedCandidates: NicheResearchCandidate[] = [];
    let browserRun: Awaited<ReturnType<BrowserFlow['collectBestMatches']>> | null = null;
    let runSucceeded = false;
    let runErrorMessage: string | undefined;

    // Graceful exit: verifica se o Chrome na porta 9222 está rodando (apenas se nao for explícito headless puro)
    if (!args.headless) {
        try {
            const response = await fetch('http://127.0.0.1:9222/json/version', { signal: AbortSignal.timeout(2000) });
            if (!response.ok) throw new Error();
        } catch {
            console.error('\n❌ Chrome com porta de debug local não encontrado na 9222.');
            console.error('👉 Passo a Passo:');
            console.error('1. Execute "npm run login" em outro terminal para abrir o navegador.');
            console.error('2. Faça login no Upwork e resolva o Cloudflare na janela visível.');
            console.error('3. Mantenha a janela aberta e rode "npm run research" novamente.\n');
            process.exit(1);
        }
    }

    try {
        browserRun = await browserFlow.collectBestMatches();

        if (browserRun.success) {
            generatedCandidates = buildCandidatesFromLiveOpportunities(browserRun.opportunities, args.pricingMode);
        } else {
            const message = browserRun.errorMessage || 'Browser research failed.';
            if (isChallengeFailure(message)) {
                console.error('\n❌ Chrome detectado, mas o Upwork ainda está em challenge.');
                console.error('👉 Resolva o challenge na janela visível e rode "npm run research" de novo.\n');
            } else {
                console.warn(`⚠️ Browser research failed: ${message}`);
            }

            if (!overrides?.candidates?.length) {
                throw new Error(message);
            }
        }

        const candidates = mergeCandidates(generatedCandidates, overrides?.candidates || []);
        const analyzer = new NicheResearchAnalyzer(assumptions);
        const evaluations = analyzer.evaluateMany(candidates);

        const reportMarkdown = buildResearchReportMarkdown({
            generatedAt: new Date(),
            sourcePath: sourceDescription,
            assumptions,
            candidates: evaluations,
            officialSignals
        });

        ensureDirectory(args.outputPath);
        fs.writeFileSync(args.outputPath, reportMarkdown, 'utf8');
        writeJsonFile(args.jsonOutputPath, {
            generatedAt: new Date().toISOString(),
            sourcePath: sourceDescription,
            assumptions,
            evaluations,
            officialSignals
        });

        const handoffPayload = buildResearchHandoffPayload({
            generatedAt: new Date(),
            sourcePath: sourceDescription,
            assumptions,
            candidates: evaluations,
            officialSignals
        });
        const handoffMarkdown = buildResearchHandoffMarkdown({
            generatedAt: new Date(),
            sourcePath: sourceDescription,
            assumptions,
            candidates: evaluations,
            officialSignals
        });

        ensureDirectory(args.handoffOutputPath);
        fs.writeFileSync(args.handoffOutputPath, handoffMarkdown, 'utf8');
        writeJsonFile(args.handoffJsonOutputPath, handoffPayload);

        const db = new ResearchDatabase();

        try {
            await db.initialize();
            await db.saveEvaluations(evaluations);
        } finally {
            await db.close();
        }

        runSucceeded = true;

        console.log(`\n📊 Research report written to ${args.outputPath}`);
        console.log(`🗃️ Research data written to ${args.jsonOutputPath}`);
        console.log(`🧭 Research handoff written to ${args.handoffOutputPath}`);

        if (!evaluations.length) {
            console.log('No candidates were discovered. Check the automated agent output and optional overrides.');
            return;
        }

        const topThree = evaluations.slice(0, 3);
        console.log('\nTop candidates:');
        for (const candidate of topThree) {
            console.log(
                `- ${candidate.name} | ${candidate.recommendation} | score ${candidate.totalScore.toFixed(1)} | margin ${candidate.marginRatio.toFixed(2)}`
            );
        }
    } catch (error) {
        runErrorMessage = error instanceof Error ? error.message : String(error);
        throw error;
    } finally {
        const runEndedAt = new Date();
        const browserMetrics = buildBrowserRunMetrics({
            sourcePath: sourceDescription,
            runStartedAt: runStartedAt.toISOString(),
            runEndedAt: runEndedAt.toISOString(),
            durationMs: runEndedAt.getTime() - runStartedAt.getTime(),
            success: runSucceeded,
            opportunitiesCollected: browserRun?.opportunities.length ?? 0,
            challengeWaits: browserTelemetry.challengeWaits,
            retries: browserTelemetry.retries,
            outputs: outputPaths,
            browserFlow: browserRun
                ? {
                      startedAt: browserRun.startedAt,
                      endedAt: browserRun.endedAt,
                      durationMs: browserRun.durationMs,
                      success: browserRun.success
                  }
                : undefined,
            errorMessage: runErrorMessage
        });

        try {
            writeBrowserRunMetrics(metricsPath, browserMetrics);
        } catch (metricsError) {
            const metricsMessage = metricsError instanceof Error ? metricsError.message : String(metricsError);
            console.warn(`⚠️ Could not write browser metrics: ${metricsMessage}`);
        }
    }
}

main().catch(error => {
    console.error('❌ Research run failed:', error);
    process.exitCode = 1;
});
