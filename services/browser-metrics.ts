import * as fs from 'fs';
import * as path from 'path';

export interface BrowserRunTelemetry {
    challengeWaits: number;
    retries: number;
}

export interface BrowserRunOutputPaths {
    markdownPath: string;
    jsonPath: string;
    sqlitePath: string;
}

export interface BrowserFlowSnapshot {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    success: boolean;
}

export interface BrowserRunMetrics {
    sourcePath: string;
    runStartedAt: string;
    runEndedAt: string;
    durationMs: number;
    success: boolean;
    opportunitiesCollected: number;
    challengeWaits: number;
    retries: number;
    outputs: BrowserRunOutputPaths;
    browserFlow?: BrowserFlowSnapshot;
    errorMessage?: string;
}

export function createBrowserRunTelemetry(): BrowserRunTelemetry {
    return {
        challengeWaits: 0,
        retries: 0
    };
}

export function buildBrowserRunMetrics(metrics: BrowserRunMetrics): BrowserRunMetrics {
    return metrics;
}

export function writeBrowserRunMetrics(filePath: string, metrics: BrowserRunMetrics): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(metrics), 'utf8');
}
