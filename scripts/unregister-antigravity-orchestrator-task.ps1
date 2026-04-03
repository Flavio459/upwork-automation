param(
    [string]$TaskName = 'Antigravity-Orchestrator'
)

$ErrorActionPreference = 'Stop'

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Legacy scheduled task '$TaskName' removed."
} else {
    Write-Host "Legacy scheduled task '$TaskName' was not found."
}
