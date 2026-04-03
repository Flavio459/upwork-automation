param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json',
    [switch]$DryRun,
    [switch]$RequireShadow
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'antigravity-common.ps1')

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..') | Select-Object -ExpandProperty Path
$previousLocation = Get-Location
Set-Location -LiteralPath $repoRoot

try {
    $queuePath = Resolve-RepoAwarePath -RepoRoot $repoRoot -PathValue $QueueFile
    $goalPath = Resolve-RepoAwarePath -RepoRoot $repoRoot -PathValue $GoalFile
    $queue = Load-Queue -PathValue $queuePath
    $goal = Load-Goal -PathValue $goalPath

    if ($goal.modelTested -or $goal.stopRequested) {
        Write-Host 'Dispatch blocked because the Antigravity goal is already closed.'
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        exit 0
    }

    $runningTasks = @($queue.tasks | Where-Object { $_.status -eq 'running' })
    if ($runningTasks.Count -gt 1) {
        throw 'Queue is invalid for one-at-a-time mode: more than one task is already running.'
    }

    $attentionTasks = @($queue.tasks | Where-Object { $_.status -eq 'needs_attention' })
    if ($attentionTasks.Count -gt 0) {
        $attentionIds = ($attentionTasks | ForEach-Object { $_.id }) -join ', '
        Write-Host "Dispatch refused because the queue has tasks in needs_attention: $attentionIds"
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        exit 0
    }

    if ($runningTasks.Count -eq 1) {
        $runningTask = $runningTasks[0]
        Write-Host "Dispatch refused because task '$($runningTask.id)' is already running."
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        exit 0
    }

    Unlock-BlockedTasks -Queue $queue -RepoRoot $repoRoot
    $nextTask = $queue.tasks | Where-Object { $_.status -eq 'pending' } | Select-Object -First 1

    if (-not $nextTask) {
        if (-not $DryRun) {
            Save-Queue -Queue $queue -PathValue $queuePath
            Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        }

        Write-Host 'No pending Antigravity task is eligible for dispatch.'
        exit 0
    }

    $dispatchPromptFile = New-DispatchPrompt -Task $nextTask -RepoRoot $repoRoot
    $relativeDispatchPromptFile = Get-RelativeRepoPath -RepoRoot $repoRoot -PathValue $dispatchPromptFile
    $contextFiles = Get-ResolvedContextFiles -RepoRoot $repoRoot -Task $nextTask

    if ($DryRun) {
        Write-Host "DryRun: task '$($nextTask.id)' would be started in one-at-a-time mode."
        Write-Host "Prompt: $relativeDispatchPromptFile"
        exit 0
    }

    $shadowQueueJobId = $null
    $shadowEnqueued = $false
    try {
        $shadowEnqueueRaw = & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
            enqueue-next `
            --queue-file $QueueFile `
            --goal-file $GoalFile `
            --task-id $nextTask.id 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw 'BullMQ shadow enqueue command failed.'
        }
        $shadowEnqueue = $shadowEnqueueRaw | ConvertFrom-Json
        if ($shadowEnqueue.enqueued) {
            $shadowEnqueued = $true
            $shadowQueueJobId = [string]$shadowEnqueue.queueJobId
        }
    }
    catch {
        if ($RequireShadow) {
            throw
        }

        Write-Warning "BullMQ shadow enqueue failed: $($_.Exception.Message)"
    }

    $delegateArgs = @{
        TaskFile = $dispatchPromptFile
        TaskId = $nextTask.id
        Mode = 'agent'
        AddFile = $contextFiles
        ReuseWindow = $true
        Detached = $true
        PassThru = $true
    }

    $taskProfile = Get-OptionalTaskValue -Task $nextTask -Key 'profile'
    if ($taskProfile) {
        $delegateArgs.Profile = [string]$taskProfile
    }

    $launch = & (Join-Path $repoRoot 'scripts/delegate-antigravity.ps1') @delegateArgs
    if ($null -eq $launch -or -not $launch.accepted -or -not $launch.launchPid) {
        throw "Detached launch failed for task '$($nextTask.id)'."
    }

    $nextTask.status = 'running'
    $nextTask.startedAt = if ($launch.acceptedAt) { [string]$launch.acceptedAt } else { (Get-Date).ToString('o') }
    $nextTask.launchPid = [int]$launch.launchPid
    $nextTask.launchProfile = if ($taskProfile) { [string]$taskProfile } else { $null }
    $nextTask.dispatchPromptFile = $relativeDispatchPromptFile
    $nextTask.resultObservedAt = $null
    $nextTask.reviewedAt = $null
    $nextTask.attentionReason = $null
    $nextTask.lastReviewMessage = "Task launched in explicit one-at-a-time mode with pid=$($launch.launchPid)."

    if ($shadowEnqueued) {
        try {
            & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
                sync-launch `
                --queue-file $QueueFile `
                --task-id $nextTask.id `
                --accepted-at ([string]$launch.acceptedAt) `
                --started-at ([string]$nextTask.startedAt) `
                --launch-pid ([string]$launch.launchPid) `
                --dispatch-prompt-file $relativeDispatchPromptFile `
                --launch-profile ([string]$nextTask.launchProfile) 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw 'BullMQ shadow launch sync command failed.'
            }
        }
        catch {
            Write-Warning "BullMQ shadow launch sync failed: $($_.Exception.Message)"
        }
    }

    Save-Queue -Queue $queue -PathValue $queuePath
    Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($nextTask.id)' launched in explicit one-at-a-time mode with pid=$($launch.launchPid)."
    Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
    Write-Host "Task '$($nextTask.id)' is now running with launchPid=$($launch.launchPid)."
}
finally {
    Set-Location -LiteralPath $previousLocation
}
