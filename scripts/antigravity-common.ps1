Set-StrictMode -Version Latest
$script:IsoCulture = [System.Globalization.CultureInfo]::InvariantCulture
$script:IsoStyles = [System.Globalization.DateTimeStyles]::RoundtripKind

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if (-not (Test-Path -LiteralPath $PathValue)) {
        New-Item -ItemType Directory -Path $PathValue | Out-Null
    }
}

function Resolve-ExistingPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    return (Resolve-Path -LiteralPath $PathValue).Path
}

function Resolve-RepoAwarePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return Resolve-ExistingPath -PathValue $PathValue
    }

    return Resolve-ExistingPath -PathValue (Join-Path $RepoRoot $PathValue)
}

function Get-RepoFilePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return $PathValue
    }

    return (Join-Path $RepoRoot $PathValue)
}

function Get-RelativeRepoPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    $rootWithSeparator = $RepoRoot.TrimEnd('\') + '\'
    $comparison = [System.StringComparison]::OrdinalIgnoreCase
    if ($PathValue.StartsWith($rootWithSeparator, $comparison)) {
        return $PathValue.Substring($rootWithSeparator.Length)
    }

    return $PathValue
}

function ConvertTo-NativeObject {
    param(
        $InputObject
    )

    if ($null -eq $InputObject) {
        return $null
    }

    if (
        $InputObject -is [string] -or
        $InputObject -is [char] -or
        $InputObject -is [bool] -or
        $InputObject -is [byte] -or
        $InputObject -is [int16] -or
        $InputObject -is [int32] -or
        $InputObject -is [int64] -or
        $InputObject -is [uint16] -or
        $InputObject -is [uint32] -or
        $InputObject -is [uint64] -or
        $InputObject -is [single] -or
        $InputObject -is [double] -or
        $InputObject -is [decimal] -or
        $InputObject -is [datetime]
    ) {
        return $InputObject
    }

    if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
        if ($InputObject -is [System.Collections.IDictionary]) {
            $table = @{}
            foreach ($key in $InputObject.Keys) {
                $table[$key] = ConvertTo-NativeObject -InputObject $InputObject[$key]
            }
            return $table
        }

        $items = @()
        foreach ($item in $InputObject) {
            $items += ConvertTo-NativeObject -InputObject $item
        }
        return $items
    }

    $properties = @($InputObject.PSObject.Properties)
    if ($InputObject.PSObject -and $properties.Count -gt 0) {
        $table = @{}
        foreach ($property in $properties) {
            $table[$property.Name] = ConvertTo-NativeObject -InputObject $property.Value
        }
        return $table
    }

    return $InputObject
}

function Load-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    $raw = Get-Content -LiteralPath $PathValue -Raw
    if ([string]::IsNullOrWhiteSpace($raw)) {
        throw "JSON file '$PathValue' is empty."
    }

    $parsed = $raw | ConvertFrom-Json
    if ($null -eq $parsed) {
        throw "JSON file '$PathValue' could not be parsed."
    }

    return ConvertTo-NativeObject -InputObject $parsed
}

function Load-Queue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    $queue = Load-JsonFile -PathValue $PathValue
    if ($null -eq $queue.tasks) {
        throw "Queue file '$PathValue' does not contain tasks."
    }

    return $queue
}

function Load-Goal {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    return Load-JsonFile -PathValue $PathValue
}

function Get-OptionalTaskValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task,
        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    if ($Task.ContainsKey($Key)) {
        return $Task[$Key]
    }

    return $null
}

function Save-Queue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Queue,
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    $json = $Queue | ConvertTo-Json -Depth 20
    Set-Content -LiteralPath $PathValue -Value $json -Encoding utf8
}

function Get-AntigravityReportsDir {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    return (Join-Path $RepoRoot 'reports/antigravity')
}

function Get-AntigravityHistoryPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    return (Join-Path (Get-AntigravityReportsDir -RepoRoot $RepoRoot) 'orchestrator.log')
}

function Write-AntigravityHistory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $historyPath = Get-AntigravityHistoryPath -RepoRoot $RepoRoot
    Ensure-Directory -PathValue ([System.IO.Path]::GetDirectoryName($historyPath))
    $timestamp = (Get-Date).ToString('s')
    $line = "[$timestamp] $Message"
    Add-Content -LiteralPath $historyPath -Value $line -Encoding utf8
    Write-Host $line
}

function Get-LogTail {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LogPath,
        [int]$Tail = 20
    )

    if (-not (Test-Path -LiteralPath $LogPath)) {
        return @()
    }

    return @(Get-Content -LiteralPath $LogPath -Tail $Tail)
}

function Get-TaskById {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Queue,
        [Parameter(Mandatory = $true)]
        [string]$TaskId
    )

    return @($Queue.tasks | Where-Object { $_.id -eq $TaskId })[0]
}

function Get-TaskValidationCommands {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task
    )

    $validationCommands = Get-OptionalTaskValue -Task $Task -Key 'validationCommands'
    if ($null -eq $validationCommands) {
        return @()
    }

    if ($validationCommands -is [string]) {
        return @([string]$validationCommands)
    }

    return @($validationCommands)
}

function Get-TaskDependencies {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task
    )

    $dependsOn = Get-OptionalTaskValue -Task $Task -Key 'dependsOn'
    if ($null -eq $dependsOn) {
        return @()
    }

    if ($dependsOn -is [string]) {
        return @([string]$dependsOn)
    }

    return @($dependsOn)
}

function Test-DependenciesCompleted {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Queue,
        [Parameter(Mandatory = $true)]
        [hashtable]$Task
    )

    foreach ($dependencyId in (Get-TaskDependencies -Task $Task)) {
        $dependency = Get-TaskById -Queue $Queue -TaskId $dependencyId
        if (-not $dependency -or $dependency.status -ne 'completed') {
            return $false
        }
    }

    return $true
}

function Unlock-BlockedTasks {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Queue,
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    foreach ($task in $Queue.tasks) {
        if ($task.status -ne 'blocked') {
            continue
        }

        if (Test-DependenciesCompleted -Queue $Queue -Task $task) {
            $task.status = 'pending'
            $task.attentionReason = $null
            $task.lastReviewMessage = 'Task unlocked because dependencies completed.'
            Write-AntigravityHistory -RepoRoot $RepoRoot -Message "Task '$($task.id)' unlocked because dependencies completed."
        }
    }
}

function Test-IsSafeContextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ResolvedPath,
        [Parameter(Mandatory = $true)]
        [string]$WorkspacePath
    )

    $comparison = [System.StringComparison]::OrdinalIgnoreCase
    if (-not $ResolvedPath.StartsWith($WorkspacePath, $comparison)) {
        throw "Context file '$ResolvedPath' must stay inside the workspace root '$WorkspacePath'."
    }

    $normalizedPath = $ResolvedPath -replace '\\', '/'
    $blockedPatterns = @(
        '(^|/)\.env(\.|$)',
        '(^|/)(id_rsa|id_dsa|authorized_keys)$',
        '(^|/).*\.(pem|key|pfx|p12|cer|crt|der)$',
        '(^|/)(secret|secrets|credential|credentials|token|tokens)(/|\.|$)'
    )

    foreach ($pattern in $blockedPatterns) {
        if ($normalizedPath -match $pattern) {
            throw "Context file '$ResolvedPath' looks like a secret or key material and was rejected."
        }
    }

    return $true
}

function Get-ResolvedContextFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [Parameter(Mandatory = $true)]
        [hashtable]$Task
    )

    $files = @()
    foreach ($file in @($Task.contextFiles)) {
        $resolvedFile = Resolve-RepoAwarePath -RepoRoot $RepoRoot -PathValue $file
        Test-IsSafeContextFile -ResolvedPath $resolvedFile -WorkspacePath $RepoRoot | Out-Null
        $files += $resolvedFile
    }

    return $files
}

function New-DispatchPrompt {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task,
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    $taskFilePath = Resolve-RepoAwarePath -RepoRoot $RepoRoot -PathValue $Task.taskFile
    $basePrompt = Get-Content -LiteralPath $taskFilePath -Raw
    $resultPath = Get-RepoFilePath -RepoRoot $RepoRoot -PathValue $Task.resultFile
    Ensure-Directory -PathValue ([System.IO.Path]::GetDirectoryName($resultPath))

    $reportsDir = Get-AntigravityReportsDir -RepoRoot $RepoRoot
    $dispatchDir = Join-Path $reportsDir 'dispatch-prompts'
    Ensure-Directory -PathValue $dispatchDir

    $resultFile = [string]$Task.resultFile
    $extra = @"

## Mandatory Result File

Write your final structured response to $resultFile as markdown in the workspace before you consider the task complete.
Do not leave the result only in chat.
"@

    $dispatchPrompt = $basePrompt.TrimEnd() + "`r`n`r`n" + $extra.Trim() + "`r`n"
    $dispatchPath = Join-Path $dispatchDir "$($Task.id).dispatch.md"
    Set-Content -LiteralPath $dispatchPath -Value $dispatchPrompt -Encoding utf8
    return $dispatchPath
}

function Test-ResultContract {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if (-not (Test-Path -LiteralPath $PathValue)) {
        return @{
            Valid = $false
            Missing = @('result file')
        }
    }

    $content = Get-Content -LiteralPath $PathValue -Raw
    $requiredSections = @(
        'Summary',
        'Files Changed',
        'Validation Run',
        'Key Diffs',
        'Residual Risks',
        'Preserved By Contract'
    )

    $missing = @()
    foreach ($section in $requiredSections) {
        if ($content -notmatch "(?im)^#{1,6}\s+$([regex]::Escape($section))\s*$") {
            $missing += $section
        }
    }

    return @{
        Valid = ($missing.Count -eq 0)
        Missing = $missing
    }
}

function Invoke-ValidationCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    $global:LASTEXITCODE = 0
    $output = @()
    $hadError = $false

    try {
        $output = Invoke-Expression $Command 2>&1
    }
    catch {
        $hadError = $true
        $output = @($_)
    }

    $exitCode = if ($hadError) { 1 } elseif ($null -ne $global:LASTEXITCODE) { [int]$global:LASTEXITCODE } else { 0 }

    return @{
        command = $Command
        exitCode = $exitCode
        output = ($output | Out-String).Trim()
        success = ($exitCode -eq 0)
    }
}

function Get-TaskAgeMinutes {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task
    )

    $startedAtValue = Get-OptionalTaskValue -Task $Task -Key 'startedAt'
    if (-not $startedAtValue) {
        return $null
    }

    $startedAt = [datetimeoffset]::Parse([string]$startedAtValue, $script:IsoCulture, $script:IsoStyles)
    return [math]::Round(((Get-Date) - $startedAt.LocalDateTime).TotalMinutes, 1)
}

function New-TaskSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Task,
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot
    )

    $resultPath = Get-RepoFilePath -RepoRoot $RepoRoot -PathValue $Task.resultFile
    $launchPid = Get-OptionalTaskValue -Task $Task -Key 'launchPid'
    $launchPidAlive = $false
    if ($launchPid) {
        $launchPidAlive = $null -ne (Get-Process -Id ([int]$launchPid) -ErrorAction SilentlyContinue)
    }

    $profile = Get-OptionalTaskValue -Task $Task -Key 'profile'
    $launchProfile = Get-OptionalTaskValue -Task $Task -Key 'launchProfile'
    $startedAt = Get-OptionalTaskValue -Task $Task -Key 'startedAt'
    $dispatchPromptFile = Get-OptionalTaskValue -Task $Task -Key 'dispatchPromptFile'
    $resultObservedAt = Get-OptionalTaskValue -Task $Task -Key 'resultObservedAt'
    $reviewedAt = Get-OptionalTaskValue -Task $Task -Key 'reviewedAt'
    $completedAt = Get-OptionalTaskValue -Task $Task -Key 'completedAt'
    $attentionReason = Get-OptionalTaskValue -Task $Task -Key 'attentionReason'
    $lastReviewMessage = Get-OptionalTaskValue -Task $Task -Key 'lastReviewMessage'

    return [pscustomobject]@{
        id = [string]$Task.id
        missionStage = [string]$Task.missionStage
        status = [string]$Task.status
        profile = if ($profile) { [string]$profile } else { $null }
        launchProfile = if ($launchProfile) { [string]$launchProfile } else { $null }
        resultFile = [string]$Task.resultFile
        resultFileExists = (Test-Path -LiteralPath $resultPath)
        expectedResultPath = $resultPath
        startedAt = if ($startedAt) { [string]$startedAt } else { $null }
        ageMinutes = Get-TaskAgeMinutes -Task $Task
        launchPid = if ($launchPid) { [int]$launchPid } else { $null }
        launchPidAlive = $launchPidAlive
        dispatchPromptFile = if ($dispatchPromptFile) { [string]$dispatchPromptFile } else { $null }
        resultObservedAt = if ($resultObservedAt) { [string]$resultObservedAt } else { $null }
        reviewedAt = if ($reviewedAt) { [string]$reviewedAt } else { $null }
        completedAt = if ($completedAt) { [string]$completedAt } else { $null }
        attentionReason = if ($attentionReason) { [string]$attentionReason } else { $null }
        lastReviewMessage = if ($lastReviewMessage) { [string]$lastReviewMessage } else { '' }
    }
}

function Get-TaskOwner {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$TaskSnapshot
    )

    switch ([string]$TaskSnapshot.status) {
        'completed' { return 'closed' }
        'blocked' { return 'dependency' }
        'pending' { return 'openclaw' }
        'running' { return 'antigravity' }
        'needs_attention' { return 'codex' }
        default { return 'unknown' }
    }
}

function Get-TaskNextAction {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$TaskSnapshot
    )

    switch ([string]$TaskSnapshot.status) {
        'completed' { return 'wait_for_downstream_or_close' }
        'blocked' { return 'wait_for_dependency' }
        'pending' { return 'run_next_when_ready' }
        'running' {
            if ($TaskSnapshot.resultFileExists) {
                return 'review_result_file'
            }

            if ($TaskSnapshot.launchPidAlive) {
                return 'wait_for_result_file'
            }

            if ($TaskSnapshot.launchPid) {
                return 'inspect_worker_or_wait_for_result'
            }

            return 'inspect_launch_state'
        }
        'needs_attention' { return 'manual_recovery_required' }
        default { return 'inspect_task_state' }
    }
}

function Get-ProfileRoutingRationale {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Profile
    )

    switch ($Profile) {
        'implementation-strong' { return 'Uso preferencial para tarefas que geram ou estruturam artefatos.' }
        'review-fast' { return 'Uso preferencial para auditoria, gate e validacao.' }
        default { return 'Perfil padrao do Antigravity quando a tarefa nao declara roteamento explicito.' }
    }
}

function Get-SystemState {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject[]]$TaskSnapshots
    )

    $runningCount = @($TaskSnapshots | Where-Object { $_.status -eq 'running' }).Count
    $attentionCount = @($TaskSnapshots | Where-Object { $_.status -eq 'needs_attention' }).Count

    if ($attentionCount -gt 0 -or $runningCount -gt 1) {
        return 'needs_attention'
    }

    if ($runningCount -eq 1) {
        return 'running'
    }

    return 'idle'
}

function Get-RecentResultFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ReportsDir
    )

    if (-not (Test-Path -LiteralPath $ReportsDir)) {
        return @()
    }

    return @(
        Get-ChildItem -LiteralPath $ReportsDir -File -Filter '*.result.md' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 10 |
        ForEach-Object {
            [pscustomobject]@{
                name = $_.Name
                lastWriteTime = $_.LastWriteTime.ToString('o')
                length = [int64]$_.Length
            }
        }
    )
}

function Write-AntigravityStatus {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepoRoot,
        [string]$QueueFile = 'automation/antigravity-queue.json',
        [string]$GoalFile = 'automation/antigravity-goal.json',
        [string]$OutputJson = 'reports/antigravity/status.json',
        [string]$OutputMarkdown = 'reports/antigravity/status.md'
    )

    $queuePath = Resolve-RepoAwarePath -RepoRoot $RepoRoot -PathValue $QueueFile
    $goalPath = Resolve-RepoAwarePath -RepoRoot $RepoRoot -PathValue $GoalFile
    $outputJsonPath = Get-RepoFilePath -RepoRoot $RepoRoot -PathValue $OutputJson
    $outputMarkdownPath = Get-RepoFilePath -RepoRoot $RepoRoot -PathValue $OutputMarkdown
    $reportsDir = Get-AntigravityReportsDir -RepoRoot $RepoRoot
    $historyPath = Get-AntigravityHistoryPath -RepoRoot $RepoRoot

    Ensure-Directory -PathValue ([System.IO.Path]::GetDirectoryName($outputJsonPath))
    Ensure-Directory -PathValue ([System.IO.Path]::GetDirectoryName($outputMarkdownPath))

    $queue = Load-Queue -PathValue $queuePath
    $goal = Load-Goal -PathValue $goalPath
    $taskSnapshots = @(
        $queue.tasks | ForEach-Object { New-TaskSnapshot -Task $_ -RepoRoot $RepoRoot }
    )

    $executiveTasks = @(
        $taskSnapshots | ForEach-Object {
            [pscustomobject]@{
                id = $_.id
                status = $_.status
                owner = Get-TaskOwner -TaskSnapshot $_
                profile = if ($_.profile) { $_.profile } else { 'default' }
                ageMinutes = $_.ageMinutes
                nextAction = Get-TaskNextAction -TaskSnapshot $_
            }
        }
    )

    $queueCounts = [ordered]@{
        blocked = @($taskSnapshots | Where-Object { $_.status -eq 'blocked' }).Count
        pending = @($taskSnapshots | Where-Object { $_.status -eq 'pending' }).Count
        running = @($taskSnapshots | Where-Object { $_.status -eq 'running' }).Count
        completed = @($taskSnapshots | Where-Object { $_.status -eq 'completed' }).Count
        needs_attention = @($taskSnapshots | Where-Object { $_.status -eq 'needs_attention' }).Count
    }

    $currentTask = $null
    $runningTaskSnapshots = @($taskSnapshots | Where-Object { $_.status -eq 'running' } | Select-Object -First 1)
    if ($runningTaskSnapshots.Count -gt 0) {
        $currentTask = $runningTaskSnapshots[0]
    }

    $snapshot = [pscustomobject]@{
        generatedAt = (Get-Date).ToString('o')
        systemState = Get-SystemState -TaskSnapshots $taskSnapshots
        goal = [pscustomobject]@{
            modelTested = [bool]$goal.modelTested
            stopRequested = [bool]$goal.stopRequested
        }
        maxActiveTasks = if ($queue.maxActiveTasks) { [int]$queue.maxActiveTasks } else { 1 }
        antigravityProcessCount = @(Get-Process Antigravity -ErrorAction SilentlyContinue).Count
        queueCounts = [pscustomobject]$queueCounts
        currentTask = $currentTask
        tasks = $taskSnapshots
        executiveTasks = $executiveTasks
        recentResultFiles = Get-RecentResultFiles -ReportsDir $reportsDir
        historyTail = Get-LogTail -LogPath $historyPath -Tail 20
        profileRouting = @(
            @($taskSnapshots | ForEach-Object { if ($_.profile) { $_.profile } else { 'default' } } | Select-Object -Unique) |
            ForEach-Object {
                [pscustomobject]@{
                    profile = $_
                    rationale = Get-ProfileRoutingRationale -Profile $_
                }
            }
        )
    }

    $snapshot | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $outputJsonPath -Encoding utf8

    $lines = @()
    $lines += '# Antigravity Status'
    $lines += ''
    $lines += "- generatedAt: $($snapshot.generatedAt)"
    $lines += "- systemState: $($snapshot.systemState)"
    $lines += "- modelTested: $($snapshot.goal.modelTested)"
    $lines += "- stopRequested: $($snapshot.goal.stopRequested)"
    $lines += "- maxActiveTasks: $($snapshot.maxActiveTasks)"
    $lines += "- antigravityProcessCount: $($snapshot.antigravityProcessCount)"
    $lines += ''
    $lines += '## Current Task'
    $lines += ''

    if ($null -eq $snapshot.currentTask) {
        $lines += '- none'
    }
    else {
        $currentProfile = if ($snapshot.currentTask.launchProfile) { $snapshot.currentTask.launchProfile } elseif ($snapshot.currentTask.profile) { $snapshot.currentTask.profile } else { 'default' }
        $lines += "- id: $($snapshot.currentTask.id)"
        $lines += "- status: $($snapshot.currentTask.status)"
        $lines += "- launchPid: $($snapshot.currentTask.launchPid)"
        $lines += "- launchPidAlive: $($snapshot.currentTask.launchPidAlive)"
        $lines += "- profile: $currentProfile"
        $lines += "- ageMinutes: $($snapshot.currentTask.ageMinutes)"
        $lines += "- expectedResultPath: $($snapshot.currentTask.expectedResultPath)"
        $lines += "- dispatchPromptFile: $($snapshot.currentTask.dispatchPromptFile)"
    }

    $lines += ''
    $lines += '## Queue Counts'
    $lines += ''
    foreach ($property in $snapshot.queueCounts.PSObject.Properties) {
        $lines += "- $($property.Name): $($property.Value)"
    }

    $lines += ''
    $lines += '## Task Board'
    $lines += ''
    foreach ($task in $snapshot.executiveTasks) {
        $lines += "- $($task.id): status=$($task.status) owner=$($task.owner) profile=$($task.profile) age=$($task.ageMinutes) next=$($task.nextAction)"
    }

    $lines += ''
    $lines += '## Needs Attention'
    $lines += ''
    $attentionTasks = @($snapshot.tasks | Where-Object { $_.status -eq 'needs_attention' })
    if ($attentionTasks.Count -eq 0) {
        $lines += '- none'
    }
    else {
        foreach ($task in $attentionTasks) {
            $lines += "- $($task.id): reason=$($task.attentionReason) note=$($task.lastReviewMessage)"
        }
    }

    $lines += ''
    $lines += '## Recent Result Files'
    $lines += ''
    if (@($snapshot.recentResultFiles).Count -eq 0) {
        $lines += '- none'
    }
    else {
        foreach ($file in $snapshot.recentResultFiles) {
            $lines += "- $($file.name): $($file.lastWriteTime)"
        }
    }

    $lines += ''
    $lines += '## Recent History'
    $lines += ''
    if (@($snapshot.historyTail).Count -eq 0) {
        $lines += '- none'
    }
    else {
        foreach ($line in $snapshot.historyTail) {
            $lines += "- $line"
        }
    }

    $lines += ''
    $lines += '## Profile Routing Map'
    $lines += ''
    foreach ($item in $snapshot.profileRouting) {
        $lines += "- $($item.profile): $($item.rationale)"
    }

    Set-Content -LiteralPath $outputMarkdownPath -Value (($lines -join "`r`n") + "`r`n") -Encoding utf8

    return [pscustomobject]@{
        snapshot = $snapshot
        outputJsonPath = $outputJsonPath
        outputMarkdownPath = $outputMarkdownPath
    }
}
