# Registers a daily Windows Scheduled Task that refreshes the current NHL season
# into puckq.db by running `npm run ingest:current`. User-level (no admin needed),
# runs only when you're logged on. Re-run to update; remove with:
#   Unregister-ScheduledTask -TaskName 'RougeQ Data Refresh' -Confirm:$false
param(
  # Defaults to the project root (this script's parent dir), so it works wherever the repo lives.
  [string]$ProjectDir = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$At = "5:00AM"
)

$action = New-ScheduledTaskAction -Execute "cmd.exe" `
  -Argument "/c cd /d `"$ProjectDir`" && npm run ingest:current >> data-refresh.log 2>&1"
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "RougeQ Data Refresh" `
  -Action $action -Trigger $trigger -Settings $settings `
  -Description "Refreshes the current NHL season into RougeQ's local SQLite DB." -Force | Out-Null

Write-Output "Registered 'RougeQ Data Refresh' (daily at $At)."
