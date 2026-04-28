param(
    [string]$Workspace = 'reports/production-workspaces/ai-orchestration-sim',
    [string]$Label = 'ai-orchestration-sim',
    [string]$OutputDir = 'reports/antigravity/daily-audits'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $repoRoot

& npx.cmd ts-node -T (Join-Path $repoRoot 'scripts/antigravity-daily-audit.ts') `
    --workspace $Workspace `
    --label $Label `
    --output-dir $OutputDir

exit $LASTEXITCODE
