param(
    [string]$TaskName = 'Antigravity-Orchestrator'
)

$ErrorActionPreference = 'Stop'

Write-Warning "Scheduled task registration is deprecated for '$TaskName'. Use explicit one-at-a-time control with antigravity-run-next and antigravity-review-task."
exit 1
