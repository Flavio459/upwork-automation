param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json',
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

    if ($TaskId) {
        $task = Get-TaskById -Queue $queue -TaskId $TaskId
        if (-not $task) {
            throw "Task '$TaskId' was not found in the Antigravity queue."
        }
    } else {
        $runningTasks = @($queue.tasks | Where-Object { $_.status -eq 'running' })
        if ($runningTasks.Count -eq 0) {
            Write-Host 'No running Antigravity task is waiting for review.'
            Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
            exit 0
        }

        if ($runningTasks.Count -gt 1) {
            throw 'Queue is invalid for one-at-a-time mode: more than one task is marked as running.'
        }

        $task = $runningTasks[0]
    }

    if ($task.status -ne 'running') {
        throw "Task '$($task.id)' is not in running state."
    }

    $resultPath = Get-RepoFilePath -RepoRoot $repoRoot -PathValue $task.resultFile
    $launchPid = Get-OptionalTaskValue -Task $task -Key 'launchPid'
    $launchPidAlive = $false
    if ($launchPid) {
        $launchPidAlive = $null -ne (Get-Process -Id ([int]$launchPid) -ErrorAction SilentlyContinue)
    }

    if (-not (Test-Path -LiteralPath $resultPath)) {
        if ($launchPidAlive) {
            Write-Host "Result file still missing for task '$($task.id)': $resultPath"
            Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
            exit 0
        }

        $task.resultObservedAt = (Get-Date).ToString('o')
        $task.reviewedAt = $task.resultObservedAt
        $task.status = 'needs_attention'
        $task.attentionReason = 'launch_pid_dead_no_result'
        $task.lastReviewMessage = if ($launchPid) {
            "Launch pid '$launchPid' is no longer alive and no result file was found."
        } else {
            'Task has no launch pid and no result file was found.'
        }

        try {
            & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
                sync-review `
                --task-id $task.id `
                --state needs_attention `
                --reviewed-at ([string]$task.reviewedAt) `
                --result-observed-at ([string]$task.resultObservedAt) `
                --attention-reason launch_pid_dead_no_result `
                --last-review-message ([string]$task.lastReviewMessage) 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw 'BullMQ shadow review sync command failed.'
            }
        }
        catch {
            Write-Warning "BullMQ shadow review sync failed: $($_.Exception.Message)"
        }

        Save-Queue -Queue $queue -PathValue $queuePath
        Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' moved to needs_attention because the worker stopped before writing the result file."
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        Write-Host "Task '$($task.id)' now requires attention because the worker stopped before writing the result file."
        exit 0
    }

    $task.resultObservedAt = (Get-Date).ToString('o')
    $task.reviewedAt = (Get-Date).ToString('o')

    $contractCheck = Test-ResultContract -PathValue $resultPath
    if (-not $contractCheck.Valid) {
        $task.status = 'needs_attention'
        $task.attentionReason = 'missing_required_sections'
        $task.lastReviewMessage = "Missing result sections: $($contractCheck.Missing -join ', ')"
        try {
            & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
                sync-review `
                --task-id $task.id `
                --state needs_attention `
                --reviewed-at ([string]$task.reviewedAt) `
                --result-observed-at ([string]$task.resultObservedAt) `
                --attention-reason missing_required_sections `
                --last-review-message ([string]$task.lastReviewMessage) 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw 'BullMQ shadow review sync command failed.'
            }
        }
        catch {
            Write-Warning "BullMQ shadow review sync failed: $($_.Exception.Message)"
        }
        Save-Queue -Queue $queue -PathValue $queuePath
        Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' moved to needs_attention because the result file is incomplete."
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        Write-Host "Task '$($task.id)' now requires attention because the result contract is incomplete."
        exit 0
    }

    $validationResults = @()
    $hasFailure = $false
    foreach ($command in (Get-TaskValidationCommands -Task $task)) {
        $validationResult = Invoke-ValidationCommand -Command $command
        $validationResults += $validationResult
        if (-not $validationResult.success) {
            $hasFailure = $true
        }
    }

    $task.validationResults = $validationResults
    $validationArtifactPath = Join-Path $repoRoot "reports/antigravity/review-artifacts/$($task.id).validation.json"
    Ensure-Directory -PathValue ([System.IO.Path]::GetDirectoryName($validationArtifactPath))
    $validationResults | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $validationArtifactPath -Encoding utf8

    if ($hasFailure) {
        $task.status = 'needs_attention'
        $task.attentionReason = 'validation_failed'
        $task.lastReviewMessage = 'Validation failed.'
        try {
            & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
                sync-review `
                --task-id $task.id `
                --state needs_attention `
                --reviewed-at ([string]$task.reviewedAt) `
                --result-observed-at ([string]$task.resultObservedAt) `
                --attention-reason validation_failed `
                --last-review-message ([string]$task.lastReviewMessage) `
                --validation-results-path (Get-RelativeRepoPath -RepoRoot $repoRoot -PathValue $validationArtifactPath) 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw 'BullMQ shadow review sync command failed.'
            }
        }
        catch {
            Write-Warning "BullMQ shadow review sync failed: $($_.Exception.Message)"
        }
        Save-Queue -Queue $queue -PathValue $queuePath
        Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' failed validation and now requires attention."
        Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
        Write-Host "Task '$($task.id)' now requires attention because validation failed."
        exit 0
    }

    $task.status = 'completed'
    $task.completedAt = (Get-Date).ToString('o')
    $task.attentionReason = $null
    $task.lastReviewMessage = 'Result file and validations look good.'
    try {
        & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
            sync-review `
            --task-id $task.id `
            --state completed `
            --reviewed-at ([string]$task.reviewedAt) `
            --result-observed-at ([string]$task.resultObservedAt) `
            --completed-at ([string]$task.completedAt) `
            --last-review-message ([string]$task.lastReviewMessage) `
            --validation-results-path (Get-RelativeRepoPath -RepoRoot $repoRoot -PathValue $validationArtifactPath) 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw 'BullMQ shadow review sync command failed.'
        }
    }
    catch {
        Write-Warning "BullMQ shadow review sync failed: $($_.Exception.Message)"
    }

    Unlock-BlockedTasks -Queue $queue -RepoRoot $repoRoot
    Save-Queue -Queue $queue -PathValue $queuePath
    Write-AntigravityHistory -RepoRoot $repoRoot -Message "Task '$($task.id)' completed successfully."
    Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $queuePath -GoalFile $goalPath | Out-Null
    Write-Host "Task '$($task.id)' completed and downstream dependencies were refreshed."
}
finally {
    Set-Location -LiteralPath $previousLocation
}
