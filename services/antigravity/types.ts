export type JsonQueueTaskStatus =
    | 'blocked'
    | 'pending'
    | 'running'
    | 'completed'
    | 'needs_attention';

export type ShadowTaskState =
    | 'queued'
    | 'accepted'
    | 'running'
    | 'review_pending'
    | 'completed'
    | 'needs_attention';

export interface AntigravityJobPayload {
    taskId: string;
    missionStage: string;
    taskFile: string;
    resultFile: string;
    contextFiles: string[];
    validationCommands: string[];
    profile?: string;
    dependsOn?: string[];
}

export interface ValidationResult {
    command: string;
    exitCode: number;
    success: boolean;
    output: string;
}

export interface AntigravityTaskStateRecord extends AntigravityJobPayload {
    queueJobId: string;
    state: ShadowTaskState;
    acceptedAt?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    reviewedAt?: string | null;
    launchPid?: number | null;
    launchProfile?: string | null;
    dispatchPromptFile?: string | null;
    resultObservedAt?: string | null;
    attentionReason?: string | null;
    lastReviewMessage?: string | null;
    validationResults?: ValidationResult[];
    mirrorJsonStatus?: JsonQueueTaskStatus | null;
    updatedAt: string;
}

export interface JsonQueueTask {
    id: string;
    status: JsonQueueTaskStatus;
    missionStage: string;
    taskFile: string;
    resultFile: string;
    contextFiles: string[];
    validationCommands: string[];
    profile?: string;
    dependsOn: string[];
    startedAt?: string | null;
    completedAt?: string | null;
    reviewedAt?: string | null;
    resultObservedAt?: string | null;
    launchPid?: number | null;
    launchProfile?: string | null;
    dispatchPromptFile?: string | null;
    attentionReason?: string | null;
    lastReviewMessage?: string | null;
}

export interface JsonQueueDocument {
    version: number;
    maxActiveTasks?: number;
    tasks: JsonQueueTask[];
}

export interface GoalDocument {
    version: number;
    goal: string;
    modelTested: boolean;
    stopRequested: boolean;
}
