import { BrowserManager } from '../../../services/browser-manager';
import { Page, Route } from 'playwright';

export interface UpworkEnrichedData {
    clientHistory?: {
        totalSpent?: string;
        rating?: string;
        location?: string;
    };
    fullDescription?: string;
    skills?: string[];
    isCollectedSuccessfully: boolean;
}

export interface UpworkBrowserEnricherOptions {
    headless?: boolean;
}

export class UpworkBrowserEnricher {
    private manager: BrowserManager;
    private readonly headless: boolean;

    constructor(options: UpworkBrowserEnricherOptions = {}) {
        this.manager = new BrowserManager();
        this.headless = options.headless ?? false;
    }

    /**
     * Entra na página de uma opportunity do Upwork de forma furtiva para buscar metadados profundos.
     * Assume que a sessão persistente (criada pelo login.ts) já existe e está logada.
     */
    async enrichOpportunityContext(opportunityUrl: string): Promise<UpworkEnrichedData> {
        console.log(`\n🌐 [BrowserEnricher] Navegando para: ${opportunityUrl}`);
        
        let context;
        let page: Page | null = null;
        
        try {
            // Por padrão, usamos navegador visível para reaproveitar a sessão manual.
            // Headless pode ser habilitado explicitamente via configuração.
            context = await this.manager.init(this.headless);
            page = await context.newPage();

            // Interceptadores para bloquear imagens, fontes e mídias pesadas (Otimização Extrema + Menos rastros)
            await page.route('**/*.{png,jpg,jpeg,gif,avif,webp,svg,woff2,woff,mp4,webm}', (route: Route) => route.abort());
            
            // Jitter pré-navegação
            await this.manager.randomJitter(500, 1500);

            // Acesso. waitUntil: 'domcontentloaded' é mais indetectável que 'networkidle' (bots costumam esperar idle)
            await page.goto(opportunityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            console.log(`   🔸 [BrowserEnricher] Página carregada, analisando contexto da opportunity...`);
            
            // Simula uma pessoa lendo
            await this.manager.humanScroll(page);

            // Tenta aguardar a descrição da opportunity (garantindo que não bateu na Cloudflare limit)
            // Timeout de 10s: Se o elemento up-line-clamp-v2 ou algo do layout não nascer, fomos bloqueados ou deu redirect.
            const opportunityDescriptionLocator = page.locator('[data-test="job-description-text"]').first();
            await opportunityDescriptionLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);

            // Extração de Dados ------------------------------------
            
            const result: UpworkEnrichedData = {
                isCollectedSuccessfully: false
            };

            // 1. Descrição Completa
            const isDescVisible = await opportunityDescriptionLocator.isVisible();
            if (isDescVisible) {
                result.fullDescription = await opportunityDescriptionLocator.innerText();
                result.isCollectedSuccessfully = true;
            } else {
                console.warn(`   ⚠️ [BrowserEnricher] Cloudflare ou login block? Elemento base não encontrado.`);
                return result; // Early return para evitar exceções em série
            }

            // 2. Histórico do Cliente (Painel Lateral/About Client)
            // Notas: A UI do Upwork muda de classes direto. Seletores data-test são os oficiais.
            result.clientHistory = {};
            
            const spendLocator = page.locator('[data-qa="client-spend"]').first();
            if (await spendLocator.isVisible()) {
                result.clientHistory.totalSpent = await spendLocator.innerText();
            }

            const ratingLocator = page.locator('[data-qa="client-rating"] strong').first();
            if (await ratingLocator.isVisible()) {
                result.clientHistory.rating = await ratingLocator.innerText();
            }
            
            const locationLocator = page.locator('[data-qa="client-location"] strong').first();
            if (await locationLocator.isVisible()) {
                result.clientHistory.location = await locationLocator.innerText();
            }

            // 3. Skills Enriquecidas (Tags na base)
            const skillsLocator = page.locator('[data-test="skill"] a');
            result.skills = await skillsLocator.allInnerTexts();

            console.log(`   ✅ [BrowserEnricher] Dados coletados com sucesso (Gasto: ${result.clientHistory.totalSpent || 'N/A'}).`);

            return result;

        } catch (error) {
            console.error(`   ❌ [BrowserEnricher] Falha crítica ao tentar ler o Upwork:`, error);
            return { isCollectedSuccessfully: false };
        } finally {
            if (page) await page.close(); // Fecha sempre a aba para n pesar a RAM
            // A sessão (BrowserContext) continua viva para a próxima opportunity no OpenClaw lifecycle!
        }
    }

    /**
     * Opcional: Derruba a sessão Chromium para renovar/parar.
     */
    async shutdown() {
        await this.manager.close();
    }
}

export { UpworkBrowserEnricher as UpworkScraper };
