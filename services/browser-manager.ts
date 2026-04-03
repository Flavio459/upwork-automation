import { chromium } from 'playwright-extra';
import { Browser, BrowserContext, Page } from 'playwright';
// @ts-ignore
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Adiciona o plugin Stealth no Playwright
chromium.use(stealthPlugin());

export class BrowserManager {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private connectedViaCdp = false;
    private readonly USER_DATA_DIR = path.resolve(__dirname, '../.upwork-session');
    private activeUserDataDir = this.USER_DATA_DIR;
    private readonly chromePath = process.env.UPWORK_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    private readonly remoteDebuggingUrl = process.env.UPWORK_CHROME_REMOTE_DEBUGGING_URL || 'http://127.0.0.1:9222';

    /**
     * Inicializa um Perfil de Navegador Persistente para o Upwork.
     * @param headless Se `false`, o navegador é exibido (ideal para setup/login inicial).
     */
    async init(headless: boolean = true): Promise<BrowserContext> {
        if (this.context) return this.context;

        console.log(`\n🌐 [BrowserManager] Iniciando Chromium persistente... (Headless: ${headless})`);

        if (!headless) {
            const attachedContext = await this.tryAttachToExistingBrowser();
            if (attachedContext) {
                return attachedContext;
            }
        }
        
        // Garante que o diretório exista
        if (!fs.existsSync(this.USER_DATA_DIR)) {
            fs.mkdirSync(this.USER_DATA_DIR, { recursive: true });
        }

        try {
            this.context = await this.launchPersistentContext(this.USER_DATA_DIR, headless);
            this.activeUserDataDir = this.USER_DATA_DIR;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (
                message.includes('Target page, context or browser has been closed') ||
                message.includes('ProcessSingleton') ||
                message.includes('Lock file can not be created')
            ) {
                const clonedProfileDir = this.cloneUserDataDir();
                console.log(`♻️ [BrowserManager] Perfil principal bloqueado. Usando cópia temporária: ${clonedProfileDir}`);

                try {
                    this.context = await this.launchPersistentContext(clonedProfileDir, headless);
                    this.activeUserDataDir = clonedProfileDir;
                } catch (cloneError) {
                    const cloneMessage = cloneError instanceof Error ? cloneError.message : String(cloneError);
                    throw new Error(
                        [
                            `Nao foi possivel abrir a sessao persistente em ${this.USER_DATA_DIR}.`,
                            `Tambem falhou a copia temporaria em ${clonedProfileDir}.`,
                            `Erro original: ${message}`,
                            `Erro da copia: ${cloneMessage}`
                        ].join(' ')
                    );
                }
            } else {
                throw error;
            }
        }

        // Simula permissões "normais"
        await this.context.grantPermissions(['notifications', 'geolocation']);

        return this.context;
    }

    private async tryAttachToExistingBrowser(): Promise<BrowserContext | null> {
        try {
            const response = await fetch(`${this.remoteDebuggingUrl}/json/version`, {
                signal: AbortSignal.timeout(2000)
            });

            if (!response.ok) {
                return null;
            }
        } catch {
            return null;
        }

        try {
            this.browser = await chromium.connectOverCDP(this.remoteDebuggingUrl);
            this.connectedViaCdp = true;
            this.context = this.browser.contexts()[0] || null;

            if (!this.context) {
                this.browser = null;
                this.connectedViaCdp = false;
                return null;
            }

            this.activeUserDataDir = this.USER_DATA_DIR;
            console.log(`🔗 [BrowserManager] Conectado ao Chrome já aberto em ${this.remoteDebuggingUrl}`);
            return this.context;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`ℹ️ [BrowserManager] Não foi possível anexar ao Chrome existente: ${message}`);
            this.browser = null;
            this.context = null;
            this.connectedViaCdp = false;
            return null;
        }
    }

    private launchPersistentContext(userDataDir: string, headless: boolean): Promise<BrowserContext> {
        const launchOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
            headless,
            viewport: { width: 1280, height: 720 },
            ignoreDefaultArgs: ['--enable-automation'],
            args: ['--disable-blink-features=AutomationControlled']
        };

        if (fs.existsSync(this.chromePath)) {
            launchOptions.executablePath = this.chromePath;
        }

        return chromium.launchPersistentContext(userDataDir, launchOptions);
    }

    private cloneUserDataDir(): string {
        const cloneDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upwork-session-clone-'));

        fs.cpSync(this.USER_DATA_DIR, cloneDir, {
            recursive: true,
            force: true,
            errorOnExist: false,
            filter: sourcePath => {
                const name = path.basename(sourcePath);
                return !['SingletonCookie', 'SingletonLock', 'SingletonSocket', 'lockfile'].includes(name);
            }
        });

        return cloneDir;
    }

    /**
     * Função auxiliar para emular "tempo de pensamento" do usuário.
     */
    async randomJitter(minMs: number = 800, maxMs: number = 2500) {
        const delay = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Pequena simulação de mouse para a Cloudflare não notar que a página foi sugada.
     */
    async humanScroll(page: Page) {
        await page.mouse.wheel(0, Math.random() * 500 + 200);
        await this.randomJitter(500, 1500);
        await page.mouse.wheel(0, -(Math.random() * 200 + 100));
        await this.randomJitter();
    }

    async close() {
        if (this.context) {
            console.log(`🌐 [BrowserManager] Salvando cookies e encerrando sessão...`);

            if (!this.connectedViaCdp) {
                await this.context.close();
            }

            this.browser = null;
            this.context = null;
            this.connectedViaCdp = false;
            this.activeUserDataDir = this.USER_DATA_DIR;
        }
    }
}
