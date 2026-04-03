import EmailService from './services/email-service';

async function getToken() {
    const service = new EmailService();
    await service.authenticateInteractively();
}

getToken().catch((error) => {
    console.error('❌ Erro ao obter token:', error);
    process.exitCode = 1;
});
