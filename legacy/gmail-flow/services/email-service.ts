import { google } from 'googleapis';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Escopos necessários para ler o Gmail
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

class EmailService {
    private auth: any;
    private gmail: any;
    private readonly credentialsPath = path.resolve(process.cwd(), CREDENTIALS_PATH);
    private readonly tokenPath = path.resolve(process.cwd(), TOKEN_PATH);

    constructor() {
        this.auth = null;
        this.gmail = null;
    }

    /**
     * Inicializa o serviço de e-mail.
     * Carrega credenciais e configura o cliente OAuth2.
     */
    async initialize(): Promise<void> {
        const oAuth2Client = await this.createOAuthClient();
        const savedToken = await this.loadSavedToken();

        if (savedToken) {
            oAuth2Client.setCredentials(savedToken);
            this.attachClient(oAuth2Client);

            try {
                await this.assertAuthenticated();
                console.log('✅ Serviço de E-mail autenticado com sucesso via token salvo.');
                return;
            } catch (error) {
                if (!this.isAuthError(error)) {
                    throw error;
                }

                console.warn('⚠️ Token do Gmail inválido ou revogado. Será necessário reautorizar.');
            }
        } else {
            console.log('⚠️ Token do Gmail não encontrado. É necessário autenticar.');
        }

        await this.authenticateInteractively(oAuth2Client);
    }

    /**
     * Reexecuta o fluxo OAuth e salva um novo token.
     */
    async authenticateInteractively(oAuth2Client?: any): Promise<void> {
        const client = oAuth2Client || await this.createOAuthClient();
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES
        });

        console.log('\n\n🛑 ALERTA DE AUTENTICAÇÃO 🛑');
        console.log('Autorize este aplicativo visitando este URL:', authUrl);
        console.log('Depois de autorizar, cole o código retornado pelo Google no terminal.');
        this.openAuthUrl(authUrl);

        const authCode = await this.promptForAuthCode();
        const { tokens } = await client.getToken(authCode);
        const normalizedTokens = {
            ...tokens,
            refresh_token: tokens.refresh_token ?? client.credentials.refresh_token
        };

        await this.saveToken(normalizedTokens);
        client.setCredentials(normalizedTokens);
        this.attachClient(client);

        await this.assertAuthenticated();
        console.log('✅ Serviço de E-mail autenticado com sucesso via novo token.');
    }

    /**
     * Busca e-mails não lidos do Upwork com assuntos específicos
     */
    async fetchNewOpportunities(): Promise<any[]> {
        await this.ensureAuthenticated();

        try {
            // Query para filtrar e-mails do Upwork
            const query = 'from:donotreply@upwork.com is:unread subject:("Opportunity Match" OR "Invitation")';

            const res = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: 10 // Processar em lotes pequenos
            });

            const messages = res.data.messages;
            if (!messages || messages.length === 0) {
                console.log('📭 Nenhum novo e-mail de opportunity encontrado.');
                return [];
            }

            console.log(`📬 Encontrados ${messages.length} novos e-mails. Processando...`);

            const opportunities = [];
            for (const message of messages) {
                const emailData = await this.getEmailContent(message.id);
                if (emailData) {
                    opportunities.push(emailData);
                    // Marcar como lido para não processar novamente? 
                    // Por enquanto não, para facilitar testes. Em prod, sim.
                    // await this.markAsRead(message.id);
                }
            }

            return opportunities;

        } catch (error) {
            console.error('Erro ao buscar e-mails:', error);
            return [];
        }
    }

    /**
     * Obtém o conteúdo completo de uma mensagem
     */
    async getEmailContent(messageId: string): Promise<any> {
        const res = await this.gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const headers = res.data.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value;
        const date = headers.find((h: any) => h.name === 'Date')?.value;

        // Decodificar o corpo do e-mail
        let body = '';
        if (res.data.payload.parts) {
            // Tentar pegar a parte HTML primeiro
            const htmlPart = res.data.payload.parts.find((part: any) => part.mimeType === 'text/html');
            if (htmlPart && htmlPart.body.data) {
                body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            } else {
                // Fallback para texto plano
                const textPart = res.data.payload.parts.find((part: any) => part.mimeType === 'text/plain');
                if (textPart && textPart.body.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            }
        } else if (res.data.payload.body.data) {
            body = Buffer.from(res.data.payload.body.data, 'base64').toString('utf-8');
        }

        return {
            id: messageId,
            subject,
            date,
            body
        };
    }

    private async ensureAuthenticated(): Promise<void> {
        if (this.gmail) {
            try {
                await this.assertAuthenticated();
                return;
            } catch (error) {
                if (!this.isAuthError(error)) {
                    throw error;
                }
                console.warn('⚠️ A autenticação do Gmail expirou. Iniciando reautorização.');
            }
        }

        const client = await this.createOAuthClient();
        const savedToken = await this.loadSavedToken();

        if (savedToken) {
            client.setCredentials(savedToken);
            this.attachClient(client);

            try {
                await this.assertAuthenticated();
                return;
            } catch (error) {
                if (!this.isAuthError(error)) {
                    throw error;
                }
                console.warn('⚠️ O token salvo do Gmail não é mais válido. Reautorizando.');
            }
        }

        await this.authenticateInteractively(client);
    }

    private async createOAuthClient(): Promise<any> {
        const content = await fs.promises.readFile(this.credentialsPath, 'utf-8');
        const credentials = JSON.parse(content);
        const source = credentials.installed || credentials.web;
        const { client_secret, client_id, redirect_uris } = source;

        return new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] || 'http://localhost'
        );
    }

    private async loadSavedToken(): Promise<Record<string, unknown> | null> {
        try {
            const token = await fs.promises.readFile(this.tokenPath, 'utf-8');
            return JSON.parse(token) as Record<string, unknown>;
        } catch {
            return null;
        }
    }

    private async saveToken(token: Record<string, unknown>): Promise<void> {
        await fs.promises.writeFile(this.tokenPath, JSON.stringify(token, null, 2), 'utf-8');
    }

    private attachClient(client: any): void {
        this.auth = client;
        this.gmail = google.gmail({ version: 'v1', auth: this.auth });
    }

    private async assertAuthenticated(): Promise<void> {
        if (!this.gmail) {
            throw new Error('Gmail service não inicializado.');
        }

        await this.gmail.users.labels.list({
            userId: 'me',
            maxResults: 1
        });
    }

    private isAuthError(error: unknown): boolean {
        const message = error instanceof Error ? error.message : String(error);
        const response = error as { code?: number; response?: { status?: number; data?: { error?: string } } };

        return (
            response?.code === 401 ||
            response?.response?.status === 401 ||
            response?.response?.data?.error === 'invalid_grant' ||
            message.includes('invalid_grant') ||
            message.includes('unauthorized')
        );
    }

    private async promptForAuthCode(): Promise<string> {
        const rl = createInterface({ input, output });
        try {
            const answer = await rl.question(
                'Cole o código de autorização do Google ou a URL completa com ?code=...: '
            );
            const trimmed = answer.trim();
            const match = trimmed.match(/[?&]code=([^&]+)/i);
            return decodeURIComponent(match?.[1] || trimmed);
        } finally {
            rl.close();
        }
    }

    private openAuthUrl(url: string): void {
        if (process.platform !== 'win32') {
            return;
        }

        try {
            const browser = spawn('cmd', ['/c', 'start', '', url], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true
            });

            browser.unref();
        } catch {
            // If the browser cannot be opened automatically, the user can still copy the URL.
        }
    }
}

export default EmailService;
