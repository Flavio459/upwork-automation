import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import {
    AntigravityJobPayload,
    AntigravityTaskStateRecord,
    ShadowTaskState,
    ValidationResult
} from './types';

interface QueuedStateInput extends AntigravityJobPayload {
    queueJobId: string;
    mirrorJsonStatus?: string;
}

interface LaunchSyncInput {
    taskId: string;
    acceptedAt: string;
    startedAt: string;
    launchPid: number;
    launchProfile?: string;
    dispatchPromptFile: string;
}

interface ReviewSyncInput {
    taskId: string;
    state: Extract<ShadowTaskState, 'review_pending' | 'completed' | 'needs_attention'>;
    reviewedAt?: string;
    resultObservedAt?: string;
    completedAt?: string;
    attentionReason?: string;
    lastReviewMessage?: string;
    validationResults?: ValidationResult[];
}

interface RequeueInput {
    taskId: string;
    mirrorJsonStatus?: string;
    lastReviewMessage?: string;
}

type TaskRow = {
    task_id: string;
    queue_job_id: string;
    mission_stage: string;
    task_file: string;
    result_file: string;
    context_files_json: string;
    validation_commands_json: string;
    profile: string | null;
    depends_on_json: string | null;
    state: ShadowTaskState;
    accepted_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    reviewed_at: string | null;
    launch_pid: number | null;
    launch_profile: string | null;
    dispatch_prompt_file: string | null;
    result_observed_at: string | null;
    attention_reason: string | null;
    last_review_message: string | null;
    validation_results_json: string | null;
    mirror_json_status: string | null;
    updated_at: string;
};

function parseJsonArray(value: string | null): string[] {
    if (!value) {
        return [];
    }

    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
}

function parseValidationResults(value: string | null): ValidationResult[] {
    if (!value) {
        return [];
    }

    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as ValidationResult[]) : [];
}

export class AntigravityStateStore {
    private db: Database | null = null;

    constructor(private readonly dbPath: string) {}

    async initialize(): Promise<void> {
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS antigravity_task_state (
                task_id TEXT PRIMARY KEY,
                queue_job_id TEXT NOT NULL,
                mission_stage TEXT NOT NULL,
                task_file TEXT NOT NULL,
                result_file TEXT NOT NULL,
                context_files_json TEXT NOT NULL,
                validation_commands_json TEXT NOT NULL,
                profile TEXT,
                depends_on_json TEXT,
                state TEXT NOT NULL,
                accepted_at TEXT,
                started_at TEXT,
                completed_at TEXT,
                reviewed_at TEXT,
                launch_pid INTEGER,
                launch_profile TEXT,
                dispatch_prompt_file TEXT,
                result_observed_at TEXT,
                attention_reason TEXT,
                last_review_message TEXT,
                validation_results_json TEXT,
                mirror_json_status TEXT,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS antigravity_task_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT,
                created_at TEXT NOT NULL
            );
        `);
    }

    private get database(): Database {
        if (!this.db) {
            throw new Error('Antigravity state store is not initialized.');
        }

        return this.db;
    }

    async upsertQueuedState(input: QueuedStateInput): Promise<void> {
        const now = new Date().toISOString();
        await this.database.run(
            `
            INSERT INTO antigravity_task_state (
                task_id,
                queue_job_id,
                mission_stage,
                task_file,
                result_file,
                context_files_json,
                validation_commands_json,
                profile,
                depends_on_json,
                state,
                mirror_json_status,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?)
            ON CONFLICT(task_id) DO UPDATE SET
                queue_job_id = excluded.queue_job_id,
                mission_stage = excluded.mission_stage,
                task_file = excluded.task_file,
                result_file = excluded.result_file,
                context_files_json = excluded.context_files_json,
                validation_commands_json = excluded.validation_commands_json,
                profile = excluded.profile,
                depends_on_json = excluded.depends_on_json,
                state = 'queued',
                mirror_json_status = excluded.mirror_json_status,
                updated_at = excluded.updated_at
        `,
            input.taskId,
            input.queueJobId,
            input.missionStage,
            input.taskFile,
            input.resultFile,
            JSON.stringify(input.contextFiles),
            JSON.stringify(input.validationCommands),
            input.profile ?? null,
            JSON.stringify(input.dependsOn ?? []),
            input.mirrorJsonStatus ?? null,
            now
        );

        await this.logEvent(input.taskId, 'queued', {
            queueJobId: input.queueJobId,
            mirrorJsonStatus: input.mirrorJsonStatus ?? null
        });
    }

    async applyLaunchSync(input: LaunchSyncInput): Promise<void> {
        const now = new Date().toISOString();
        await this.database.run(
            `
            UPDATE antigravity_task_state
            SET
                state = 'running',
                accepted_at = ?,
                started_at = ?,
                launch_pid = ?,
                launch_profile = ?,
                dispatch_prompt_file = ?,
                attention_reason = NULL,
                last_review_message = ?,
                mirror_json_status = 'running',
                updated_at = ?
            WHERE task_id = ?
        `,
            input.acceptedAt,
            input.startedAt,
            input.launchPid,
            input.launchProfile ?? null,
            input.dispatchPromptFile,
            `Accepted and launched with pid=${input.launchPid}.`,
            now,
            input.taskId
        );

        await this.logEvent(input.taskId, 'accepted', {
            acceptedAt: input.acceptedAt,
            launchPid: input.launchPid,
            launchProfile: input.launchProfile ?? null
        });

        await this.logEvent(input.taskId, 'running', {
            startedAt: input.startedAt,
            dispatchPromptFile: input.dispatchPromptFile
        });
    }

    async applyReviewSync(input: ReviewSyncInput): Promise<void> {
        const now = new Date().toISOString();
        await this.database.run(
            `
            UPDATE antigravity_task_state
            SET
                state = ?,
                reviewed_at = COALESCE(?, reviewed_at),
                result_observed_at = COALESCE(?, result_observed_at),
                completed_at = COALESCE(?, completed_at),
                attention_reason = ?,
                last_review_message = ?,
                validation_results_json = ?,
                updated_at = ?
            WHERE task_id = ?
        `,
            input.state,
            input.reviewedAt ?? null,
            input.resultObservedAt ?? null,
            input.completedAt ?? null,
            input.attentionReason ?? null,
            input.lastReviewMessage ?? null,
            input.validationResults ? JSON.stringify(input.validationResults) : null,
            now,
            input.taskId
        );

        await this.logEvent(input.taskId, input.state, {
            reviewedAt: input.reviewedAt ?? null,
            resultObservedAt: input.resultObservedAt ?? null,
            completedAt: input.completedAt ?? null,
            attentionReason: input.attentionReason ?? null,
            lastReviewMessage: input.lastReviewMessage ?? null
        });
    }

    async applyRequeue(input: RequeueInput): Promise<void> {
        const now = new Date().toISOString();
        await this.database.run(
            `
            UPDATE antigravity_task_state
            SET
                state = 'queued',
                reviewed_at = NULL,
                completed_at = NULL,
                result_observed_at = NULL,
                attention_reason = NULL,
                last_review_message = ?,
                validation_results_json = NULL,
                launch_pid = NULL,
                launch_profile = NULL,
                accepted_at = NULL,
                started_at = NULL,
                dispatch_prompt_file = NULL,
                mirror_json_status = ?,
                updated_at = ?
            WHERE task_id = ?
        `,
            input.lastReviewMessage ?? 'Task manually requeued for a clean relaunch.',
            input.mirrorJsonStatus ?? null,
            now,
            input.taskId
        );

        await this.logEvent(input.taskId, 'queued', {
            reason: 'manual_requeue',
            mirrorJsonStatus: input.mirrorJsonStatus ?? null
        });
    }

    async getTaskState(taskId: string): Promise<AntigravityTaskStateRecord | null> {
        const row = await this.database.get<TaskRow>(
            'SELECT * FROM antigravity_task_state WHERE task_id = ?',
            taskId
        );

        return row ? this.mapRow(row) : null;
    }

    async listTaskStates(): Promise<AntigravityTaskStateRecord[]> {
        const rows = await this.database.all<TaskRow[]>(
            'SELECT * FROM antigravity_task_state ORDER BY updated_at DESC, task_id ASC'
        );
        return rows.map((row) => this.mapRow(row));
    }

    async getActiveTask(): Promise<AntigravityTaskStateRecord | null> {
        const row = await this.database.get<TaskRow>(
            `
            SELECT *
            FROM antigravity_task_state
            WHERE state IN ('accepted', 'running', 'review_pending')
            ORDER BY updated_at DESC
            LIMIT 1
        `
        );

        return row ? this.mapRow(row) : null;
    }

    private mapRow(row: TaskRow): AntigravityTaskStateRecord {
        return {
            taskId: row.task_id,
            queueJobId: row.queue_job_id,
            missionStage: row.mission_stage,
            taskFile: row.task_file,
            resultFile: row.result_file,
            contextFiles: parseJsonArray(row.context_files_json),
            validationCommands: parseJsonArray(row.validation_commands_json),
            profile: row.profile ?? undefined,
            dependsOn: parseJsonArray(row.depends_on_json),
            state: row.state,
            acceptedAt: row.accepted_at,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            reviewedAt: row.reviewed_at,
            launchPid: row.launch_pid,
            launchProfile: row.launch_profile,
            dispatchPromptFile: row.dispatch_prompt_file,
            resultObservedAt: row.result_observed_at,
            attentionReason: row.attention_reason,
            lastReviewMessage: row.last_review_message,
            validationResults: parseValidationResults(row.validation_results_json),
            mirrorJsonStatus: (row.mirror_json_status ?? null) as AntigravityTaskStateRecord['mirrorJsonStatus'],
            updatedAt: row.updated_at
        };
    }

    async logEvent(taskId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
        await this.database.run(
            `
            INSERT INTO antigravity_task_events (
                task_id,
                event_type,
                payload_json,
                created_at
            ) VALUES (?, ?, ?, ?)
        `,
            taskId,
            eventType,
            JSON.stringify(payload),
            new Date().toISOString()
        );
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
