import { BrowserContext, Locator, Page } from 'playwright';
import { BrowserManager } from './browser-manager';
import type { BrowserRunTelemetry } from './browser-metrics';

export interface LiveUpworkOpportunityCard {
    opportunityId?: string;
    title: string;
    description: string;
    budget: string;
    url: string;
    category?: string;
    clientRating?: string;
    clientLocation?: string;
}

export interface UpworkFeedCollectorOptions {
    headless?: boolean;
    challengeTimeoutMs?: number;
    challengeIntervalMs?: number;
    maxScrollRounds?: number;
    maxOpportunities?: number;
    telemetry?: BrowserRunTelemetry;
}

const FEED_URL = 'https://www.upwork.com/nx/find-work/best-matches';
const DEFAULT_CHALLENGE_TIMEOUT_MS = 30000;
const DEFAULT_CHALLENGE_INTERVAL_MS = 2000;
const DEFAULT_MAX_SCROLL_ROUNDS = 4;
const DEFAULT_MAX_OPPORTUNITIES = 24;
const OPPORTUNITY_CARD_SELECTORS = [
    'main section.air3-card-section.air3-card-hover',
    'section.air3-card-section.air3-card-hover',
    'main section.air3-card-hover',
    'main section.air3-card-section'
];

export class UpworkBrowserFeedCollector {
    private readonly browserManager = new BrowserManager();
    private readonly headless: boolean;
    private readonly challengeTimeoutMs: number;
    private readonly challengeIntervalMs: number;
    private readonly maxScrollRounds: number;
    private readonly maxOpportunities: number;
    private readonly telemetry?: BrowserRunTelemetry;

    constructor(options: UpworkFeedCollectorOptions = {}) {
        this.headless = options.headless ?? false;
        this.challengeTimeoutMs = options.challengeTimeoutMs ?? DEFAULT_CHALLENGE_TIMEOUT_MS;
        this.challengeIntervalMs = options.challengeIntervalMs ?? DEFAULT_CHALLENGE_INTERVAL_MS;
        this.maxScrollRounds = options.maxScrollRounds ?? DEFAULT_MAX_SCROLL_ROUNDS;
        this.maxOpportunities = options.maxOpportunities ?? DEFAULT_MAX_OPPORTUNITIES;
        this.telemetry = options.telemetry;
    }

    async collectBestMatchesOpportunities(): Promise<LiveUpworkOpportunityCard[]> {
        let context: BrowserContext | null = null;
        let page: Page | null = null;

        try {
            console.log(`📡 [UpworkFeedCollector] Inicializando motor de navegação...`);
            try {
                context = await this.browserManager.init(this.headless);
            } catch (initError) {
                console.log(`   ⚠️ [UpworkFeedCollector] Falha na inicialização clássica.`);
                const wsUrl = await this.browserManager.getUpworkWebSocketUrl();
                if (wsUrl) {
                    throw new Error(
                        `O Chrome está aberto e a aba do Upwork foi detectada, mas o Playwright não consegue o controle.\n` +
                        `Isso acontece se o processo "npm run login" ainda estiver travando o perfil.\n` +
                        `RESOLUÇÃO: Vá ao terminal onde você rodou "npm run login" e aperte CTRL+C (isso libera o lock mantendo o Chrome aberto).\n` +
                        `Depois, rode "npm run research" novamente.`
                    );
                }
                throw initError;
            }

            // Passive-reader: encontra a aba do Upwork que o usuário já abriu.
            // NUNCA usa page.goto() porque Cloudflare detecta navegação via CDP.
            const existingPages = context.pages();
            const upworkPage = existingPages.find(p => p.url().includes('upwork.com'));

            if (!upworkPage) {
                // Nenhuma aba do Upwork encontrada — instrui o usuário
                const tabUrls = existingPages.map(p => p.url()).join(', ');
                throw new Error(
                    [
                        'Nenhuma aba do Upwork encontrada no Chrome (porta 9222).',
                        `Abas visíveis: [${tabUrls || 'nenhuma'}].`,
                        '',
                        'Para resolver:',
                        '1. Abra o Chrome que foi iniciado com "npm run login"',
                        '2. Navegue manualmente para: https://www.upwork.com/nx/find-work/best-matches',
                        '3. Aguarde a página carregar completamente',
                        '4. Rode "npm run research" novamente',
                    ].join('\n')
                );
            }

            page = upworkPage;
            await page.bringToFront().catch(() => null);

            const currentUrl = page.url();
            console.log(`\n🧭 [UpworkBrowserFeedCollector] Aba Upwork encontrada: ${currentUrl}`);

            // Passive-reader: ZERO navegação automatizada. Cloudflare detecta qualquer
            // goto/redirect via CDP. O script só lê o que o usuário já abriu manualmente.
            // Se não estiver numa página de feed, avisa o usuário.
            const isFeedPage = currentUrl.includes('/find-work') ||
                               currentUrl.includes('/search/jobs') ||
                               currentUrl.includes('/freelance-jobs') ||
                               currentUrl.includes('/best-matches');

            if (!isFeedPage) {
                console.log(`   ⚠️ A aba não está numa página de feed de jobs.`);
                console.log(`   👉 Navegue manualmente para: https://www.upwork.com/nx/find-work/best-matches`);
                console.log(`   👉 Depois rode "npm run research" novamente.\n`);
            }

            // Passive-reader: tenta ler os cards diretamente.
            // O challenge check pode dar falso positivo quando o CDP está conectado,
            // então tentamos coletar primeiro e só falhamos se realmente não houver cards.
            const isChallenge = await this.isChallengePage(page);
            if (isChallenge) {
                const title = await page.title().catch(() => '');
                const snippet = await page.locator('body').innerText().catch(() => '');
                console.log(`\n   ⚠️ [Diagnóstico] Challenge detectado.`);
                console.log(`   Title: "${title}"`);
                console.log(`   Body snippet: "${snippet.slice(0, 200)}"`);
                console.log(`   Tentando ler cards mesmo assim...`);
            }

            const opportunities = await this.collectVisibleOpportunities(page);
            if (!opportunities.length) {
                throw new Error(
                    [
                        `Nenhum card de oportunidade visível em ${page.url()}.`,
                        '',
                        'Para resolver:',
                        '1. No Chrome, navegue manualmente para: https://www.upwork.com/nx/find-work/best-matches',
                        '2. Resolva qualquer challenge do Cloudflare',
                        '3. Aguarde os cards carregarem',
                        '4. Rode "npm run research" novamente',
                    ].join('\n')
                );
            }

            console.log(`   ✅ [UpworkBrowserFeedCollector] Collected ${opportunities.length} live opportunity card(s).`);
            return opportunities;
        } finally {
            // Passive-reader: NÃO fecha a aba. Mantém o contexto "quente".
            await this.browserManager.close();
        }
    }


    private async collectVisibleOpportunities(page: Page): Promise<LiveUpworkOpportunityCard[]> {
        const opportunities = new Map<string, LiveUpworkOpportunityCard>();

        for (let round = 0; round < this.maxScrollRounds && opportunities.size < this.maxOpportunities; round += 1) {
            const { locator: tiles, selector } = await this.locateOpportunityCards(page);
            const count = await tiles.count();

            if (!count) {
                if (round === 0) {
                    const bodyText = await page.locator('body').innerText().catch(() => '');
                    throw new Error(
                        [
                            'The best-matches page loaded, but no opportunity cards were found.',
                            bodyText ? `Page snippet: ${bodyText.slice(0, 500)}` : ''
                        ]
                            .filter(Boolean)
                            .join(' ')
                    );
                }

                break;
            }

            const sizeBeforeRound = opportunities.size;
            for (let index = 0; index < count && opportunities.size < this.maxOpportunities; index += 1) {
                const opportunity = await this.readOpportunityCard(tiles.nth(index), page.url()).catch(() => null);
                if (!opportunity) {
                    continue;
                }

                const dedupeKey = opportunity.url || opportunity.opportunityId || `${opportunity.title}::${opportunity.budget}`;
                if (!opportunities.has(dedupeKey)) {
                    opportunities.set(dedupeKey, opportunity);
                }
            }

            if (opportunities.size >= this.maxOpportunities) {
                break;
            }

            if (opportunities.size === sizeBeforeRound && round > 0) {
                break;
            }

            await this.scrollForMoreOpportunities(page, selector);
        }

        return [...opportunities.values()].slice(0, this.maxOpportunities);
    }

    private async scrollForMoreOpportunities(page: Page, selector: string): Promise<void> {
        const tiles = page.locator(selector);
        const beforeCount = await tiles.count().catch(() => 0);

        await page.mouse.wheel(0, 1200).catch(() => null);

        await page.waitForFunction(
            ({ expectedCount, currentSelector }) => document.querySelectorAll(currentSelector).length > expectedCount,
            { expectedCount: beforeCount, currentSelector: selector },
            { timeout: 5000, polling: this.challengeIntervalMs }
        ).catch(() => null);
    }

    private async locateOpportunityCards(page: Page): Promise<{ locator: Locator; selector: string }> {
        for (const selector of OPPORTUNITY_CARD_SELECTORS) {
            const locator = page.locator(selector);
            const count = await locator.count().catch(() => 0);
            if (count > 0) {
                return { locator, selector };
            }
        }

        return {
            locator: page.locator('[data-qa="job-tile"]'),
            selector: '[data-qa="job-tile"]'
        };
    }

    private async readOpportunityCard(tile: Locator, baseUrl: string): Promise<LiveUpworkOpportunityCard | null> {
        const raw = await tile.evaluate(node => {
            const root = node as HTMLElement;
            const text = (root.textContent || '')
                .replace(/\r/g, '')
                .split('\n')
                .map(part => part.trim())
                .filter(Boolean)
                .join('\n');

            const titleNode = root.querySelector('h2, h3, [data-qa="job-title"]');
            const anchor = root.querySelector('a[href]') as HTMLAnchorElement | null;
            const budgetNode = root.querySelector('[data-qa="budget"]');
            const categoryNode = root.querySelector('[data-qa="category"]');
            const clientRatingNode = root.querySelector('[data-qa="client-rating"]');
            const clientLocationNode = root.querySelector('[data-qa="client-location"]');

            return {
                text,
                title: titleNode?.textContent?.trim() || text.split('\n').find(Boolean) || '',
                href: anchor?.href || anchor?.getAttribute('href') || '',
                opportunityId: root.getAttribute('data-job-id') || '',
                budget: budgetNode?.textContent?.trim() || '',
                category: categoryNode?.textContent?.trim() || '',
                clientRating: clientRatingNode?.textContent?.trim() || '',
                clientLocation: clientLocationNode?.textContent?.trim() || ''
            };
        });

        const title = this.normalizeWhitespace(raw.title);
        if (!title) {
            return null;
        }

        const description = this.normalizeWhitespace(raw.text || title);
        const url = raw.href ? new URL(raw.href, baseUrl).toString() : '';

        return {
            opportunityId: this.normalizeWhitespace(raw.opportunityId) || undefined,
            title,
            description,
            budget: this.normalizeWhitespace(raw.budget) || this.extractMoney(description) || 'Negotiable',
            url,
            category: this.normalizeWhitespace(raw.category) || undefined,
            clientRating: this.normalizeWhitespace(raw.clientRating) || undefined,
            clientLocation: this.normalizeWhitespace(raw.clientLocation) || undefined
        };
    }

    private async ensurePageReady(page: Page, label: string): Promise<void> {
        if (!(await this.isChallengePage(page))) {
            return;
        }

        await this.waitForChallengeClear(page, label);

        if (await this.isChallengePage(page)) {
            throw new Error(`Cloudflare challenge still active after wait on ${label}.`);
        }
    }

    private async waitForChallengeClear(page: Page, label: string): Promise<void> {
        if (this.telemetry) {
            this.telemetry.challengeWaits += 1;
        }

        console.log(`\n🛑 [UpworkBrowserFeedCollector] Cloudflare challenge detected on ${label}.`);
        console.log('   Solve it in the opened browser window. The browser agent will keep checking until the page clears.');

        try {
            await page.waitForFunction(
                () => {
                    const text = `${document.title}\n${document.body?.innerText || ''}\n${location.href}`.toLowerCase();
                    return (
                        !text.includes('cloudflare ray id') &&
                        !text.includes('just a moment') &&
                        !text.includes('attention required') &&
                        !text.includes('um momento')
                    );
                },
                undefined,
                {
                    timeout: this.challengeTimeoutMs,
                    polling: this.challengeIntervalMs
                }
            );
        } catch {
            throw new Error(`Cloudflare challenge still active after ${Math.round(this.challengeTimeoutMs / 1000)}s on ${label}.`);
        }
    }

    private async isChallengePage(page: Page): Promise<boolean> {
        const title = await page.title().catch(() => '');
        const bodyText = await page.locator('body').innerText().catch(() => '');
        return this.isChallengeText(`${title}\n${bodyText}\n${page.url()}`);
    }

    private isChallengeText(text: string): boolean {
        const lowered = text.toLowerCase();
        return (
            lowered.includes('cloudflare ray id') ||
            lowered.includes('just a moment') ||
            lowered.includes('attention required') ||
            lowered.includes('um momento')
        );
    }

    private extractMoney(text: string): string {
        const match = text.match(/\$[\d,]+(?:\.\d+)?/);
        return match ? match[0] : '';
    }

    private normalizeWhitespace(value: string | undefined | null): string {
        return (value || '').replace(/\s+/g, ' ').trim();
    }
}

export { UpworkBrowserFeedCollector as UpworkFeedCollector };
