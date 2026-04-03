param(
    [string]$QueueFile = 'automation/antigravity-queue.json',
    [string]$GoalFile = 'automation/antigravity-goal.json'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'antigravity-common.ps1')

Write-Warning 'scripts/antigravity-orchestrator.ps1 is deprecated. Use scripts/antigravity-run-next.ps1 and scripts/antigravity-review-task.ps1.'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Write-AntigravityStatus -RepoRoot $repoRoot -QueueFile $QueueFile -GoalFile $GoalFile | Out-Null
