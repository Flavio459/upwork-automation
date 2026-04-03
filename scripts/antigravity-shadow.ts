import fs from 'fs';
import dotenv from 'dotenv';
import { getAntigravityShadowConfig } from '../services/antigravity/config';
import {
    getEligibleTask,
    loadGoal,
    loadQueue,
    resolveRepoPath,
    unlockBlockedTasks
} from '../services/antigravity/json-queue';
import { AntigravityQueueService } from '../services/antigravity/queue-service';
import { AntigravityStateStore } from '../services/antigravity/state-store';
import { projectShadowStatus } from '../services/antigravity/status-projector';
import { AntigravityJobPayload, ValidationResult } from '../services/antigravity/types';

dotenv.config({ quiet: true });

type CliOptions = Record<string, string | boolean>;

function parseArgs(argv: string[]): { command: string | null; options: CliOptions } {
    const [command, ...rest] = argv;
    const options: CliOptions = {};

    for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const next = rest[index + 1];
        if (!next || next.startsWith('--')) {
            options[key] = true;
            continue;
        }

        options[key] = next;
        index += 1;
    }

    return { command: command ?? null, options };
}

function getRequiredOption(options: CliOptions, key: string): string {
    const value = options[key];
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`Missing required option --${key}.`);
    }

    return value;
}

function getOptionalOption(options: CliOptions, key: string): string | undefined {
    const value = options[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getRepoRoot(): string {
    return process.cwd();
}

function toPayload(task: {
    id: string;
    missionStage: string;
    taskFile: string;
    resultFile: string;
    contextFiles: string[];
    validationCommands: string[];
    profile?: string;
    dependsOn: string[];
}): AntigravityJobPayload {
    return {
        taskId: task.id,
        missionStage: task.missionStage,
        taskFile: task.taskFile,
        resultFile: task.resultFile,
        contextFiles: task.contextFiles,
        validationCommands: task.validationCommands,
        profile: task.profile,
        dependsOn: task.dependsOn
    };
}

async function withRuntime<T>(
    repoRoot: string,
    handler: (runtime: {
        config: ReturnType<typeof getAntigravityShadowConfig>;
        queueService: AntigravityQueueService;
        stateStore: AntigravityStateStore;
    }) => Promise<T>
): Promise<T> {
    const config = getAntigravityShadowConfig(repoRoot);
    const queueService = new AntigravityQueueService(config);
    const stateStore = new AntigravityStateStore(config.sqlitePath);

    await stateStore.initialize();
    try {
        await queueService.connect();
        return await handler({ config, queueService, stateStore });
    } finally {
        try {
            await queueService.close();
        } finally {
            await stateStore.close();
        }
    }
}

async function enqueueNext(repoRoot: string, options: CliOptions): Promise<Record<string, unknown>> {
    const queueFile = getOptionalOption(options, 'queue-file') ?? 'automation/antigravity-queue.json';
    const goalFile = getOptionalOption(options, 'goal-file') ?? 'automation/antigravity-goal.json';
    const requestedTaskId = getOptionalOption(options, 'task-id');
    const goal = loadGoal(repoRoot, goalFile);

    if (goal.modelTested || goal.stopRequested) {
        throw new Error('Dispatch blocked because the Antigravity goal is already closed.');
    }

    const queue = unlockBlockedTasks(loadQueue(repoRoot, queueFile));
    const task = getEligibleTask(queue, requestedTaskId);

    if (!task) {
        return {
            enqueued: false,
            reason: requestedTaskId
                ? `Task '${requestedTaskId}' is not eligible for shadow dispatch.`
                : 'No pending Antigravity task is eligible for shadow dispatch.'
        };
    }

    return withRuntime(repoRoot, async ({ queueService, stateStore }) => {
        const activeTask = await stateStore.getActiveTask();
        if (activeTask) {
            throw new Error(
                `Shadow dispatch refused because task '${activeTask.taskId}' is already active in state '${activeTask.state}'.`
            );
        }

        const payload = toPayload(task);
        const job = await queueService.enqueueDispatch(payload);
        await stateStore.upsertQueuedState({
            ...payload,
            queueJobId: String(job.id ?? task.id),
            mirrorJsonStatus: task.status
        });

        return {
            enqueued: true,
            taskId: task.id,
            queueJobId: String(job.id ?? task.id),
            queueFile: resolveRepoPath(repoRoot, queueFile)
        };
    });
}

async function syncLaunch(repoRoot: string, options: CliOptions): Promise<Record<string, unknown>> {
    const queueFile = getOptionalOption(options, 'queue-file') ?? 'automation/antigravity-queue.json';
    const taskId = getRequiredOption(options, 'task-id');
    const acceptedAt = getRequiredOption(options, 'accepted-at');
    const startedAt = getRequiredOption(options, 'started-at');
    const dispatchPromptFile = getRequiredOption(options, 'dispatch-prompt-file');
    const launchPid = Number.parseInt(getRequiredOption(options, 'launch-pid'), 10);
    const launchProfile = getOptionalOption(options, 'launch-profile');

    if (Number.isNaN(launchPid)) {
        throw new Error('launch-pid is invalid.');
    }

    const queue = unlockBlockedTasks(loadQueue(repoRoot, queueFile));
    const task = queue.tasks.find((candidate) => candidate.id === taskId);
    if (!task) {
        throw new Error(`Task '${taskId}' was not found in the mirror queue.`);
    }

    return withRuntime(repoRoot, async ({ stateStore }) => {
        const existingState = await stateStore.getTaskState(taskId);
        if (!existingState) {
            const payload = toPayload(task);
            await stateStore.upsertQueuedState({
                ...payload,
                queueJobId: task.id,
                mirrorJsonStatus: task.status
            });
        }

        await stateStore.applyLaunchSync({
            taskId,
            acceptedAt,
            startedAt,
            launchPid,
            launchProfile,
            dispatchPromptFile
        });

        return {
            taskId,
            accepted: true,
            running: true,
            launchPid,
            launchProfile: launchProfile ?? null,
            dispatchPromptFile
        };
    });
}

async function syncReview(repoRoot: string, options: CliOptions): Promise<Record<string, unknown>> {
    const taskId = getRequiredOption(options, 'task-id');
    const state = getRequiredOption(options, 'state') as 'review_pending' | 'completed' | 'needs_attention';
    const reviewedAt = getOptionalOption(options, 'reviewed-at');
    const resultObservedAt = getOptionalOption(options, 'result-observed-at');
    const completedAt = getOptionalOption(options, 'completed-at');
    const attentionReason = getOptionalOption(options, 'attention-reason');
    const lastReviewMessage = getOptionalOption(options, 'last-review-message');
    const validationResultsPath = getOptionalOption(options, 'validation-results-path');

    let validationResults: ValidationResult[] | undefined;
    if (validationResultsPath) {
        const raw = fs.readFileSync(resolveRepoPath(repoRoot, validationResultsPath), 'utf8');
        validationResults = JSON.parse(raw) as ValidationResult[];
    }

    return withRuntime(repoRoot, async ({ stateStore }) => {
        await stateStore.applyReviewSync({
            taskId,
            state,
            reviewedAt,
            resultObservedAt,
            completedAt,
            attentionReason,
            lastReviewMessage,
            validationResults
        });

        return {
            taskId,
            state
        };
    });
}

async function requeueTask(repoRoot: string, options: CliOptions): Promise<Record<string, unknown>> {
    const queueFile = getOptionalOption(options, 'queue-file') ?? 'automation/antigravity-queue.json';
    const taskId = getRequiredOption(options, 'task-id');
    const queue = unlockBlockedTasks(loadQueue(repoRoot, queueFile));
    const task = queue.tasks.find((candidate) => candidate.id === taskId);

    if (!task) {
        throw new Error(`Task '${taskId}' was not found in the mirror queue.`);
    }

    return withRuntime(repoRoot, async ({ stateStore }) => {
        await stateStore.applyRequeue({
            taskId,
            mirrorJsonStatus: task.status,
            lastReviewMessage: 'Task manually requeued for a clean relaunch.'
        });

        return {
            taskId,
            requeued: true
        };
    });
}

async function projectStatus(repoRoot: string, options: CliOptions): Promise<Record<string, unknown>> {
    const queueFile = getOptionalOption(options, 'queue-file') ?? 'automation/antigravity-queue.json';
    const goalFile = getOptionalOption(options, 'goal-file') ?? 'automation/antigravity-goal.json';
    const queue = unlockBlockedTasks(loadQueue(repoRoot, queueFile));
    const goal = loadGoal(repoRoot, goalFile);

    return withRuntime(repoRoot, async ({ config, queueService, stateStore }) => {
        const result = await projectShadowStatus({
            repoRoot,
            outputJsonPath: config.shadowStatusJsonPath,
            outputMarkdownPath: config.shadowStatusMarkdownPath,
            queueDocument: queue,
            goalDocument: goal,
            stateStore,
            queueService
        });

        return {
            projected: true,
            outputJsonPath: result.outputJsonPath,
            outputMarkdownPath: result.outputMarkdownPath
        };
    });
}

async function main(): Promise<void> {
    const repoRoot = getRepoRoot();
    const { command, options } = parseArgs(process.argv.slice(2));

    if (!command) {
        throw new Error('Missing command. Use enqueue-next, sync-launch, sync-review, or project-status.');
    }

    let result: Record<string, unknown>;

    switch (command) {
        case 'enqueue-next':
            result = await enqueueNext(repoRoot, options);
            break;
        case 'sync-launch':
            result = await syncLaunch(repoRoot, options);
            break;
        case 'sync-review':
            result = await syncReview(repoRoot, options);
            break;
        case 'project-status':
            result = await projectStatus(repoRoot, options);
            break;
        case 'requeue-task':
            result = await requeueTask(repoRoot, options);
            break;
        default:
            throw new Error(`Unknown command '${command}'.`);
    }

    process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
});
