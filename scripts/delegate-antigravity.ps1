param(
    [Parameter(Mandatory = $true)]
    [string]$TaskFile,

    [string]$TaskId,

    [ValidateSet('ask', 'edit', 'agent')]
    [string]$Mode = 'agent',

    [string[]]$AddFile = @(),

    [string]$Profile,

    [switch]$ReuseWindow,

    [switch]$NewWindow,

    [switch]$Maximize,

    [switch]$SkipAuditContract,

    [switch]$Detached,

    [switch]$PassThru,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Resolve-ExistingPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    return (Resolve-Path -LiteralPath $PathValue).Path
}

function Quote-ForDisplay {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ($Value -match '\s') {
        return '"' + $Value.Replace('"', '\"') + '"'
    }

    return $Value
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

function Get-LiteralString {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    return "'" + $Value.Replace("'", "''") + "'"
}

function Get-InferredTaskId {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ResolvedTaskFile
    )

    if ($TaskId) {
        return $TaskId
    }

    $leaf = [System.IO.Path]::GetFileNameWithoutExtension($ResolvedTaskFile)
    if ($leaf.EndsWith('.dispatch')) {
        return $leaf.Substring(0, $leaf.Length - '.dispatch'.Length)
    }

    return $leaf
}

function New-DetachedLauncher {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkspacePath,
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath,
        [Parameter(Mandatory = $true)]
        [string]$ResolvedTaskFile,
        [Parameter(Mandatory = $true)]
        [string[]]$ResolvedContextFiles,
        [Parameter(Mandatory = $true)]
        [string]$ModeValue,
        [string]$ProfileValue,
        [bool]$ReuseWindowEnabled,
        [bool]$NewWindowEnabled,
        [bool]$MaximizeEnabled,
        [bool]$SkipAuditContractEnabled
    )

    $reportsDir = Join-Path $WorkspacePath 'reports/antigravity'
    $launcherDir = Join-Path $reportsDir 'launchers'
    if (-not (Test-Path -LiteralPath $launcherDir)) {
        New-Item -ItemType Directory -Path $launcherDir | Out-Null
    }

    $contextFilesLiteral = if ($ResolvedContextFiles.Count -eq 0) {
        '@()'
    } else {
        "@(`r`n" + (($ResolvedContextFiles | ForEach-Object { '    ' + (Get-LiteralString -Value $_) }) -join ",`r`n") + "`r`n)"
    }

    $scriptLiteral = Get-LiteralString -Value $ScriptPath
    $taskLiteral = Get-LiteralString -Value $ResolvedTaskFile
    $modeLiteral = Get-LiteralString -Value $ModeValue

    $lines = @()
    $lines += '$ErrorActionPreference = ''Stop'''
    $lines += '$files = ' + $contextFilesLiteral
    $invocation = '& ' + $scriptLiteral + ' -TaskFile ' + $taskLiteral + ' -Mode ' + $modeLiteral + ' -AddFile $files'

    if ($ProfileValue) {
        $invocation += ' -Profile ' + (Get-LiteralString -Value $ProfileValue)
    }

    if ($ReuseWindowEnabled) {
        $invocation += ' -ReuseWindow'
    }

    if ($NewWindowEnabled) {
        $invocation += ' -NewWindow'
    }

    if ($MaximizeEnabled) {
        $invocation += ' -Maximize'
    }

    if ($SkipAuditContractEnabled) {
        $invocation += ' -SkipAuditContract'
    }

    $lines += $invocation

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $launcherPath = Join-Path $launcherDir "delegate-$timestamp.ps1"
    Set-Content -LiteralPath $launcherPath -Value (($lines -join "`r`n") + "`r`n") -Encoding utf8
    return $launcherPath
}

$antigravity = Get-Command antigravity -ErrorAction SilentlyContinue
if (-not $antigravity) {
    throw 'Antigravity CLI nao esta disponivel no PATH.'
}

$scriptPath = $PSCommandPath
$resolvedTaskFile = Resolve-ExistingPath -PathValue $TaskFile
$prompt = Get-Content -LiteralPath $resolvedTaskFile -Raw

if ([string]::IsNullOrWhiteSpace($prompt)) {
    throw "O arquivo de tarefa '$resolvedTaskFile' esta vazio."
}

$auditContract = @'

## Mandatory Response Contract

Return your final answer in this exact structure:

### Summary
- 3 to 6 short lines.

### Files Changed
- Flat list of changed files only.

### Validation Run
- Commands executed.
- Result of each command.
- Explicitly say what was not run.

### Key Diffs
- Show only 2 to 5 short diff snippets or code excerpts that represent the central changes.
- Do not dump entire files.

### Residual Risks
- Flat list of remaining risks, limitations, or follow-ups.

### Preserved By Contract
- Flat list of anything intentionally left unchanged because of third-party contract, compatibility, or explicit scope limits.
'@

$profileGuidance = @'

## Model Routing Guidance

- Prefer the most capable coding-oriented profile for implementation tasks.
- Prefer a faster or cheaper profile for review, validation, and gate tasks when the scope allows.
- If the task already specifies a profile, use that instead of guessing.
- If no suitable profile is known, fall back to the Antigravity default profile.
'@

if (
    -not $SkipAuditContract -and
    $prompt -notmatch '(?im)^# Review Contract\s*$' -and
    $prompt -notmatch '(?im)^## Mandatory Response Contract\s*$'
) {
    $prompt = $prompt.TrimEnd() + "`r`n`r`n" + $auditContract.Trim() + "`r`n"
}

if ($prompt -notmatch '(?im)^## Model Routing Guidance\s*$') {
    $prompt = $prompt.TrimEnd() + "`r`n`r`n" + $profileGuidance.Trim() + "`r`n"
}

$workspacePath = (Resolve-Path -LiteralPath '.').Path
$resolvedContextFiles = @()
foreach ($file in $AddFile) {
    $resolvedFile = Resolve-ExistingPath -PathValue $file
    Test-IsSafeContextFile -ResolvedPath $resolvedFile -WorkspacePath $workspacePath | Out-Null
    $resolvedContextFiles += $resolvedFile
}

$arguments = @('chat', '--mode', $Mode)

if ($Maximize) {
    $arguments += '--maximize'
}

if ($ReuseWindow -and $NewWindow) {
    throw 'Use apenas um entre -ReuseWindow e -NewWindow.'
}

if ($ReuseWindow) {
    $arguments += '--reuse-window'
}

if ($NewWindow) {
    $arguments += '--new-window'
}

if ($Profile) {
    $arguments += @('--profile', $Profile)
}

foreach ($resolvedContextFile in $resolvedContextFiles) {
    $arguments += @('--add-file', $resolvedContextFile)
}

$arguments += $prompt
$arguments += $workspacePath

if ($DryRun) {
    if ($Detached) {
        Write-Host 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File <generated-detached-launcher>'
        exit 0
    }

    $display = @('antigravity') + ($arguments | ForEach-Object { Quote-ForDisplay -Value $_ })
    Write-Host ($display -join ' ')
    exit 0
}

if ($Detached) {
    $launcherPath = New-DetachedLauncher `
        -WorkspacePath $workspacePath `
        -ScriptPath $scriptPath `
        -ResolvedTaskFile $resolvedTaskFile `
        -ResolvedContextFiles $resolvedContextFiles `
        -ModeValue $Mode `
        -ProfileValue $Profile `
        -ReuseWindowEnabled $ReuseWindow.IsPresent `
        -NewWindowEnabled $NewWindow.IsPresent `
        -MaximizeEnabled $Maximize.IsPresent `
        -SkipAuditContractEnabled $SkipAuditContract.IsPresent

    $launcherPathQuoted = "`"$launcherPath`""
    $workerProcess = Start-Process `
        -FilePath 'powershell.exe' `
        -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $launcherPathQuoted) `
        -WorkingDirectory $workspacePath `
        -WindowStyle Hidden `
        -PassThru

    if ($PassThru) {
        $acceptedAt = (Get-Date).ToString('o')
        $resolvedDispatchTaskId = Get-InferredTaskId -ResolvedTaskFile $resolvedTaskFile
        [pscustomobject]@{
            accepted = $true
            taskId = $resolvedDispatchTaskId
            launchPid = [int]$workerProcess.Id
            launchProfile = if ($Profile) { $Profile } else { $null }
            dispatchPromptFile = $resolvedTaskFile
            acceptedAt = $acceptedAt
            launcherFile = $launcherPath
            taskFile = $resolvedTaskFile
        }
    } else {
        Write-Host "Detached Antigravity worker started with pid=$($workerProcess.Id)."
    }

    exit 0
}

& $antigravity.Source @arguments
