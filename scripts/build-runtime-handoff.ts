import fs from 'fs';
import path from 'path';

interface ResearchHandoffDoc {
    selectionMode: string;
    selectionReason?: string;
    identification: {
        lead_id: string;
        source_url: string;
        client_name: string;
        client_language: string;
        internal_language: string;
        offer_fit: string;
        proposal_status: string;
        localized_artifact_status: string;
    };
    summary: {
        problem_summary: string;
        budget_range: string;
        fit_initial: string;
        decision_initial: string;
        feasibility_status: string;
    };
    limitations?: string[];
}

interface GoalDoc {
    modelTested: boolean;
    stopRequested: boolean;
}

interface AntigravityTask {
    id: string;
    missionStage: string;
    status: string;
    attentionReason: string | null;
    lastReviewMessage: string;
}

interface AntigravityStatusDoc {
    generatedAt: string;
    systemState: string;
    goal: GoalDoc;
    historyTail: string[];
    tasks: AntigravityTask[];
}

interface SourceOfTruthItem {
    path: string;
    role: string;
}

interface RuntimeHandoffDoc {
    version: number;
    updatedAt: string;
    projectState: string;
    goal: GoalDoc;
    activeLead: {
        leadId: string;
        workspacePath: string;
        status: string;
        selectionMode: string;
        selectionReason: string;
        decisionInitial: string;
        feasibilityStatus: string;
        offerFit: string;
        proposalStatus: string;
        localizedArtifactStatus: string;
        sourceUrl: string;
        clientName: string;
        clientLanguage: string;
        internalLanguage: string;
    };
    currentCheckpoint: {
        lastCompletedStage: string;
        currentBlockedStage: string;
        nextStage: string;
    };
    blockers: Array<{
        id: string;
        title: string;
        cause: string;
        impact: string;
        nextAction: string;
    }>;
    completedMilestones: Array<{
        id: string;
        title: string;
        evidence: string[];
    }>;
    nextActions: Array<{
        id: string;
        title: string;
        doneWhen: string;
    }>;
    decisionsAlreadyMade: string[];
    sourceOfTruth: SourceOfTruthItem[];
    constraints: string[];
    handoffProtocol: {
        triggerMode: 'operational_milestone';
        updateTriggers: string[];
        lowQuotaRule: string;
        autoTokenTrigger: 'disabled_until_telemetry_exists';
    };
}

const GENERATED_START = '<!-- HANDOFF:GENERATED:START -->';
const GENERATED_END = '<!-- HANDOFF:GENERATED:END -->';
const CHANGELOG_START = '<!-- HANDOFF:CHANGELOG:START -->';
const CHANGELOG_END = '<!-- HANDOFF:CHANGELOG:END -->';

function repoPath(...segments: string[]): string {
    return path.resolve(process.cwd(), ...segments);
}

function readTextFile(relativePath: string): string {
    const absolutePath = repoPath(relativePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Required file is missing: ${relativePath}`);
    }

    return fs.readFileSync(absolutePath, 'utf8');
}

function readJsonFile<T>(relativePath: string): T {
    return JSON.parse(readTextFile(relativePath)) as T;
}

function ensureDirectory(filePath: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSection(markdown: string, heading: string): string {
    const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\r?\\n([\\s\\S]*?)(?=^## |\\Z)`, 'm');
    const match = markdown.match(pattern);
    return match?.[1]?.trim() ?? '';
}

function extractSubsection(markdown: string, heading: string): string {
    const pattern = new RegExp(`^### ${escapeRegExp(heading)}\\r?\\n([\\s\\S]*?)(?=^### |^## |\\Z)`, 'm');
    const match = markdown.match(pattern);
    return match?.[1]?.trim() ?? '';
}

function extractOrderedList(section: string): string[] {
    return section
        .split(/\r?\n/)
        .map((line) => line.match(/^\d+\.\s+(.*)$/)?.[1]?.trim() ?? null)
        .filter((value): value is string => Boolean(value));
}

function extractChecklist(section: string): Array<{ checked: boolean; text: string }> {
    return section
        .split(/\r?\n/)
        .map((line) => {
            const match = line.match(/^- \[(x| )\]\s+(.*)$/i);
            if (!match) {
                return null;
            }

            return {
                checked: match[1].toLowerCase() === 'x',
                text: match[2].trim()
            };
        })
        .filter((value): value is { checked: boolean; text: string } => value !== null);
}

function readExistingChangeLog(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const pattern = new RegExp(`${escapeRegExp(CHANGELOG_START)}\\r?\\n([\\s\\S]*?)\\r?\\n${escapeRegExp(CHANGELOG_END)}`);
    const match = content.match(pattern);
    return match?.[1]?.trim() ?? null;
}

function buildDefaultChangeLog(): string {
    return [
        '- `2026-04-03`: sistema profissional de handoff criado com dossie humano, JSON estruturado e comando `npm run handoff:refresh`.',
        '- `2026-04-03`: protocolo oficial fixado em marcos operacionais; gatilho automatico por tokens mantido desativado ate existir telemetria confiavel.'
    ].join('\n');
}

function dedupe<T>(items: T[]): T[] {
    return [...new Set(items)];
}

function normalizeWhitespace(value: string): string {
    return value.replace(/\r\n/g, '\n').trim();
}

function quoteItem(value: string): string {
    return `- ${value}`;
}

function main(): void {
    const roadmapPath = 'docs/02_Guides/Roadmap.md';
    const applicationPlanPath = 'docs/02_Guides/Application_Finalization_Plan.md';
    const antigravityStatusMdPath = 'reports/antigravity/status.md';
    const antigravityStatusJsonPath = 'reports/antigravity/status.json';
    const researchHandoffMdPath = 'reports/research-handoff.md';
    const researchHandoffJsonPath = 'reports/research-handoff.json';
    const workspaceReadmePath = 'reports/operator-workspaces/ai-advisory/README.md';
    const workspaceBootstrapResultPath = 'reports/antigravity/2026-04-02-antigravity-operator-workspace-bootstrap.result.md';
    const proposalBootstrapPackPath = 'reports/proposal-bootstrap/ai-advisory/README.md';
    const proposalBootstrapResultPath = 'reports/antigravity/2026-04-02-antigravity-proposal-bootstrap-pack.result.md';
    const localizationReviewResultPath = 'reports/antigravity/2026-04-03-antigravity-localization-review-checklist.result.md';
    const goalPath = 'automation/antigravity-goal.json';

    const roadmap = readTextFile(roadmapPath);
    const applicationPlan = readTextFile(applicationPlanPath);
    const antigravityStatus = readJsonFile<AntigravityStatusDoc>(antigravityStatusJsonPath);
    const researchHandoff = readJsonFile<ResearchHandoffDoc>(researchHandoffJsonPath);
    const goal = readJsonFile<GoalDoc>(goalPath);

    const workspaceReadme = readTextFile(workspaceReadmePath);
    const workspaceBootstrapResult = readTextFile(workspaceBootstrapResultPath);
    readTextFile(proposalBootstrapPackPath);
    readTextFile(proposalBootstrapResultPath);
    readTextFile(localizationReviewResultPath);
    readTextFile(antigravityStatusMdPath);
    readTextFile(researchHandoffMdPath);

    const phaseOneSection = extractSubsection(roadmap, 'Fase 1 - Operação Comercial Real');
    const phaseOneChecklist = extractChecklist(phaseOneSection);
    const priorityImmediate = extractOrderedList(extractSection(roadmap, 'Prioridade Imediata'));
    const executiveRead = extractSection(applicationPlan, 'Executive Read');

    const handoffAuditPending = phaseOneChecklist.some(
        (item) => item.text.includes('handoff-contract-audit') && !item.checked
    );
    const proposalBootstrapPending = phaseOneChecklist.some(
        (item) => item.text.includes('Proposal_and_Localization_Pack.md') && !item.checked
    );
    const localizationReviewPending = phaseOneChecklist.some(
        (item) => item.text.includes('Localization_Review_Checklist.md') && !item.checked
    );
    const operatorWorkspaceClosedInRoadmap = phaseOneChecklist.some(
        (item) => item.text.includes('operator-workspace-bootstrap') && item.checked
    );
    const operatorWorkspaceTask = antigravityStatus.tasks.find((task) => task.id === 'operator-workspace-bootstrap');
    const proposalBootstrapCompleted = fs.existsSync(repoPath(proposalBootstrapPackPath))
        && fs.existsSync(repoPath(proposalBootstrapResultPath));
    const localizationReviewCompleted = fs.existsSync(repoPath(localizationReviewResultPath));

    const operatorWorkspaceCompletedInRepo = operatorWorkspaceClosedInRoadmap
        && workspaceReadme.includes('Workspace operacional')
        && workspaceBootstrapResult.includes('workspace operacional agora existe');

    const currentBlockedStage = handoffAuditPending
        ? 'handoff-contract-audit'
        : proposalBootstrapPending && !proposalBootstrapCompleted
            ? 'proposal-bootstrap-pack'
            : localizationReviewPending
                ? 'localization-review-checklist'
                : proposalBootstrapCompleted
                    ? 'proposal-send'
            : 'production-workspace-bootstrap';

    const projectState = goal.modelTested
        ? 'tested_model_validated'
        : proposalBootstrapCompleted
            ? 'commercial_validation_pending'
            : proposalBootstrapPending
            ? 'commercial_validation_pending'
            : 'delivery_validation_pending';

    const sourceOfTruth: SourceOfTruthItem[] = [
        { path: roadmapPath, role: 'roadmap operacional e prioridade imediata' },
        { path: applicationPlanPath, role: 'contrato macro de finalização e critérios de sucesso' },
        { path: antigravityStatusMdPath, role: 'snapshot gerencial do loop Antigravity' },
        { path: antigravityStatusJsonPath, role: 'estado estruturado da fila e dos eventos recentes' },
        { path: researchHandoffMdPath, role: 'handoff humano do research para a operação' },
        { path: researchHandoffJsonPath, role: 'estado estruturado da oportunidade selecionada' },
        { path: workspaceReadmePath, role: 'workspace ativo por lead e evidência do stage 2' },
        { path: workspaceBootstrapResultPath, role: 'evidência de conclusão do workspace bootstrap no repo' },
        { path: proposalBootstrapPackPath, role: 'proposal bootstrap starter pack para localization' },
        { path: proposalBootstrapResultPath, role: 'evidência de conclusão do proposal bootstrap pack' },
        { path: localizationReviewResultPath, role: 'registro de revisão de localização e decisao de gate' },
        { path: goalPath, role: 'gate explícito de parada e tested model' }
    ];

    const completedMilestones: RuntimeHandoffDoc['completedMilestones'] = [
        {
            id: 'documentation-base-ready',
            title: 'Documentação operacional madura o suficiente para operar',
            evidence: [roadmapPath, applicationPlanPath]
        },
        {
            id: 'research-handoff-output',
            title: 'Research handoff concluído com artefato dedicado',
            evidence: [researchHandoffMdPath, 'reports/antigravity/2026-04-02-antigravity-research-handoff-output.result.md']
        },
        {
            id: 'operator-workspace-bootstrap',
            title: 'Workspace operacional por lead concluído no repo',
            evidence: [workspaceReadmePath, workspaceBootstrapResultPath]
        },
        {
            id: 'proposal-bootstrap-pack',
            title: 'Proposal bootstrap pack materializado a partir do workspace operacional',
            evidence: [proposalBootstrapPackPath, proposalBootstrapResultPath]
        },
        ...(localizationReviewCompleted ? [{
            id: 'localization-review-checklist',
            title: 'Revisão de localização registrada sem liberar envio',
            evidence: [localizationReviewResultPath]
        }] : []),
        {
            id: 'documentation-flow-aligned',
            title: 'Fluxo documental alinhado do research até proposal e production workspace',
            evidence: [roadmapPath, applicationPlanPath, 'docs/00_Governance/Reference_Map.md']
        }
    ];

    const blockers: RuntimeHandoffDoc['blockers'] = [];

    if (handoffAuditPending) {
        blockers.push({
            id: 'handoff-contract-audit-pending',
            title: 'Audit do contrato de handoff ainda não concluído',
            cause: 'O roadmap marca `handoff-contract-audit` como próxima dependência obrigatória antes do proposal bootstrap.',
            impact: 'Impede fechar o contrato entre workspace operacional, proposal bootstrap e continuidade do ciclo comercial.',
            nextAction: 'Executar `handoff-contract-audit` e validar explicitamente o contrato de entrada/saída do workspace atual.'
        });
    }

    if (operatorWorkspaceCompletedInRepo && operatorWorkspaceTask?.status === 'needs_attention') {
        const launcherHistory = antigravityStatus.historyTail
            .filter((entry) => entry.includes('operator-workspace-bootstrap'))
            .slice(-2);

        blockers.push({
            id: 'antigravity-launcher-instability',
            title: 'Launcher do Antigravity segue instável para o stage 2',
            cause: launcherHistory[launcherHistory.length - 1]
                ?? operatorWorkspaceTask.attentionReason
                ?? 'O launcher encerra sem produzir o result file observado pelo painel.',
            impact: 'Reduz a confiabilidade do executor e exige recuperação manual, mesmo quando o artefato final já existe no repo.',
            nextAction: 'Manter o problema em trilha separada, sem reabrir o workspace; seguir com o audit do contrato e corrigir o launcher por evidência.'
        });
    }

    const nextActions: RuntimeHandoffDoc['nextActions'] = [
        {
            id: 'localization-review-checklist',
            title: priorityImmediate[0] ?? 'revisar o `Localization_Review_Checklist.md` antes de enviar qualquer proposta',
            doneWhen: 'A revisão de localização foi concluída e o artefato pode seguir para envio sem ambiguidade de idioma ou tom.'
        },
        {
            id: 'proposal-send',
            title: priorityImmediate[1] ?? 'enviar a proposta localizada depois da aprovação do gate',
            doneWhen: 'A proposta localizada foi revisada e liberada para envio ao cliente.'
        },
        {
            id: 'core-offer-example',
            title: priorityImmediate[2] ?? 'registrar o primeiro `Core Offer` completo',
            doneWhen: 'Existe um exemplo completo de `Core Offer` documentado e reutilizável no fluxo principal.'
        }
    ];

    const decisionsAlreadyMade = dedupe([
        'Operação interna segue em `pt-BR`; artefatos externos continuam sendo localizados por cliente.',
        'O idioma do cliente é um parâmetro de saída e só precisa ser resolvido no momento do envio externo.',
        'O lead ativo permanece `ai-advisory` até mudança explícita de oportunidade.',
        'A seleção atual é `fallback-first-candidate` e deve ser tratada como provisória, não como vitória comercial.',
        'O workspace operacional por lead em `reports/operator-workspaces/<lead_id>/` é o contrato oficial entre research e proposal.',
        'O proposal bootstrap pack já existe e marca a transição formal para a revisão de localização.',
        'O problema do launcher do Antigravity não deve reabrir o roadmap documental já consolidado.',
        'O modo oficial continua sendo `1` tarefa Antigravity por vez, com revisão explícita entre etapas.',
        'Gatilho automático por tokens/cota fica desativado até existir telemetria confiável no runtime.'
    ]);

    const constraints = [
        'Nao usar memoria de chat como fonte de verdade operacional.',
        'Atualizar o handoff por marco operacional, nao por heuristica subjetiva de baixa cota.',
        'Nao habilitar `autoTokenTrigger` enquanto nao houver telemetria confiavel de cota no runtime.',
        'Nao enviar proposta sem qualificacao, viabilidade, pricing, localization review e revisao humana final.',
        'Manter os campos desconhecidos como `unknown`; nao inventar dados de cliente.',
        'Tratar `fallback-first-candidate` como selecao provisoria ate revisao humana.'
    ];

    const runtimeHandoff: RuntimeHandoffDoc = {
        version: 1,
        updatedAt: new Date().toISOString(),
        projectState,
        goal,
        activeLead: {
            leadId: researchHandoff.identification.lead_id,
            workspacePath: 'reports/operator-workspaces/ai-advisory/',
            status: researchHandoff.summary.decision_initial,
            selectionMode: researchHandoff.selectionMode,
            selectionReason: researchHandoff.selectionReason ?? 'No explicit selection reason was recorded.',
            decisionInitial: researchHandoff.summary.decision_initial,
            feasibilityStatus: researchHandoff.summary.feasibility_status,
            offerFit: researchHandoff.identification.offer_fit,
            proposalStatus: researchHandoff.identification.proposal_status,
            localizedArtifactStatus: researchHandoff.identification.localized_artifact_status,
            sourceUrl: researchHandoff.identification.source_url,
            clientName: researchHandoff.identification.client_name,
            clientLanguage: researchHandoff.identification.client_language,
            internalLanguage: researchHandoff.identification.internal_language
        },
        currentCheckpoint: {
            lastCompletedStage: proposalBootstrapCompleted
                ? 'proposal-bootstrap-pack'
                : operatorWorkspaceCompletedInRepo
                    ? 'operator-workspace-bootstrap'
                    : 'research-handoff-output',
            currentBlockedStage,
            nextStage: currentBlockedStage
        },
        blockers,
        completedMilestones,
        nextActions,
        decisionsAlreadyMade,
        sourceOfTruth,
        constraints,
        handoffProtocol: {
            triggerMode: 'operational_milestone',
            updateTriggers: [
                'stage fechado',
                'bloqueio mudou',
                'prioridade imediata mudou',
                'lead ativo mudou',
                'troca de motor',
                'sessao entrando em janela curta de contexto ou orcamento'
            ],
            lowQuotaRule: 'Quando o motor perceber perda de contexto, troca de motor ou janela curta restante, ele deve atualizar primeiro o dossie humano e o JSON estruturado antes de encerrar.',
            autoTokenTrigger: 'disabled_until_telemetry_exists'
        }
    };

    const jsonOutputPath = repoPath('reports/runtime-handoff.json');
    ensureDirectory(jsonOutputPath);
    fs.writeFileSync(jsonOutputPath, `${JSON.stringify(runtimeHandoff, null, 2)}\n`, 'utf8');

    const executiveStateLines = [
        'A documentacao operacional esta madura o suficiente para orientar execucao e revisao.',
        'O repositorio ja tem handoff de research e workspace operacional por lead funcionando.',
        `O lead ativo segue \`${runtimeHandoff.activeLead.leadId}\` em status comercial \`${runtimeHandoff.activeLead.status}\`.`,
        `A selecao atual permanece \`${runtimeHandoff.activeLead.selectionMode}\`, portanto o fit segue provisorio.`,
        `A viabilidade atual esta marcada como \`${runtimeHandoff.activeLead.feasibilityStatus}\`.`,
        'O workspace ativo existe em `reports/operator-workspaces/ai-advisory/` com README de indice e stage docs.',
        'O gargalo imediato deixou de ser documentacao e passou a ser fechamento do contrato operacional entre stages.',
        `O bloqueio atual e \`${runtimeHandoff.currentCheckpoint.currentBlockedStage}\`, como gate de envio externo e nao de desenvolvimento interno.`,
        'O proposal bootstrap pack ja existe e deve ser tratado como transicao formal para a revisao de localizacao.',
        'A revisao de localizacao foi registrada em result file proprio; o mestre continua em pt-BR ate o cliente final e o idioma de envio serem definidos.',
        'O launcher do Antigravity segue instavel, mas isso nao reabre o stage 2 ja concluido no repo.',
        `O modelo ainda nao foi marcado como testado (\`modelTested: ${String(goal.modelTested)}\`).`
    ];

    const whereWeStoppedLines = [
        `Ultimo stage fechado com evidencia utilizavel: \`${runtimeHandoff.currentCheckpoint.lastCompletedStage}\`.`,
        'O workspace operacional foi materializado no repo, apesar de o launcher do Antigravity ter falhado em registrar esse fechamento no painel em tempo real.',
        `O proximo checkpoint travado e \`${runtimeHandoff.currentCheckpoint.currentBlockedStage}\`.`,
        'Nenhum proposal bootstrap real foi gerado ainda; o fluxo comercial continua parado entre o workspace operacional e a proposta.'
    ];

    const blockerLines = blockers.map((blocker) => [
        `### ${blocker.title}`,
        `- \`id\`: \`${blocker.id}\``,
        `- \`cause\`: ${blocker.cause}`,
        `- \`impact\`: ${blocker.impact}`,
        `- \`next_action\`: ${blocker.nextAction}`
    ].join('\n')).join('\n\n');

    const milestoneLines = completedMilestones.map((milestone) => [
        `### ${milestone.title}`,
        ...milestone.evidence.map((evidencePath) => quoteItem(`\`evidence\`: \`${evidencePath}\``))
    ].join('\n')).join('\n\n');

    const nextActionLines = nextActions.map((action) => [
        `### ${action.title}`,
        `- \`id\`: \`${action.id}\``,
        `- \`done_when\`: ${action.doneWhen}`
    ].join('\n')).join('\n\n');

    const decisionsLines = decisionsAlreadyMade.map(quoteItem).join('\n');
    const sourceOfTruthLines = [
        '| artifact | role |',
        '| --- | --- |',
        ...sourceOfTruth.map((item) => `| \`${item.path}\` | ${item.role} |`)
    ].join('\n');

    const generatedSection = [
        '## Purpose',
        'Este documento e o handoff oficial entre motores. Ele responde onde o projeto parou, o que ja foi decidido, quais bloqueios continuam ativos e qual e a proxima acao util sem depender de memoria de chat.',
        '',
        '## Current Executive State',
        ...executiveStateLines.map(quoteItem),
        '',
        '## Where We Stopped',
        ...whereWeStoppedLines.map(quoteItem),
        '',
        '## Current Blockers',
        blockerLines,
        '',
        '## Completed Milestones',
        milestoneLines,
        '',
        '## Current Lead / Active Workspace',
        `- \`lead_id\`: \`${runtimeHandoff.activeLead.leadId}\``,
        `- \`workspace_path\`: \`${runtimeHandoff.activeLead.workspacePath}\``,
        `- \`commercial_status\`: \`${runtimeHandoff.activeLead.status}\``,
        `- \`selection_mode\`: \`${runtimeHandoff.activeLead.selectionMode}\``,
        `- \`decision_initial\`: \`${runtimeHandoff.activeLead.decisionInitial}\``,
        `- \`feasibility_status\`: \`${runtimeHandoff.activeLead.feasibilityStatus}\``,
        `- \`offer_fit\`: \`${runtimeHandoff.activeLead.offerFit}\``,
        `- \`proposal_status\`: \`${runtimeHandoff.activeLead.proposalStatus}\``,
        `- \`localized_artifact_status\`: \`${runtimeHandoff.activeLead.localizedArtifactStatus}\``,
        `- \`known_limitations\`: ${dedupe(researchHandoff.limitations ?? ['Nenhuma limitacao adicional registrada.']).join(' ')}`,
        '',
        '## Immediate Next Steps',
        nextActionLines,
        '',
        '## Decisions Already Made',
        decisionsLines,
        '',
        '## Source Of Truth',
        sourceOfTruthLines,
        '',
        '## Low-Quota Handoff Rule',
        '- O gatilho oficial de atualizacao e por marco operacional, nao por percentual de tokens.',
        '- Quando houver troca de motor, perda de contexto ou janela curta restante, atualize primeiro `docs/02_Guides/Development_Handoff_Log.md` e `reports/runtime-handoff.json`.',
        '- `autoTokenTrigger` permanece `disabled_until_telemetry_exists`; nao existe telemetria confiavel de cota no runtime atual.',
        '- O handoff estruturado nao substitui `reports/antigravity/status.json`; ele consolida a continuidade do projeto.'
    ].join('\n');

    const handoffMarkdownPath = repoPath('docs/02_Guides/Development_Handoff_Log.md');
    const preservedChangeLog = readExistingChangeLog(handoffMarkdownPath) ?? buildDefaultChangeLog();

    const handoffMarkdown = normalizeWhitespace([
        '# Development Handoff Log',
        '',
        '> [!IMPORTANT]',
        '> Este dossie e o ponto de continuidade entre motores. Atualize-o por marco operacional, nao por memoria de chat.',
        '',
        '> [!NOTE]',
        '> As secoes entre os marcadores de geracao sao atualizadas por `npm run handoff:refresh`. O `Change Log` e preservado como bloco editorial curto.',
        '',
        GENERATED_START,
        generatedSection,
        GENERATED_END,
        '',
        '## Change Log',
        CHANGELOG_START,
        preservedChangeLog,
        CHANGELOG_END
    ].join('\n'));

    ensureDirectory(handoffMarkdownPath);
    fs.writeFileSync(handoffMarkdownPath, `${handoffMarkdown}\n`, 'utf8');

    const summary = {
        updated: true,
        jsonOutputPath: path.relative(process.cwd(), jsonOutputPath),
        markdownOutputPath: path.relative(process.cwd(), handoffMarkdownPath),
        projectState: runtimeHandoff.projectState,
        currentBlockedStage: runtimeHandoff.currentCheckpoint.currentBlockedStage,
        activeLead: runtimeHandoff.activeLead.leadId,
        executiveRead: executiveRead.split(/\r?\n/).filter(Boolean).slice(0, 4)
    };

    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
