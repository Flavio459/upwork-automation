import { UpworkBrowserFeedCollector, type UpworkFeedCollectorOptions, type LiveUpworkOpportunityCard } from './upwork-feed-collector';

export interface BrowserFlowResult {
    source: 'upwork-best-matches';
    success: boolean;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    opportunities: LiveUpworkOpportunityCard[];
    errorMessage?: string;
}

export type BrowserFlowOptions = UpworkFeedCollectorOptions;

export class BrowserFlow {
    private readonly collector: UpworkBrowserFeedCollector;

    constructor(options: BrowserFlowOptions = {}) {
        this.collector = new UpworkBrowserFeedCollector(options);
    }

    async collectBestMatches(): Promise<BrowserFlowResult> {
        const startedAt = new Date();

        try {
            const opportunities = await this.collector.collectBestMatchesOpportunities();
            const endedAt = new Date();

            return {
                source: 'upwork-best-matches',
                success: true,
                startedAt: startedAt.toISOString(),
                endedAt: endedAt.toISOString(),
                durationMs: endedAt.getTime() - startedAt.getTime(),
                opportunities
            };
        } catch (error) {
            const endedAt = new Date();
            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                source: 'upwork-best-matches',
                success: false,
                startedAt: startedAt.toISOString(),
                endedAt: endedAt.toISOString(),
                durationMs: endedAt.getTime() - startedAt.getTime(),
                opportunities: [],
                errorMessage
            };
        }
    }
}
