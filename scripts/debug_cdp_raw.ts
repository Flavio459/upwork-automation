import http from 'http';

const REMOTE_DEBUG_URL = 'http://127.0.0.1:9222';

function get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function scrapeUpworkRaw() {
    try {
        console.log(`🔍 [AGENTE] Conectando à API JSON de Debug em ${REMOTE_DEBUG_URL}...`);
        const tabs = await get(`${REMOTE_DEBUG_URL}/json`);
        const upworkTab = tabs.find((t: any) => t.url && t.url.includes('upwork.com'));

        if (!upworkTab) {
            console.error('❌ Aba do Upwork não encontrada. Por favor, deixe a aba de busca aberta no Chrome.');
            return;
        }

        console.log(`✅ Capturando dados de: ${upworkTab.title}`);
        
        // Em um cenário real, poderíamos usar o WebSocketDebuggerUrl para dar comandos RAW
        // Mas para agora, vamos apenas confirmar que temos o link.
        console.log(`🔗 Link da busca: ${upworkTab.url}`);
        console.log(`📂 ID da aba: ${upworkTab.id}`);
        console.log('\n🚀 [SUCESSO] Sessão detectada e pronta para o funil agêntico.');

    } catch (error) {
        console.error('❌ Erro de conexão:', error instanceof Error ? error.message : String(error));
    }
}

scrapeUpworkRaw();
