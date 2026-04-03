
export interface ParsedOpportunity {
    title: string;
    description: string;
    budget: string;
    url: string;
    opportunityType: 'Fixed' | 'Hourly' | 'Unknown';
    postedDate: string;
}

class EmailParser {
    /**
     * Extrai dados estruturados do HTML do e-mail
     * Esta é uma implementação baseada em Regex para o MVP.
     * Pode ser melhorada com BeautifulSoup (se fosse Python) ou Cheerio (JS).
     */
    parseEmail(emailBody: string, subject: string): ParsedOpportunity | null {
        try {
            // Tentar extrair o link da opportunity primeiro, pois é crítico
            // Padrão comum em e-mails do Upwork: links para páginas de opportunity.
            const urlMatch = emailBody.match(/https:\/\/www\.upwork\.com\/jobs\/[^"'\s>]+/);
            if (!urlMatch) {
                console.log('⚠️ URL da opportunity não encontrada no e-mail.');
                // Se não tiver URL, pode ser um e-mail genérico
                if (!subject.includes("Opportunity Match")) return null;
            }

            const url = urlMatch ? urlMatch[0] : '';

            // Extração "Naive" para MVP. 
            // Em produção, usaríamos uma lib de parsing de HTML como 'cheerio' para limpar as tags.
            // Aqui vamos limpar tags básicas para pegar o texto.
            const cleanText = this.stripHtml(emailBody);

            // Tentar extrair orçamento
            // Padrões: "Budget: $500.00", "Hourly Range: $20.00-$40.00"
            let budget = 'Negotiable';
            let opportunityType: 'Fixed' | 'Hourly' | 'Unknown' = 'Unknown';

            const budgetMatch = cleanText.match(/Budget:?\s*\$([\d,]+)/i);
            const hourlyMatch = cleanText.match(/Hourly Range:?\s*\$([\d,]+)-\$([\d,]+)/i);

            if (budgetMatch) {
                budget = `$${budgetMatch[1]}`;
                opportunityType = 'Fixed';
            } else if (hourlyMatch) {
                budget = `$${hourlyMatch[1]}-$${hourlyMatch[2]}/hr`;
                opportunityType = 'Hourly';
            }

            // Título geralmente está no começo ou no assunto
            // Se for "Opportunity Match", o título do e-mail é "Opportunity Match: [Opportunity Title]"
            let title = subject;
            if (subject.startsWith('Opportunity Match - ')) {
                title = subject.replace('Opportunity Match - ', '').trim();
            }

            // Descrição é o desafio. No e-mail vem um trecho.
            // Vamos pegar um bloco de texto razoável.
            // Simplificação: Pegar os primeiros 500 caracteres limpos após o título
            const description = cleanText.substring(0, 1000); // Pegar bastante contexto

            return {
                title,
                description,
                budget,
                url,
                opportunityType,
                postedDate: new Date().toISOString()
            };

        } catch (error) {
            console.error('Erro ao fazer parse do e-mail:', error);
            return null;
        }
    }

    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>?/gm, ' ') // Substituir tags por espaço
            .replace(/\s+/g, ' ')       // Remover espaços múltiplos
            .trim();
    }
}

export default EmailParser;
