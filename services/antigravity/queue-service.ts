import IORedis from 'ioredis';
import { Job, Queue } from 'bullmq';
import { AntigravityJobPayload } from './types';
import { AntigravityShadowConfig } from './config';

export class AntigravityQueueService {
    private readonly connection: IORedis;
    private readonly dispatchQueue: Queue<AntigravityJobPayload>;

    constructor(private readonly config: AntigravityShadowConfig) {
        this.connection = new IORedis({
            host: config.redisHost,
            port: config.redisPort,
            username: config.redisUsername,
            password: config.redisPassword,
            db: config.redisDb,
            maxRetriesPerRequest: null,
            lazyConnect: true,
            enableOfflineQueue: false,
            retryStrategy: () => null
        });

        this.dispatchQueue = new Queue<AntigravityJobPayload>(config.dispatchQueueName, {
            connection: this.connection,
            defaultJobOptions: {
                attempts: 1,
                removeOnComplete: false,
                removeOnFail: false
            }
        });

        this.connection.on('error', () => {
            // Surface a single explicit connect failure from the CLI instead of noisy Redis retries.
        });
    }

    async connect(): Promise<void> {
        const probe = new IORedis({
            host: this.config.redisHost,
            port: this.config.redisPort,
            username: this.config.redisUsername,
            password: this.config.redisPassword,
            db: this.config.redisDb,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
            retryStrategy: () => null
        });

        try {
            await probe.connect();
            await probe.ping();
        } finally {
            if (probe.status === 'ready' || probe.status === 'connect') {
                await probe.quit();
            } else {
                probe.disconnect(false);
            }
        }
    }

    async enqueueDispatch(payload: AntigravityJobPayload): Promise<Job<AntigravityJobPayload>> {
        return this.dispatchQueue.add('dispatch', payload, {
            jobId: payload.taskId
        });
    }

    async getJob(jobId: string): Promise<Job<AntigravityJobPayload> | undefined> {
        return this.dispatchQueue.getJob(jobId);
    }

    async getJobState(jobId: string): Promise<string | null> {
        const job = await this.getJob(jobId);
        if (!job) {
            return null;
        }

        return job.getState();
    }

    async getQueueCounts(): Promise<Record<string, number>> {
        return this.dispatchQueue.getJobCounts(
            'active',
            'completed',
            'delayed',
            'failed',
            'paused',
            'prioritized',
            'waiting',
            'waiting-children'
        );
    }

    async close(): Promise<void> {
        await this.dispatchQueue.close();
        this.connection.disconnect(false);
    }
}
