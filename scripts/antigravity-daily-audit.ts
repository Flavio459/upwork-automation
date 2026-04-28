import fs from 'fs';
import path from 'path';

type Options = {
    workspace: string;
    label: string;
    outputDir: string;
};

type Frontmatter = Record<string, string>;

type FileSnapshot = {
    path: string;
    noteName: string;
    mtime: string;
    size: number;
    frontmatter: Frontmatter;
    missingFrontmatterKeys: string[];
    frontmatterDriftSeconds: number | null;
    unresolvedWikiLinks: string[];
};

type AuditSnapshot = {
    generatedAt: string;
    workspace: string;
    label: string;
    summary: {
        status: 'healthy' | 'attention' | 'critical';
        fileCount: number;
        findings: number;
        criticalFindings: number;
        attentionFindings: number;
    };
    antigravityStatus: {
        systemState?: string;
        currentTaskId?: string | null;
        queueCounts?: Record<string, number>;
    } | null;
    evolution: {
        addedFiles: string[];
        removedFiles: string[];
        statusChanges: Array<{ path: string; from: string; to: string }>;
        versionChanges: Array<{ path: string; from: string; to: string }>;
    };
    findings: Array<{
        severity: 'critical' | 'attention' | 'note';
        file?: string;
        code: string;
        message: string;
    }>;
    files: FileSnapshot[];
};

function parseArgs(argv: string[]): Options {
    const options: Record<string, string> = {};
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const next = argv[index + 1];
        if (next && !next.startsWith('--')) {
            options[key] = next;
            index += 1;
        }
    }

    const workspace = options.workspace ?? 'reports/production-workspaces/ai-orchestration-sim';
    const label = options.label ?? path.basename(workspace);
    const outputDir = options['output-dir'] ?? 'reports/antigravity/daily-audits';

    return { workspace, label, outputDir };
}

function ensureDir(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
}

function walkMarkdownFiles(root: string): string[] {
    const results: string[] = [];
    const stack = [root];

    while (stack.length > 0) {
        const current = stack.pop()!;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === '.git' || entry.name === 'node_modules') {
                    continue;
                }
                stack.push(fullPath);
                continue;
            }

            if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                results.push(fullPath);
            }
        }
    }

    return results.sort((left, right) => left.localeCompare(right));
}

function parseFrontmatter(content: string): Frontmatter {
    if (!content.startsWith('---')) {
        return {};
    }

    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
        return {};
    }

    const frontmatter: Frontmatter = {};
    for (const rawLine of match[1].split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || !line.includes(':')) {
            continue;
        }

        const separator = line.indexOf(':');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
        frontmatter[key] = value;
    }

    return frontmatter;
}

function parseWikiLinks(content: string): string[] {
    const links: string[] = [];
    const pattern = /\[\[([^\]]+)\]\]/g;
    for (const match of content.matchAll(pattern)) {
        const rawTarget = match[1].split('|')[0].split('#')[0].trim();
        if (rawTarget.length > 0) {
            links.push(rawTarget);
        }
    }

    return links;
}

function resolveWikiLink(
    currentFile: string,
    target: string,
    workspaceRoot: string,
    knownByNote: Map<string, string>,
    knownByRelative: Set<string>
): boolean {
    const normalizedTarget = target.replace(/\\/g, '/');
    if (!normalizedTarget.includes('/')) {
        return knownByNote.has(normalizedTarget);
    }

    const currentDir = path.dirname(currentFile);
    const withExtension = normalizedTarget.endsWith('.md') ? normalizedTarget : `${normalizedTarget}.md`;
    const candidate = path.normalize(path.join(currentDir, withExtension));
    const relative = path.relative(workspaceRoot, candidate).replace(/\\/g, '/');
    return knownByRelative.has(relative);
}

function parseIsoDate(value: string | undefined): Date | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function loadAntigravityStatus(repoRoot: string): AuditSnapshot['antigravityStatus'] {
    const statusPath = path.join(repoRoot, 'reports', 'antigravity', 'status.json');
    if (!fs.existsSync(statusPath)) {
        return null;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(statusPath, 'utf8')) as {
            systemState?: string;
            currentTask?: { id?: string | null };
            queueCounts?: Record<string, number>;
        };
        return {
            systemState: parsed.systemState,
            currentTaskId: parsed.currentTask?.id ?? null,
            queueCounts: parsed.queueCounts
        };
    } catch {
        return null;
    }
}

function compareSnapshots(
    currentFiles: FileSnapshot[],
    previous: AuditSnapshot | null
): AuditSnapshot['evolution'] {
    if (!previous) {
        return {
            addedFiles: currentFiles.map((file) => file.path),
            removedFiles: [],
            statusChanges: [],
            versionChanges: []
        };
    }

    const previousMap = new Map(previous.files.map((file) => [file.path, file]));
    const currentMap = new Map(currentFiles.map((file) => [file.path, file]));

    const addedFiles = currentFiles
        .filter((file) => !previousMap.has(file.path))
        .map((file) => file.path);
    const removedFiles = previous.files
        .filter((file) => !currentMap.has(file.path))
        .map((file) => file.path);
    const statusChanges: Array<{ path: string; from: string; to: string }> = [];
    const versionChanges: Array<{ path: string; from: string; to: string }> = [];

    for (const file of currentFiles) {
        const previousFile = previousMap.get(file.path);
        if (!previousFile) {
            continue;
        }

        const previousStatus = previousFile.frontmatter.status ?? '';
        const currentStatus = file.frontmatter.status ?? '';
        if (previousStatus !== currentStatus) {
            statusChanges.push({ path: file.path, from: previousStatus, to: currentStatus });
        }

        const previousVersion = previousFile.frontmatter.version ?? '';
        const currentVersion = file.frontmatter.version ?? '';
        if (previousVersion !== currentVersion) {
            versionChanges.push({ path: file.path, from: previousVersion, to: currentVersion });
        }
    }

    return { addedFiles, removedFiles, statusChanges, versionChanges };
}

function buildSnapshot(repoRoot: string, options: Options): AuditSnapshot {
    const workspaceRoot = path.resolve(repoRoot, options.workspace);
    if (!fs.existsSync(workspaceRoot)) {
        throw new Error(`Workspace not found: ${workspaceRoot}`);
    }

    const files = walkMarkdownFiles(workspaceRoot);
    const knownByNote = new Map<string, string>();
    const knownByRelative = new Set<string>();

    for (const filePath of files) {
        const noteName = path.basename(filePath, '.md');
        const relativePath = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
        knownByNote.set(noteName, relativePath);
        knownByRelative.add(relativePath);
    }

    const currentFiles: FileSnapshot[] = [];
    const findings: AuditSnapshot['findings'] = [];

    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf8');
        const stat = fs.statSync(filePath);
        const frontmatter = parseFrontmatter(content);
        const noteName = path.basename(filePath, '.md');
        const relativePath = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
        const missingFrontmatterKeys = ['status', 'version', 'last_update'].filter((key) => !frontmatter[key]);
        const parsedLastUpdate = parseIsoDate(frontmatter.last_update);
        const frontmatterDriftSeconds = parsedLastUpdate
            ? Math.round(Math.abs(stat.mtime.getTime() - parsedLastUpdate.getTime()) / 1000)
            : null;

        const unresolvedWikiLinks = parseWikiLinks(content).filter(
            (target) => !resolveWikiLink(filePath, target, workspaceRoot, knownByNote, knownByRelative)
        );

        if (missingFrontmatterKeys.length > 0) {
            findings.push({
                severity: 'attention',
                file: relativePath,
                code: 'missing_frontmatter_keys',
                message: `Missing frontmatter keys: ${missingFrontmatterKeys.join(', ')}.`
            });
        }

        if (frontmatterDriftSeconds !== null && frontmatterDriftSeconds > 120) {
            findings.push({
                severity: 'attention',
                file: relativePath,
                code: 'frontmatter_drift',
                message: `frontmatter last_update drifts ${frontmatterDriftSeconds}s from file mtime.`
            });
        }

        if (unresolvedWikiLinks.length > 0) {
            findings.push({
                severity: 'critical',
                file: relativePath,
                code: 'broken_wikilinks',
                message: `Broken wiki links: ${unresolvedWikiLinks.join(', ')}.`
            });
        }

        currentFiles.push({
            path: relativePath,
            noteName,
            mtime: stat.mtime.toISOString(),
            size: stat.size,
            frontmatter,
            missingFrontmatterKeys,
            frontmatterDriftSeconds,
            unresolvedWikiLinks
        });
    }

    const workspaceReadmeExists = currentFiles.some((file) => file.noteName === 'README');
    if (!workspaceReadmeExists) {
        findings.push({
            severity: 'attention',
            code: 'missing_workspace_readme',
            message: 'Workspace does not contain a README.md index for Obsidian navigation.'
        });
    }

    const auditRoot = path.resolve(repoRoot, options.outputDir, options.label);
    const latestJsonPath = path.join(auditRoot, 'latest.json');
    const previous = fs.existsSync(latestJsonPath)
        ? (JSON.parse(fs.readFileSync(latestJsonPath, 'utf8')) as AuditSnapshot)
        : null;

    const evolution = compareSnapshots(currentFiles, previous);
    for (const added of evolution.addedFiles) {
        findings.push({
            severity: 'note',
            file: added,
            code: 'file_added',
            message: 'File added since the previous daily audit.'
        });
    }

    for (const removed of evolution.removedFiles) {
        findings.push({
            severity: 'note',
            file: removed,
            code: 'file_removed',
            message: 'File removed since the previous daily audit.'
        });
    }

    const criticalFindings = findings.filter((finding) => finding.severity === 'critical').length;
    const attentionFindings = findings.filter((finding) => finding.severity === 'attention').length;
    const status: AuditSnapshot['summary']['status'] =
        criticalFindings > 0 ? 'critical' : attentionFindings > 0 ? 'attention' : 'healthy';

    return {
        generatedAt: new Date().toISOString(),
        workspace: path.relative(repoRoot, workspaceRoot).replace(/\\/g, '/'),
        label: options.label,
        summary: {
            status,
            fileCount: currentFiles.length,
            findings: findings.length,
            criticalFindings,
            attentionFindings
        },
        antigravityStatus: loadAntigravityStatus(repoRoot),
        evolution,
        findings,
        files: currentFiles
    };
}

function renderMarkdown(snapshot: AuditSnapshot): string {
    const lines: string[] = [];
    lines.push('---');
    lines.push(`status: ${snapshot.summary.status}`);
    lines.push('version: 1.0.0');
    lines.push(`last_update: ${snapshot.generatedAt}`);
    lines.push(`lead_id: ${snapshot.label}`);
    lines.push('verified_by: codex');
    lines.push('document_type: daily_administrative_audit');
    lines.push('---');
    lines.push('');
    lines.push(`# Daily Administrative Audit - ${snapshot.label}`);
    lines.push('');
    lines.push(`- generatedAt: ${snapshot.generatedAt}`);
    lines.push(`- workspace: \`${snapshot.workspace}\``);
    lines.push(`- auditStatus: \`${snapshot.summary.status}\``);
    if (snapshot.antigravityStatus) {
        lines.push(`- antigravitySystemState: \`${snapshot.antigravityStatus.systemState ?? 'unknown'}\``);
        lines.push(`- antigravityCurrentTask: \`${snapshot.antigravityStatus.currentTaskId ?? 'none'}\``);
    }
    lines.push('');
    lines.push('## Executive Summary');
    lines.push('');
    lines.push(
        `This daily audit reviewed ${snapshot.summary.fileCount} markdown artifacts and recorded ${snapshot.summary.findings} findings.`
    );
    lines.push('');
    lines.push('## Evolution Since Previous Audit');
    lines.push('');
    lines.push(`- addedFiles: ${snapshot.evolution.addedFiles.length}`);
    lines.push(`- removedFiles: ${snapshot.evolution.removedFiles.length}`);
    lines.push(`- statusChanges: ${snapshot.evolution.statusChanges.length}`);
    lines.push(`- versionChanges: ${snapshot.evolution.versionChanges.length}`);
    lines.push('');
    if (snapshot.evolution.addedFiles.length > 0) {
        lines.push('### Added Files');
        lines.push('');
        for (const file of snapshot.evolution.addedFiles) {
            lines.push(`- ${file}`);
        }
        lines.push('');
    }
    if (snapshot.evolution.statusChanges.length > 0) {
        lines.push('### Status Changes');
        lines.push('');
        for (const change of snapshot.evolution.statusChanges) {
            lines.push(`- ${change.path}: \`${change.from}\` -> \`${change.to}\``);
        }
        lines.push('');
    }
    if (snapshot.evolution.versionChanges.length > 0) {
        lines.push('### Version Changes');
        lines.push('');
        for (const change of snapshot.evolution.versionChanges) {
            lines.push(`- ${change.path}: \`${change.from}\` -> \`${change.to}\``);
        }
        lines.push('');
    }
    lines.push('## Findings');
    lines.push('');
    if (snapshot.findings.length === 0) {
        lines.push('- none');
    } else {
        for (const finding of snapshot.findings) {
            const target = finding.file ? ` [${finding.file}]` : '';
            lines.push(`- \`${finding.severity}\` \`${finding.code}\`${target}: ${finding.message}`);
        }
    }
    lines.push('');
    lines.push('## File Inventory');
    lines.push('');
    for (const file of snapshot.files) {
        const status = file.frontmatter.status ?? 'missing';
        const version = file.frontmatter.version ?? 'missing';
        lines.push(`- ${file.path}: status=\`${status}\` version=\`${version}\` mtime=\`${file.mtime}\``);
    }
    lines.push('');
    lines.push('## Recommended Follow-Up');
    lines.push('');
    if (snapshot.summary.status === 'healthy') {
        lines.push('- Keep the daily audit running and review only evolution deltas.');
    } else {
        lines.push('- Resolve critical broken links before using the workspace as a decision record.');
        lines.push('- Sync frontmatter metadata whenever documents are materially edited.');
        lines.push('- Keep commercial state, delivery state, and approval state explicitly separated.');
    }
    lines.push('');
    lines.push(`*Daily administrative audit generated on ${snapshot.generatedAt}.*`);
    lines.push('');
    return lines.join('\n');
}

function saveSnapshot(repoRoot: string, options: Options, snapshot: AuditSnapshot): { jsonPath: string; markdownPath: string } {
    const auditRoot = path.resolve(repoRoot, options.outputDir, options.label);
    ensureDir(auditRoot);

    const dateStamp = snapshot.generatedAt.slice(0, 10);
    const jsonPath = path.join(auditRoot, `${dateStamp}.json`);
    const markdownPath = path.join(auditRoot, `${dateStamp}.md`);
    const latestJsonPath = path.join(auditRoot, 'latest.json');
    const latestMarkdownPath = path.join(auditRoot, 'latest.md');

    fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2));
    fs.writeFileSync(markdownPath, renderMarkdown(snapshot));
    fs.writeFileSync(latestJsonPath, JSON.stringify(snapshot, null, 2));
    fs.writeFileSync(latestMarkdownPath, renderMarkdown(snapshot));

    return {
        jsonPath: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
        markdownPath: path.relative(repoRoot, markdownPath).replace(/\\/g, '/')
    };
}

function main(): void {
    const repoRoot = process.cwd();
    const options = parseArgs(process.argv.slice(2));
    const snapshot = buildSnapshot(repoRoot, options);
    const outputs = saveSnapshot(repoRoot, options, snapshot);
    process.stdout.write(
        `${JSON.stringify({
            status: snapshot.summary.status,
            findings: snapshot.summary.findings,
            workspace: snapshot.workspace,
            jsonPath: outputs.jsonPath,
            markdownPath: outputs.markdownPath
        })}\n`
    );
}

main();
