param(
    [string]$TaskName = 'Antigravity-Daily-Audit',
    [string]$Time = '09:00',
    [string]$Workspace = 'reports/production-workspaces/ai-orchestration-sim',
    [string]$Label = 'ai-orchestration-sim',
    [string]$OutputDir = 'reports/antigravity/daily-audits'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runnerPath = Join-Path $repoRoot 'scripts/run-antigravity-daily-audit.ps1'
$actionArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$runnerPath`" -Workspace `"$Workspace`" -Label `"$Label`" -OutputDir `"$OutputDir`""

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $actionArgs
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Host "Registered scheduled task '$TaskName' for daily audit at $Time."
