import { chromium } from 'playwright-extra';
import { Browser, BrowserContext, Page } from 'playwright';
import * as http from 'http';
// @ts-ignore
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class BrowserManager {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private connectedViaCdp = false;
    private readonly USER_DATA_DIR = path.resolve(__dirname, '../.upwork-session');
    private readonly REMOTE_DEBUGGING_PORT = 9222;

    private get remoteDebuggingUrl(): string {
        return `http://127.0.0.1:${this.REMOTE_DEBUGGING_PORT}`;
    }

    async init(headless: boolean = false): Promise<BrowserContext> {
        const attached = await this.attach();
        if (attached) return attached;
        throw new Error('Falha crítica ao iniciar ou anexar ao navegador.');
    }

    async attach(): Promise<BrowserContext | null> {
        console.log(`🌐 [BrowserManager] Iniciando Chromium persistente... (Headless: false)`);
        
        const cdpContext = await this.tryAttachToExistingBrowser();
        if (cdpContext) return cdpContext;

        console.log(`   ⚠️ [BrowserManager] Falha ao anexar via CDP. Tentando lançamento direto...`);

        try {
            this.context = await this.launchPersistentContext(this.USER_DATA_DIR, false);
            console.log(`   ✅ [BrowserManager] Nova instância lançada com sucesso.`);
            return this.context;
        } catch (error) {
            console.error(`   ❌ [BrowserManager] Erro fatal:`, error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    private async tryAttachToExistingBrowser(): Promise<BrowserContext | null> {
        console.log(`🔍 [BrowserManager] Tentando anexar ao Chrome em ${this.remoteDebuggingUrl}...`);
        
        // LIMPEZA DE LOCK AGÊNTICA: Se o lock file existir, o CDP vai dar timeout. 
        // Vamos forçar a deleção para o Playwright não engasgar.
        try {
            const singletonLock = path.join(this.USER_DATA_DIR, 'SingletonLock');
            if (fs.existsSync(singletonLock)) {
                console.log(`   🧹 [BrowserManager] Perfil bloqueado Detectado. Forçando liberação...`);
                fs.unlinkSync(singletonLock);
            }
        } catch { /* ignore if busy */ }

        const isUp = await this.checkDebugPort();
        if (!isUp) return null;

        try {
            console.log(`   🧪 [BrowserManager] Iniciando handshake CDP (Timeout: 60s)...`);
            this.browser = await chromium.connectOverCDP(this.remoteDebuggingUrl, { timeout: 60000 });
            this.connectedViaCdp = true;
            this.context = this.browser.contexts()[0] || null;
            return this.context;
        } catch (error) {
            console.log(`   ❌ [BrowserManager] Falha no handshake CDP: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }

    private checkDebugPort(): Promise<boolean> {
        return new Promise((resolve) => {
            const req = http.get(`${this.remoteDebuggingUrl}/json/version`, { timeout: 2000 }, (res) => {
                resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.end();
        });
    }

    /**
     * Fallback Agêntico: Retorna o link do WebSocket direto da aba para extração RAW se o Playwright travar.
     */
    async getUpworkWebSocketUrl(): Promise<string | null> {
        return new Promise((resolve) => {
            http.get(`${this.remoteDebuggingUrl}/json`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const tabs = JSON.parse(data);
                        const utab = tabs.find((t: any) => t.url && t.url.includes('upwork.com'));
                        resolve(utab?.webSocketDebuggerUrl || null);
                    } catch { resolve(null); }
                });
            }).on('error', () => resolve(null));
        });
    }

    private async launchPersistentContext(userDataDir: string, headless: boolean): Promise<BrowserContext> {
        chromium.use(stealthPlugin());
        return await chromium.launchPersistentContext(userDataDir, {
            headless,
            viewport: { width: 1280, height: 720 },
            args: ['--disable-blink-features=AutomationControlled']
        });
    }

    async close() {
        if (this.context && !this.connectedViaCdp) await this.context.close();
        if (this.browser) await this.browser.close();
        this.context = null;
        this.browser = null;
    }
}
