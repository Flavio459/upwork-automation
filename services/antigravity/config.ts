import path from 'path';

export interface AntigravityShadowConfig {
    redisHost: string;
    redisPort: number;
    redisUsername?: string;
    redisPassword?: string;
    redisDb: number;
    dispatchQueueName: string;
    sqlitePath: string;
    shadowStatusJsonPath: string;
    shadowStatusMarkdownPath: string;
}

export function getAntigravityShadowConfig(repoRoot: string): AntigravityShadowConfig {
    const redisPort = Number.parseInt(process.env.ANTIGRAVITY_REDIS_PORT ?? '6379', 10);
    const redisDb = Number.parseInt(process.env.ANTIGRAVITY_REDIS_DB ?? '0', 10);

    if (Number.isNaN(redisPort)) {
        throw new Error('ANTIGRAVITY_REDIS_PORT is invalid.');
    }

    if (Number.isNaN(redisDb)) {
        throw new Error('ANTIGRAVITY_REDIS_DB is invalid.');
    }

    return {
        redisHost: process.env.ANTIGRAVITY_REDIS_HOST ?? '127.0.0.1',
        redisPort,
        redisUsername: process.env.ANTIGRAVITY_REDIS_USERNAME,
        redisPassword: process.env.ANTIGRAVITY_REDIS_PASSWORD,
        redisDb,
        dispatchQueueName: process.env.ANTIGRAVITY_DISPATCH_QUEUE ?? 'antigravity-dispatch',
        sqlitePath:
            process.env.ANTIGRAVITY_SHADOW_DB_PATH ??
            path.join(repoRoot, 'reports', 'antigravity', 'antigravity-shadow.sqlite'),
        shadowStatusJsonPath:
            process.env.ANTIGRAVITY_SHADOW_STATUS_JSON ??
            path.join(repoRoot, 'reports', 'antigravity', 'status.shadow.json'),
        shadowStatusMarkdownPath:
            process.env.ANTIGRAVITY_SHADOW_STATUS_MD ??
            path.join(repoRoot, 'reports', 'antigravity', 'status.shadow.md')
    };
}
