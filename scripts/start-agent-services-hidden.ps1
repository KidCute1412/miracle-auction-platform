param()

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$LogDir = Join-Path $Root "AgentService\.logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Start-HiddenService {
  param(
    [string]$Name,
    [string]$ScriptPath,
    [string]$LogPath
  )

  $command = "call `"$ScriptPath`" 1>`"$LogPath`" 2>&1"
  $process = Start-Process -FilePath "cmd.exe" `
    -ArgumentList @("/c", $command) `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -PassThru

  Write-Host "$Name pid=$($process.Id) log=$LogPath"
}

Start-HiddenService -Name "Agent API" -ScriptPath (Join-Path $Root "scripts\run-agent-api.bat") -LogPath (Join-Path $LogDir "api.log")
Start-HiddenService -Name "Agent Worker" -ScriptPath (Join-Path $Root "scripts\run-agent-worker.bat") -LogPath (Join-Path $LogDir "worker.log")
