import { BrowserContext, Page } from 'playwright';
import { BrowserManager } from './browser-manager';
import {
    NicheResearchCandidate,
    ResearchSurface,
    TicketRange
} from './niche-research';

export interface OfficialSignalsDoc {
    projectCatalog?: {
        categories?: string[];
        notableSignals?: string[];
    };
    marketplace2026?: {
        categories?: Array<{
            name: string;
            fastestGrowingSkills: string[];
        }>;
    };
}

export interface ResearchAgentOptions {
    headless?: boolean;
    allowPublicFallback?: boolean;
    challengeTimeoutMs?: number;
    challengeIntervalMs?: number;
}

interface OpportunitySurfaceSignal {
    query: string;
    url: string;
    opportunityCount: number;
    sampleTitles: string[];
    sampleBudgets: number[];
    sampleDurations: string[];
    sampleExperienceLevels: string[];
    sampleTags: string[];
}

interface CatalogSurfaceSignal {
    url: string;
    categories: string[];
    featuredProjects: Array<{
        title: string;
        category: string;
        priceUsd?: number;
        delivery?: string;
    }>;
}

const INTERNAL_PROFILE_SKILLS = [
    'python',
    'javascript',
    'typescript',
    'ai',
    'automation',
    'workflow',
    'document processing',
    'real estate',
    'property tech',
    'backoffice'
];

const CORE_RESEARCH_TERMS = [
    'python',
    'ai integration',
    'chatbot development',
    'web development',
    'wordpress',
    'seo',
    'email marketing',
    'data analysis',
    'video editing',
    'graphic design',
    'virtual assistant',
    'data entry',
    'business consulting',
    'financial consulting',
    'lead generation',
    'content writing',
    'presentation design',
    'social media marketing',
    'automation'
];

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

function parseMoneyValue(text: string): number | undefined {
    const match = text.replace(/,/g, '').match(/\$([0-9]+(?:\.[0-9]+)?)/);
    return match ? Number(match[1]) : undefined;
}

function parseOpportunityCount(text: string): number {
    const patterns = [
        /sample of the ([\d,]+)\s+.*jobs posted on Upwork/i,
        /([\d,]+)\s+jobs posted on Upwork/i,
        /([\d,]+)\s+jobs found/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return Number(match[1].replace(/,/g, ''));
        }
    }

    return 0;
}

function extractFirstMatch(text: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1]?.trim();
        }
    }

    return undefined;
}

function collectLines(text: string, maxItems: number): string[] {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .filter(line => line.length > 3)
        .slice(0, maxItems);
}

function unique(values: string[]): string[] {
    return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function average(values: number[]): number {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
    if (!values.length) {
        return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function fitScoreFromText(query: string, tags: string[], titles: string[]): number {
    const text = `${query} ${tags.join(' ')} ${titles.join(' ')}`.toLowerCase();
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
        'backoffice'
    ];

    for (const term of profileTerms) {
        if (text.includes(term)) {
            score += 8;
        }
    }

    return clamp(score, 0, 100);
}

function complexityScoreFromText(query: string, tags: string[], titles: string[], durations: string[]): number {
    const text = `${query} ${tags.join(' ')} ${titles.join(' ')}`.toLowerCase();
    let score = 35;

    if (/(llm|rag|openai|claude|machine learning|computer vision|opencv|api|backend|integration|automation|python)/i.test(text)) {
        score += 25;
    }

    if (/(data entry|virtual assistant|proofreading|copywriting|transcription|simple)/i.test(text)) {
        score -= 15;
    }

    if (durations.some(duration => /more than 6 months|3 to 6 months/i.test(duration))) {
        score += 10;
    }

    if (durations.some(duration => /less than one month|1 to 3 months/i.test(duration))) {
        score -= 8;
    }

    return clamp(score, 0, 100);
}

function speedToCashScoreFromOpportunitySignal(opportunityCount: number, budgets: number[], durations: string[]): number {
    let score = 45;

    if (opportunityCount >= 3000) {
        score += 15;
    } else if (opportunityCount >= 1000) {
        score += 10;
    }

    const medianBudget = median(budgets);
    if (medianBudget >= 500 && medianBudget <= 5000) {
        score += 12;
    } else if (medianBudget > 5000) {
        score += 6;
    } else if (medianBudget > 0 && medianBudget < 250) {
        score -= 10;
    }

    if (durations.some(duration => /less than 30 hrs\/week|1 to 3 months|less than one month/i.test(duration))) {
        score += 8;
    }

    return clamp(score, 0, 100);
}

function demandScoreFromOpportunityCount(opportunityCount: number): number {
    if (opportunityCount <= 0) return 0;
    if (opportunityCount < 50) return 25;
    if (opportunityCount < 250) return 40;
    if (opportunityCount < 750) return 55;
    if (opportunityCount < 1500) return 68;
    if (opportunityCount < 3000) return 78;
    return 90;
}

function competitionPressureFromDemandAndCatalog(opportunityCount: number, catalogHits: number): number {
    const opportunityPressure = clamp(opportunityCount / 60, 10, 90);
    const catalogPressure = clamp(catalogHits * 18, 0, 45);
    return clamp(opportunityPressure + catalogPressure, 0, 100);
}

function ticketRangeFromBudgets(budgets: number[], catalogPrices: number[]): TicketRange {
    const merged = [...budgets, ...catalogPrices].filter(value => value > 0);
    if (!merged.length) {
        return { minUsd: 150, maxUsd: 1000 };
    }

    const low = Math.min(...merged);
    const high = Math.max(...merged);

    return {
        minUsd: Math.max(50, Math.floor(low * 0.9)),
        maxUsd: Math.max(Math.floor(high * 1.2), Math.floor(low * 1.5))
    };
}

function negotiateValueFromTicketRange(ticketRange: TicketRange): number {
    return Math.round((ticketRange.minUsd + ticketRange.maxUsd) / 2);
}

function caseStrategyFromOpportunitySignal(query: string, tags: string[], opportunityCount: number): 'real' | 'hybrid' {
    const text = `${query} ${tags.join(' ')}`.toLowerCase();
    if (/(automation|ai|python|web development|wordpress|seo|marketing)/i.test(text) && opportunityCount > 500) {
        return 'real';
    }

    return 'hybrid';
}

function mapSurface(query: string): ResearchSurface {
    const lowered = query.toLowerCase();
    if (/(design|video|audio|marketing|writing|admin|consulting|hr|lifestyle)/.test(lowered)) {
        return 'Project Catalog';
    }

    if (/(ai|python|development|wordpress|seo|automation|data|web)/.test(lowered)) {
        return 'Both';
    }

    return 'Talent Marketplace';
}

function mapOpportunityCategory(query: string): { category: string; subcategory?: string } {
    const lowered = query.toLowerCase();

    if (lowered.includes('python')) return { category: 'Development & IT', subcategory: 'Python' };
    if (lowered.includes('wordpress')) return { category: 'Development & IT', subcategory: 'WordPress' };
    if (lowered.includes('seo')) return { category: 'Marketing', subcategory: 'SEO' };
    if (lowered.includes('email marketing')) return { category: 'Marketing', subcategory: 'Email Marketing' };
    if (lowered.includes('social media')) return { category: 'Marketing', subcategory: 'Social Media Marketing' };
    if (lowered.includes('video editing')) return { category: 'Video and Audio', subcategory: 'Video Editing' };
    if (lowered.includes('graphic design') || lowered.includes('presentation design')) {
        return { category: 'Design', subcategory: 'Graphic Design' };
    }
    if (lowered.includes('virtual assistant') || lowered.includes('data entry')) {
        return { category: 'Admin & Customer Support', subcategory: 'Virtual Assistant' };
    }
    if (lowered.includes('consulting')) return { category: 'Consulting & HR', subcategory: 'Business Consulting' };
    if (lowered.includes('financial')) return { category: 'Consulting & HR', subcategory: 'Financial Consulting' };
    if (lowered.includes('data analysis')) return { category: 'Development & IT', subcategory: 'Data Analysis' };
    if (lowered.includes('ai') || lowered.includes('chatbot') || lowered.includes('automation')) {
        return { category: 'AI Services', subcategory: 'AI Integration' };
    }

    return { category: 'Development & IT', subcategory: 'General' };
}

export class UpworkResearchAgent {
    private readonly browserManager = new BrowserManager();
    private readonly headless: boolean;
    private readonly allowPublicFallback: boolean;
    private readonly challengeTimeoutMs: number;
    private readonly challengeIntervalMs: number;

    constructor(options: ResearchAgentOptions = {}) {
        this.headless = options.headless ?? false;
        this.allowPublicFallback = options.allowPublicFallback ?? false;
        this.challengeTimeoutMs = options.challengeTimeoutMs ?? 8000;
        this.challengeIntervalMs = options.challengeIntervalMs ?? 2000;
    }

    async collect(officialSignals: OfficialSignalsDoc): Promise<NicheResearchCandidate[]> {
        let context: BrowserContext | null = null;
        let page: Page | null = null;
        try {
            context = await this.browserManager.init(this.headless);
            page = await context.newPage();
            await page.setViewportSize({ width: 1440, height: 1200 });

            const catalogSignal = await this.collectCatalogSignal(page);
            const seedQueries = this.buildSeedQueries(officialSignals, catalogSignal);
            const opportunitySignals: OpportunitySurfaceSignal[] = [];

            for (const query of seedQueries) {
                const signal = await this.collectOpportunitySignal(page, query);
                if (signal.opportunityCount > 0 || signal.sampleTitles.length > 0) {
                    opportunitySignals.push(signal);
                }
            }

            const fallbackRequired =
                opportunitySignals.length === 0 || catalogSignal.categories.length === 0 || catalogSignal.featuredProjects.length === 0;
            if (fallbackRequired && !this.allowPublicFallback) {
                throw new Error(
                    [
                        'Unable to collect enough live Upwork signals from the authenticated session.',
                        'Close the Upwork login browser, make sure the saved session is valid, and rerun research.',
                        'If you intentionally want the public-signal fallback, pass allowPublicFallback=true.'
                    ].join(' ')
                );
            }

            if (fallbackRequired) {
                console.warn(
                    '⚠️ Live Upwork pages were blocked or too thin to extract signals. Using public official-signal fallback because it was explicitly enabled.'
                );
            }

            const finalCatalogSignal = fallbackRequired
                ? this.buildSyntheticCatalogSignal(officialSignals, catalogSignal)
                : catalogSignal;
            const finalOpportunitySignals = opportunitySignals.length
                ? opportunitySignals
                : this.buildSyntheticOpportunitySignals(officialSignals, seedQueries, finalCatalogSignal);

            return this.buildCandidates(finalOpportunitySignals, finalCatalogSignal);
        } finally {
            if (page) {
                await page.close().catch(() => null);
            }
            await this.browserManager.close();
        }
    }

    private buildSeedQueries(officialSignals: OfficialSignalsDoc, catalogSignal: CatalogSurfaceSignal): string[] {
        const fromMarketplace =
            officialSignals.marketplace2026?.categories?.flatMap(category => category.fastestGrowingSkills) ?? [];

        const fromCatalog =
            officialSignals.projectCatalog?.categories?.map(category => category.toLowerCase()) ?? [];

        const queries = unique([
            ...CORE_RESEARCH_TERMS,
            ...fromMarketplace,
            ...fromCatalog,
            ...INTERNAL_PROFILE_SKILLS
        ]);

        const matchedCatalogQueries = catalogSignal.categories.flatMap(category => {
            const lower = category.toLowerCase();
            const directHits = queries.filter(query => lower.includes(query.toLowerCase()));
            return directHits.length ? directHits : [category];
        });

        return unique([...queries, ...matchedCatalogQueries]).slice(0, 20);
    }

    private async collectOpportunitySignal(page: Page, query: string): Promise<OpportunitySurfaceSignal> {
        const slug = slugify(query);
        const urls = [
            `https://www.upwork.com/freelance-jobs/${slug}/`,
            `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(query)}`
        ];

        let bodyText = '';
        let finalUrl = urls[0];

        for (const url of urls) {
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => null);
                await this.ensurePageReady(page, `opportunity search "${query}"`);
                bodyText = await page.locator('body').innerText();
                finalUrl = page.url();
                if (bodyText.length > 0) {
                    break;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (/cloudflare|challenge/i.test(message)) {
                    throw error;
                }
                bodyText = '';
            }
        }

        const opportunityCount = parseOpportunityCount(bodyText);
        const cardTexts = await this.extractOpportunityCards(page);
        const titles = cardTexts.map(card => extractFirstMatch(card, [/^(.+?)(?:\n|$)/])).filter(Boolean) as string[];
        const budgets = cardTexts
            .map(card => {
                const priceMatch = card.match(/^\$([0-9,]+(?:\.[0-9]+)?)$/m) || card.match(/\$([0-9,]+(?:\.[0-9]+)?)/);
                return priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : undefined;
            })
            .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
        const durations = cardTexts.flatMap(card => {
            const match = card.match(
                /(Less than one month|1 to 3 months|3 to 6 months|More than 6 months|Less than 30 hrs\/week|More than 30 hrs\/week)/i
            );
            return match ? [match[1]] : [];
        });
        const experienceLevels = cardTexts.flatMap(card => {
            const match = card.match(/(Entry|Intermediate|Expert) Experience level/i);
            return match ? [match[1]] : [];
        });
        const tags = unique(
            cardTexts.flatMap(card => {
                const lines = collectLines(card, 15);
                return lines.filter(line => line.length < 80 && !/posted|experience level|hours needed|duration|fixed-price|hourly/i.test(line));
            })
        );

        return {
            query,
            url: finalUrl,
            opportunityCount,
            sampleTitles: unique(titles).slice(0, 5),
            sampleBudgets: budgets.slice(0, 5),
            sampleDurations: unique(durations).slice(0, 5),
            sampleExperienceLevels: unique(experienceLevels).slice(0, 5),
            sampleTags: tags.slice(0, 10)
        };
    }

    private async collectCatalogSignal(page: Page): Promise<CatalogSurfaceSignal> {
        const url = 'https://www.upwork.com/services/';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => null);
        await this.ensurePageReady(page, 'Project Catalog');

        const bodyText = await page.locator('body').innerText();
        const categoryMatches = bodyText.match(/##\s+Browse all categories[\s\S]*?(?:View More \d+|Footer navigation)/i);
        const categoryBlock = categoryMatches ? categoryMatches[0] : bodyText;
        const categories = unique(
            categoryBlock
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^[A-Za-z0-9 &/+-]+$/.test(line))
                .filter(line => !/browse all categories|design|video & audio|development & it|marketing|writing & translation|more/i.test(line))
        );

        const productCards = await this.extractCatalogCards(page);
        const featuredProjects = productCards.map(card => {
            const lines = collectLines(card, 10);
            const title = lines[0] || 'Untitled Project';
            const priceUsd = lines.reduce<number | undefined>((acc, line) => acc ?? parseMoneyValue(line), undefined);
            const delivery = lines.find(line => /day delivery|hour delivery|delivery/i.test(line));
            return {
                title,
                category: this.inferCatalogCategory(title, categories),
                priceUsd,
                delivery
            };
        });

        return { url, categories, featuredProjects };
    }

    private inferCatalogCategory(title: string, categories: string[]): string {
        const lower = title.toLowerCase();
        const match = categories.find(category => lower.includes(category.toLowerCase()));
        return match || 'Other';
    }

    private isChallengePage(title: string, bodyText: string, pageUrl: string): boolean {
        const text = `${title}\n${bodyText}\n${pageUrl}`.toLowerCase();
        return (
            text.includes('cloudflare ray id') ||
            text.includes('just a moment') ||
            text.includes('challenge - upwork') ||
            text.includes('um momento') ||
            text.includes('challenge')
        );
    }

    private async waitForChallengeClear(page: Page, label: string, timeoutMs = this.challengeTimeoutMs, intervalMs = this.challengeIntervalMs): Promise<void> {
        console.log(`\n🛑 Cloudflare challenge detected on ${label}.`);
        console.log('   Solve it in the opened browser. The script will keep checking until the page clears.');

        const deadline = Date.now() + timeoutMs;
        let attempt = 0;

        while (Date.now() < deadline) {
            attempt += 1;
            await page.waitForTimeout(intervalMs);

            const title = await page.title().catch(() => '');
            const bodyText = await page.locator('body').innerText().catch(() => '');
            const pageUrl = page.url();

            if (!this.isChallengePage(title, bodyText, pageUrl)) {
                console.log(`   ✅ Challenge cleared after ${attempt} check(s).`);
                return;
            }

            console.log(`   ⏳ Still waiting for challenge clearance (${attempt})...`);
        }

        throw new Error(`Cloudflare challenge still active after ${Math.round(timeoutMs / 1000)}s on ${label}.`);
    }

    private async ensurePageReady(page: Page, label: string): Promise<void> {
        const title = await page.title().catch(() => '');
        const bodyText = await page.locator('body').innerText().catch(() => '');
        const pageUrl = page.url();

        if (!this.isChallengePage(title, bodyText, pageUrl)) {
            return;
        }

        await this.waitForChallengeClear(page, label);

        const retryTitle = await page.title().catch(() => '');
        const retryBodyText = await page.locator('body').innerText().catch(() => '');
        const retryUrl = page.url();

        if (this.isChallengePage(retryTitle, retryBodyText, retryUrl)) {
            throw new Error(`Cloudflare challenge still active after wait on ${label}.`);
        }
    }

    private buildSyntheticCatalogSignal(
        officialSignals: OfficialSignalsDoc,
        liveCatalogSignal: CatalogSurfaceSignal
    ): CatalogSurfaceSignal {
        const marketplaceCategories = officialSignals.marketplace2026?.categories ?? [];
        const syntheticCategories = unique([
            ...liveCatalogSignal.categories,
            ...(officialSignals.projectCatalog?.categories ?? []),
            ...marketplaceCategories.map(category => category.name),
            ...marketplaceCategories.flatMap(category => category.fastestGrowingSkills)
        ]).slice(0, 24);

        const syntheticSources = unique([
            ...(officialSignals.projectCatalog?.notableSignals ?? []),
            ...marketplaceCategories.flatMap(category => category.fastestGrowingSkills),
            ...(officialSignals.projectCatalog?.categories ?? [])
        ]).slice(0, 16);

        const featuredProjects = syntheticSources.map((title, index) => {
            const lower = title.toLowerCase();
            const isLowComplexity = /(virtual assistant|data entry|proofreading|transcription|copywriting)/i.test(lower);
            const isCreative = /(design|video|graphic|presentation|seo|marketing|content)/i.test(lower);
            const isConsulting = /(consulting|finance|business)/i.test(lower);
            const isAi = /(ai|automation|python|llm|chatbot|api|workflow)/i.test(lower);

            const priceUsd = isAi
                ? 1800 + index * 150
                : isConsulting
                    ? 1200 + index * 100
                    : isCreative
                        ? 500 + index * 60
                        : isLowComplexity
                            ? 120 + index * 25
                            : 800 + index * 80;

            const delivery = isAi || isConsulting ? '3 day delivery' : isCreative ? '2 day delivery' : '1 day delivery';

            return {
                title,
                category: this.inferCatalogCategory(title, syntheticCategories),
                priceUsd,
                delivery
            };
        });

        return {
            url: liveCatalogSignal.url,
            categories: syntheticCategories,
            featuredProjects
        };
    }

    private buildSyntheticOpportunitySignals(
        officialSignals: OfficialSignalsDoc,
        seedQueries: string[],
        catalogSignal: CatalogSurfaceSignal
    ): OpportunitySurfaceSignal[] {
        const marketplaceSkills =
            officialSignals.marketplace2026?.categories?.flatMap(category => category.fastestGrowingSkills) ?? [];
        const candidateQueries = unique([
            ...seedQueries,
            ...(officialSignals.projectCatalog?.categories ?? []),
            ...marketplaceSkills,
            ...(officialSignals.projectCatalog?.notableSignals ?? [])
        ]).slice(0, 18);

        return candidateQueries.map((query, index) => {
            const lower = query.toLowerCase();
            const isAi = /(ai|automation|python|llm|chatbot|api|workflow)/i.test(lower);
            const isCreative = /(design|video|graphic|presentation|seo|marketing|content|branding)/i.test(lower);
            const isLowComplexity = /(virtual assistant|data entry|proofreading|transcription|copywriting)/i.test(lower);
            const isConsulting = /(consulting|finance|business|strategy)/i.test(lower);

            const baseOpportunityCount = 180 + marketplaceSkills.length * 35;
            const opportunityCount = clamp(
                baseOpportunityCount +
                    (isAi ? 1200 : 0) +
                    (isConsulting ? 420 : 0) +
                    (isCreative ? 260 : 0) -
                    (isLowComplexity ? 180 : 0) -
                    index * 18,
                60,
                5200
            );

            const sampleBudgets = isAi
                ? [500, 1000, 2500, 5000]
                : isConsulting
                    ? [400, 800, 1500, 3000]
                    : isCreative
                        ? [150, 300, 600, 1200]
                        : isLowComplexity
                            ? [50, 100, 150, 250]
                            : [250, 500, 1000, 2000];

            const sampleDurations = isAi || isConsulting
                ? ['Less than one month', '1 to 3 months']
                : isCreative
                    ? ['Less than one month', '1 to 3 months']
                    : isLowComplexity
                        ? ['Less than one month']
                        : ['1 to 3 months', '3 to 6 months'];

            const sampleExperienceLevels = isAi || isConsulting
                ? ['Intermediate', 'Expert']
                : isCreative
                    ? ['Intermediate']
                    : ['Entry', 'Intermediate'];

            const sampleTitles = unique([
                `${query} services`,
                `${query} implementation`,
                `${query} specialist`
            ]).slice(0, 5);

            const sampleTags = unique([
                query,
                ...query.split(/\s+/),
                ...marketplaceSkills.slice(0, 4),
                ...(catalogSignal.categories.slice(0, 4) || [])
            ]).slice(0, 10);

            return {
                query,
                url: `https://www.upwork.com/freelance-jobs/${slugify(query)}/`,
                opportunityCount,
                sampleTitles,
                sampleBudgets,
                sampleDurations,
                sampleExperienceLevels,
                sampleTags
            };
        });
    }

    private async extractOpportunityCards(page: Page): Promise<string[]> {
        const headings = await page.locator('h2').evaluateAll(nodes =>
            nodes
                .map(node => node.textContent?.trim() || '')
                .filter(text => text && !/find the best|jobs posted on upwork|find freelance jobs/i.test(text))
        );

        const cards: string[] = [];
        for (const heading of headings.slice(0, 8)) {
            const headingLocator = page.locator('h2', { hasText: heading }).first();
            const cardText = await headingLocator.evaluate(node => node.parentElement?.textContent || node.textContent || '');
            if (/posted/i.test(cardText) || /fixed-price|hourly/i.test(cardText)) {
                cards.push(cardText);
            }
        }

        if (!cards.length) {
            const bodyText = await page.locator('body').innerText();
            const chunks = bodyText.split(/##\s+/).slice(1);
            for (const chunk of chunks.slice(0, 8)) {
                if (/posted/i.test(chunk) || /fixed-price|hourly/i.test(chunk)) {
                    cards.push(chunk);
                }
            }
        }

        return cards;
    }

    private async extractCatalogCards(page: Page): Promise<string[]> {
        const anchors = page.locator('a[href*="/services/product/"]');
        const texts = await anchors.evaluateAll(nodes =>
            nodes
                .map(node => node.parentElement?.innerText || node.textContent || '')
                .filter(text => text && /From\$/i.test(text))
        );

        if (texts.length) {
            return texts.slice(0, 12);
        }

        const bodyText = await page.locator('body').innerText();
        const sections = bodyText.split(/【\d+†/).slice(1);
        return sections.filter(section => /From\$/i.test(section)).slice(0, 12);
    }

    private buildCandidates(opportunitySignals: OpportunitySurfaceSignal[], catalogSignal: CatalogSurfaceSignal): NicheResearchCandidate[] {
        const candidates = opportunitySignals.map(signal => {
            const { category, subcategory } = mapOpportunityCategory(signal.query);
            const queryLower = signal.query.toLowerCase();
            const matchedCatalogProjects = catalogSignal.featuredProjects.filter(project => {
                const title = project.title.toLowerCase();
                return title.includes(queryLower) || queryLower.includes(title) || project.category.toLowerCase().includes(queryLower);
            });
            const catalogPrices = matchedCatalogProjects.map(project => project.priceUsd || 0).filter(price => price > 0);
            const catalogHits = matchedCatalogProjects.length;
            const demandScore = demandScoreFromOpportunityCount(signal.opportunityCount);
            const ticketRangeUsd = ticketRangeFromBudgets(signal.sampleBudgets, catalogPrices);
            const competitionPressureScore = competitionPressureFromDemandAndCatalog(signal.opportunityCount, catalogHits);
            const complexityPressureScore = complexityScoreFromText(
                signal.query,
                [...signal.sampleTags, ...signal.sampleExperienceLevels],
                signal.sampleTitles,
                signal.sampleDurations
            );
            const fitScore = fitScoreFromText(signal.query, signal.sampleTags, signal.sampleTitles);
            const speedToCashScore = speedToCashScoreFromOpportunitySignal(signal.opportunityCount, signal.sampleBudgets, signal.sampleDurations);
            const estimatedDeliveryHours = clamp(
                Math.round(6 + complexityPressureScore / 3 + ticketRangeUsd.maxUsd / 500),
                3,
                120
            );
            const expectedNegotiatedValueUsd = negotiateValueFromTicketRange(ticketRangeUsd);
            const estimatedTokenCostUsd = round2(
                clamp((complexityPressureScore / 100) * 22 + (signal.sampleTitles.some(title => /ai|llm|automation|python|chatbot/i.test(title)) ? 8 : 0), 2, 60)
            );
            const estimatedLaborCostUsd = round2(estimatedDeliveryHours * 25);
            const estimatedInfraCostUsd = round2(
                signal.sampleTitles.some(title => /ai|llm|automation|python|chatbot|api|rag/i.test(title)) ? 8 : 3
            );

            return {
                id: slugify(signal.query),
                name: signal.query,
                surface: mapSurface(signal.query),
                category,
                subcategory,
                skillCluster: unique([
                    signal.query,
                    ...signal.sampleTags.slice(0, 5),
                    ...matchedCatalogProjects.slice(0, 3).map(project => project.title)
                ]),
                demandScore,
                ticketRangeUsd,
                competitionPressureScore,
                complexityPressureScore,
                fitScore,
                speedToCashScore,
                estimatedDeliveryHours,
                estimatedTokenCostUsd,
                estimatedInfraCostUsd,
                estimatedLaborCostUsd,
                expectedNegotiatedValueUsd,
                caseStrategy: caseStrategyFromOpportunitySignal(signal.query, signal.sampleTags, signal.opportunityCount),
                evidence: [
                    `Opportunities on Upwork: ${signal.opportunityCount}`,
                    `Catalog matches: ${catalogHits}`,
                    ...signal.sampleTitles.slice(0, 3).map(title => `Opportunity sample: ${title}`),
                    ...matchedCatalogProjects.slice(0, 3).map(project => `Catalog sample: ${project.title}`),
                    ...signal.sampleBudgets.slice(0, 3).map(price => `Observed budget: $${price}`)
                ],
                sourceUrls: [signal.url, catalogSignal.url],
                notes: signal.sampleDurations.length ? `Observed durations: ${signal.sampleDurations.join(', ')}` : undefined
            } satisfies NicheResearchCandidate;
        });

        return candidates.sort((a, b) => {
            const aScore = a.demandScore + a.fitScore + a.speedToCashScore - a.competitionPressureScore - a.complexityPressureScore;
            const bScore = b.demandScore + b.fitScore + b.speedToCashScore - b.competitionPressureScore - b.complexityPressureScore;
            return bScore - aScore;
        });
    }
}
