param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json',
    [string]$TaskId,
    [switch]$Force
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

    if ($TaskId) {
        $task = Get-TaskById -Queue $queue -TaskId $TaskId
        if (-not $task) {
            throw "Task '$TaskId' was not found in the Antigravity queue."
        }
    }
    else {
        $runningTasks = @($queue.tasks | Where-Object { $_.status -eq 'running' })
        if ($runningTasks.Count -eq 0) {
            Write-Host 'No running Antigravity task needs recovery.'
            Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
            exit 0
        }

        if ($runningTasks.Count -gt 1) {
            throw 'Queue is invalid for recovery: more than one task is marked as running.'
        }

        $task = $runningTasks[0]
    }

    if ($task.status -ne 'running') {
        throw "Task '$($task.id)' is not in running state."
    }

    $resultPath = Get-RepoFilePath -RepoRoot $repoRoot -PathValue $task.resultFile
    $hasResult = Test-Path -LiteralPath $resultPath
    $processAlive = $false
    if ($task.launchPid) {
        $processAlive = $null -ne (Get-Process -Id ([int]$task.launchPid) -ErrorAction SilentlyContinue)
    }

    if (-not $Force) {
        if ($processAlive) {
            throw "Task '$($task.id)' still has a live process pid=$($task.launchPid). Use -Force only if you intentionally want to override it."
        }

        if ($hasResult) {
            throw "Task '$($task.id)' already has a result file at '$resultPath'. Use antigravity-review instead of recovery."
        }
    }

    $task.status = 'needs_attention'
    $task.reviewedAt = (Get-Date).ToString('o')
    $task.attentionReason = if ($processAlive) { 'forced_recovery' } else { 'launch_pid_dead_no_result' }
    $task.lastReviewMessage = if ($processAlive) {
        'Task was manually forced into needs_attention during recovery.'
    }
    else {
        "Launch pid '$($task.launchPid)' is no longer alive and no result file was found."
    }

    try {
        & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
            sync-review `
            --task-id $task.id `
            --state needs_attention `
            --reviewed-at ([string]$task.reviewedAt) `
            --attention-reason ([string]$task.attentionReason) `
            --last-review-message ([string]$task.lastReviewMessage) 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw 'BullMQ shadow recovery sync command failed.'
        }
    }
    catch {
        Write-Warning "BullMQ shadow recovery sync failed: $($_.Exception.Message)"
    }

    Save-Queue -Queue $queue -PathValue $queuePath
    Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' moved to needs_attention during recovery because launchPid=$($task.launchPid) is not alive and no result file was found."
    Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
    Write-Host "Task '$($task.id)' moved to needs_attention."
}
finally {
    Set-Location -LiteralPath $previousLocation
}
