import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function manualAuth() {
    console.log(`\n===========================================`);
    console.log(`🛡️ INICIANDO AUTENTICAÇÃO MANUAL NO UPWORK 盾`);
    console.log(`===========================================`);
    console.log(`> Um navegador Chrome normal será aberto.`);
    console.log(`> Faça o login manual na sua conta Upwork.`);
    console.log(`> Passe por todos os Captchas ou SMS 2FA.`);
    console.log(`> Este fluxo abre o Chrome normal do sistema, sem controle automatizado.`);
    console.log(`> Quando terminar de logar, aperte CTRL+C neste terminal.\n`);

    const sessionDir = path.resolve(__dirname, '../.upwork-session');
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    const chromePath = process.env.UPWORK_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(chromePath)) {
        throw new Error(`Nao encontrei o Chrome em: ${chromePath}`);
    }

    const browser = spawn(chromePath, [
        `--user-data-dir=${sessionDir}`,
        '--remote-debugging-address=127.0.0.1',
        '--remote-debugging-port=9222',
        '--new-window',
        'https://www.upwork.com/ab/account-security/login'
    ], {
        detached: true,
        stdio: 'ignore',
        windowsHide: false
    });

    browser.unref();
    console.log(`🌐 Chrome aberto em modo normal via: ${chromePath}`);

    await new Promise<void>((resolve) => {
        let isShuttingDown = false;

        const shutdown = (signal: string) => {
            if (isShuttingDown) return;
            isShuttingDown = true;

            console.log(`\n🛑 Recebido ${signal}. Encerrando o Chrome do login e salvando a sessão...`);

            if (browser.pid) {
                try {
                    spawn('taskkill', ['/PID', String(browser.pid), '/T', '/F'], {
                        stdio: 'ignore',
                        windowsHide: true
                    });
                } catch {
                    // If taskkill is unavailable or the process already exited, continue cleanup.
                }
            }

            const lockfile = path.join(sessionDir, 'lockfile');
            if (fs.existsSync(lockfile)) {
                try {
                    fs.unlinkSync(lockfile);
                } catch {
                    // If the browser still holds it for a moment, the next launch will report that.
                }
            }

            resolve();
        };

        process.once('SIGINT', () => {
            void shutdown('SIGINT');
        });

        process.once('SIGTERM', () => {
            void shutdown('SIGTERM');
        });
    });
}

manualAuth().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
