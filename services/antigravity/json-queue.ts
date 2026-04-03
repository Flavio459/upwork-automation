import fs from 'fs';
import path from 'path';
import { GoalDocument, JsonQueueDocument, JsonQueueTask } from './types';

function readJsonFile(targetPath: string): Record<string, unknown> {
    const raw = fs.readFileSync(targetPath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw) as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        return [value];
    }

    return [];
}

function normalizeOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalNullableString(value: unknown): string | null | undefined {
    if (value === null) {
        return null;
    }

    return normalizeOptionalString(value);
}

function normalizeOptionalNumber(value: unknown): number | null | undefined {
    if (value === null) {
        return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    return undefined;
}

export function resolveRepoPath(repoRoot: string, targetPath: string): string {
    if (path.isAbsolute(targetPath)) {
        return targetPath;
    }

    return path.resolve(repoRoot, targetPath);
}

export function loadGoal(repoRoot: string, goalFile: string): GoalDocument {
    const goalPath = resolveRepoPath(repoRoot, goalFile);
    const raw = readJsonFile(goalPath);

    return {
        version: Number(raw.version ?? 1),
        goal: String(raw.goal ?? ''),
        modelTested: Boolean(raw.modelTested),
        stopRequested: Boolean(raw.stopRequested)
    };
}

function normalizeTask(raw: Record<string, unknown>): JsonQueueTask {
    return {
        id: String(raw.id),
        status: String(raw.status) as JsonQueueTask['status'],
        missionStage: String(raw.missionStage ?? ''),
        taskFile: String(raw.taskFile ?? ''),
        resultFile: String(raw.resultFile ?? ''),
        contextFiles: normalizeStringArray(raw.contextFiles),
        validationCommands: normalizeStringArray(raw.validationCommands),
        profile: normalizeOptionalString(raw.profile),
        dependsOn: normalizeStringArray(raw.dependsOn),
        startedAt: normalizeOptionalNullableString(raw.startedAt),
        completedAt: normalizeOptionalNullableString(raw.completedAt),
        reviewedAt: normalizeOptionalNullableString(raw.reviewedAt),
        resultObservedAt: normalizeOptionalNullableString(raw.resultObservedAt),
        launchPid: normalizeOptionalNumber(raw.launchPid),
        launchProfile: normalizeOptionalNullableString(raw.launchProfile),
        dispatchPromptFile: normalizeOptionalNullableString(raw.dispatchPromptFile),
        attentionReason: normalizeOptionalNullableString(raw.attentionReason),
        lastReviewMessage: normalizeOptionalNullableString(raw.lastReviewMessage)
    };
}

export function loadQueue(repoRoot: string, queueFile: string): JsonQueueDocument {
    const queuePath = resolveRepoPath(repoRoot, queueFile);
    const raw = readJsonFile(queuePath);
    const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : [];

    return {
        version: Number(raw.version ?? 1),
        maxActiveTasks:
            typeof raw.maxActiveTasks === 'number' && Number.isFinite(raw.maxActiveTasks)
                ? raw.maxActiveTasks
                : 1,
        tasks: rawTasks.map((item) => normalizeTask(item as Record<string, unknown>))
    };
}

function dependenciesCompleted(tasks: JsonQueueTask[], task: JsonQueueTask): boolean {
    return task.dependsOn.every((dependencyId) => {
        const dependency = tasks.find((candidate) => candidate.id === dependencyId);
        return dependency?.status === 'completed';
    });
}

export function unlockBlockedTasks(queue: JsonQueueDocument): JsonQueueDocument {
    const clonedTasks = queue.tasks.map((task) => ({ ...task, dependsOn: [...task.dependsOn] }));

    for (const task of clonedTasks) {
        if (task.status !== 'blocked') {
            continue;
        }

        if (dependenciesCompleted(clonedTasks, task)) {
            task.status = 'pending';
            task.attentionReason = null;
            task.lastReviewMessage = 'Task unlocked because dependencies completed.';
        }
    }

    return {
        version: queue.version,
        maxActiveTasks: queue.maxActiveTasks,
        tasks: clonedTasks
    };
}

export function getEligibleTask(queue: JsonQueueDocument, taskId?: string): JsonQueueTask | null {
    if (taskId) {
        return queue.tasks.find((task) => task.id === taskId && task.status === 'pending') ?? null;
    }

    return queue.tasks.find((task) => task.status === 'pending') ?? null;
}
