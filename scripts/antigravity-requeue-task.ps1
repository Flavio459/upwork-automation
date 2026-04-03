param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json',
    [Parameter(Mandatory = $true)]
    [string]$TaskId
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
    $task = Get-TaskById -Queue $queue -TaskId $TaskId

    if (-not $task) {
        throw "Task '$TaskId' was not found in the Antigravity queue."
    }

    if ($task.status -ne 'needs_attention') {
        throw "Task '$($task.id)' is not in needs_attention state."
    }

    $task.status = 'pending'
    $task.startedAt = $null
    $task.reviewedAt = $null
    $task.resultObservedAt = $null
    $task.launchPid = $null
    $task.launchProfile = $null
    $task.dispatchPromptFile = $null
    $task.attentionReason = $null
    $task.lastReviewMessage = 'Task manually requeued for a clean relaunch.'

    Save-Queue -Queue $queue -PathValue $queuePath

    try {
        & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
            requeue-task `
            --queue-file $QueueFile `
            --task-id $task.id 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw 'BullMQ shadow requeue command failed.'
        }
    }
    catch {
        Write-Warning "BullMQ shadow requeue failed: $($_.Exception.Message)"
    }

    Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' was manually requeued after needs_attention."
    Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
    Write-Host "Task '$($task.id)' moved back to pending."
}
finally {
    Set-Location -LiteralPath $previousLocation
}
