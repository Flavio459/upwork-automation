import fs from 'fs';
import path from 'path';
import { AntigravityQueueService } from './queue-service';
import { AntigravityStateStore } from './state-store';
import { GoalDocument, JsonQueueDocument } from './types';

function ageMinutes(isoDate: string | null | undefined): number | null {
    if (!isoDate) {
        return null;
    }

    const timestamp = Date.parse(isoDate);
    if (Number.isNaN(timestamp)) {
        return null;
    }

    return Math.max(0, Math.round((Date.now() - timestamp) / 60000));
}

function getSystemState(activeCount: number, attentionCount: number): 'idle' | 'running' | 'needs_attention' {
    if (attentionCount > 0) {
        return 'needs_attention';
    }

    if (activeCount > 0) {
        return 'running';
    }

    return 'idle';
}

export async function projectShadowStatus(options: {
    repoRoot: string;
    outputJsonPath: string;
    outputMarkdownPath: string;
    queueDocument: JsonQueueDocument;
    goalDocument: GoalDocument;
    stateStore: AntigravityStateStore;
    queueService: AntigravityQueueService;
}): Promise<{ outputJsonPath: string; outputMarkdownPath: string }> {
    const { outputJsonPath, outputMarkdownPath, queueDocument, goalDocument, stateStore, queueService } =
        options;

    const tasks = await stateStore.listTaskStates();
    const queueCounts = await queueService.getQueueCounts();
    const currentTask = await stateStore.getActiveTask();

    const activeCount = tasks.filter((task) =>
        ['accepted', 'running', 'review_pending'].includes(task.state)
    ).length;
    const attentionCount = tasks.filter((task) => task.state === 'needs_attention').length;

    const currentJobState = currentTask
        ? await queueService.getJobState(currentTask.queueJobId || currentTask.taskId)
        : null;

    const snapshot = {
        generatedAt: new Date().toISOString(),
        candidateSourceOfTruth: 'bullmq+sqlite',
        systemState: getSystemState(activeCount, attentionCount),
        goal: {
            modelTested: goalDocument.modelTested,
            stopRequested: goalDocument.stopRequested
        },
        redisQueueCounts: queueCounts,
        mirrorQueueCounts: queueDocument.tasks.reduce<Record<string, number>>(
            (accumulator, task) => {
                accumulator[task.status] = (accumulator[task.status] ?? 0) + 1;
                return accumulator;
            },
            {}
        ),
        currentTask: currentTask
            ? {
                  taskId: currentTask.taskId,
                  state: currentTask.state,
                  queueJobId: currentTask.queueJobId,
                  bullmqJobState: currentJobState,
                  launchPid: currentTask.launchPid ?? null,
                  launchProfile: currentTask.launchProfile ?? currentTask.profile ?? 'default',
                  dispatchPromptFile: currentTask.dispatchPromptFile ?? null,
                  expectedResultPath: currentTask.resultFile,
                  ageMinutes: ageMinutes(currentTask.startedAt ?? currentTask.acceptedAt ?? null)
              }
            : null,
        tasks: tasks.map((task) => ({
            taskId: task.taskId,
            state: task.state,
            queueJobId: task.queueJobId,
            mirrorJsonStatus: task.mirrorJsonStatus ?? null,
            launchPid: task.launchPid ?? null,
            profile: task.launchProfile ?? task.profile ?? 'default',
            ageMinutes: ageMinutes(task.startedAt ?? task.acceptedAt ?? null),
            resultFile: task.resultFile,
            attentionReason: task.attentionReason ?? null,
            lastReviewMessage: task.lastReviewMessage ?? null
        }))
    };

    fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
    fs.mkdirSync(path.dirname(outputMarkdownPath), { recursive: true });

    fs.writeFileSync(outputJsonPath, JSON.stringify(snapshot, null, 2));

    const lines: string[] = [];
    lines.push('# Antigravity Shadow Status');
    lines.push('');
    lines.push(`- generatedAt: ${snapshot.generatedAt}`);
    lines.push(`- candidateSourceOfTruth: ${snapshot.candidateSourceOfTruth}`);
    lines.push(`- systemState: ${snapshot.systemState}`);
    lines.push(`- modelTested: ${snapshot.goal.modelTested}`);
    lines.push(`- stopRequested: ${snapshot.goal.stopRequested}`);
    lines.push('');
    lines.push('## Current Task');
    lines.push('');

    if (!snapshot.currentTask) {
        lines.push('- none');
    } else {
        lines.push(`- taskId: ${snapshot.currentTask.taskId}`);
        lines.push(`- state: ${snapshot.currentTask.state}`);
        lines.push(`- queueJobId: ${snapshot.currentTask.queueJobId}`);
        lines.push(`- bullmqJobState: ${snapshot.currentTask.bullmqJobState}`);
        lines.push(`- launchPid: ${snapshot.currentTask.launchPid}`);
        lines.push(`- profile: ${snapshot.currentTask.launchProfile}`);
        lines.push(`- ageMinutes: ${snapshot.currentTask.ageMinutes}`);
        lines.push(`- expectedResultPath: ${snapshot.currentTask.expectedResultPath}`);
        lines.push(`- dispatchPromptFile: ${snapshot.currentTask.dispatchPromptFile}`);
    }

    lines.push('');
    lines.push('## Shadow Tasks');
    lines.push('');

    if (snapshot.tasks.length === 0) {
        lines.push('- none');
    } else {
        for (const task of snapshot.tasks) {
            lines.push(
                `- ${task.taskId}: state=${task.state} mirror=${task.mirrorJsonStatus} profile=${task.profile} age=${task.ageMinutes} pid=${task.launchPid} reason=${task.attentionReason ?? 'none'}`
            );
        }
    }

    lines.push('');
    lines.push('## Redis Queue Counts');
    lines.push('');
    for (const [key, value] of Object.entries(snapshot.redisQueueCounts)) {
        lines.push(`- ${key}: ${value}`);
    }

    lines.push('');
    lines.push('## Mirror Queue Counts');
    lines.push('');
    for (const [key, value] of Object.entries(snapshot.mirrorQueueCounts)) {
        lines.push(`- ${key}: ${value}`);
    }

    fs.writeFileSync(outputMarkdownPath, `${lines.join('\r\n')}\r\n`);
    return {
        outputJsonPath,
        outputMarkdownPath
    };
}
