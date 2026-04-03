param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json',
    [string]$OutputJson = 'reports/antigravity/status.json',
    [string]$OutputMarkdown = 'reports/antigravity/status.md'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'antigravity-common.ps1')

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$result = Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $QueueFile -GoalFile $GoalFile -OutputJson $OutputJson -OutputMarkdown $OutputMarkdown
$shadowMessage = $null
try {
    $shadowRaw = & npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-shadow.ts') `
        project-status `
        --queue-file $QueueFile `
        --goal-file $GoalFile 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($shadowRaw)) {
        throw 'BullMQ shadow status command failed.'
    }
    $shadow = $shadowRaw | ConvertFrom-Json
    $shadowMessage = " Shadow status written to '$($shadow.outputJsonPath)' and '$($shadow.outputMarkdownPath)'."
}
catch {
    $shadowMessage = " Shadow status unavailable: $($_.Exception.Message)"
}

Write-Host "Antigravity status written to '$($result.outputJsonPath)' and '$($result.outputMarkdownPath)'.$shadowMessage"
exit 0
