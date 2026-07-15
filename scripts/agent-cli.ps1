param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Task
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$ApiBaseUrl = if ($env:AGENT_SERVICE_URL) { $env:AGENT_SERVICE_URL.TrimEnd("/") } else { "http://localhost:8010" }

function Write-Line {
  param([ConsoleColor]$Color = "DarkGray")
  Write-Host ("-" * 72) -ForegroundColor $Color
}

function Write-Title {
  Clear-Host
  Write-Host ""
  Write-Host "  Online Auction Agent CLI" -ForegroundColor Cyan
  Write-Host "  API: $ApiBaseUrl" -ForegroundColor DarkGray
  Write-Line
}

function Write-Section {
  param([string]$Text)
  Write-Host ""
  Write-Host $Text -ForegroundColor Cyan
  Write-Line
}

function Write-Status {
  param(
    [string]$Status,
    [string]$Step
  )

  $color = switch ($Status) {
    "queued" { "DarkGray" }
    "context_indexing" { "Yellow" }
    "planning" { "Yellow" }
    "implementing" { "Yellow" }
    "testing" { "Yellow" }
    "reviewing" { "Yellow" }
    "waiting_approval" { "Magenta" }
    "succeeded" { "Green" }
    "failed" { "Red" }
    "cancelled" { "DarkYellow" }
    "timed_out" { "Red" }
    default { "White" }
  }

  $time = Get-Date -Format "HH:mm:ss"
  $stepText = if ($Step) { $Step } else { "-" }
  Write-Host "$time  " -NoNewline -ForegroundColor DarkGray
  Write-Host $Status.PadRight(18) -NoNewline -ForegroundColor $color
  Write-Host " step=$stepText" -ForegroundColor DarkGray
}

function Read-Required {
  param([string]$Prompt)
  while ($true) {
    $value = Read-Host $Prompt
    if ($null -eq $value) {
      throw "Input cancelled."
    }
    if ($value.Trim()) {
      return $value.Trim()
    }
    Write-Host "Value is required." -ForegroundColor Red
  }
}

function Get-ErrorBody {
  param($ErrorRecord)

  if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
    return $ErrorRecord.ErrorDetails.Message
  }

  if ($ErrorRecord.Exception.Response) {
    try {
      $reader = [System.IO.StreamReader]::new($ErrorRecord.Exception.Response.GetResponseStream())
      return $reader.ReadToEnd()
    } catch {
      return $ErrorRecord.Exception.Message
    }
  }

  return $ErrorRecord.Exception.Message
}

function Invoke-AgentApi {
  param(
    [ValidateSet("GET", "POST")]
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  $uri = "$ApiBaseUrl$Path"
  try {
    if ($null -eq $Body) {
      $response = Invoke-WebRequest -Method $Method -Uri $uri -UseBasicParsing -TimeoutSec 20
      return $response.Content | ConvertFrom-Json
    }

    $json = $Body | ConvertTo-Json -Depth 10
    $response = Invoke-WebRequest -Method $Method -Uri $uri -ContentType "application/json" -Body $json -UseBasicParsing -TimeoutSec 20
    return $response.Content | ConvertFrom-Json
  } catch {
    $message = Get-ErrorBody $_
    Write-Host ""
    Write-Host "Request failed: $Method $uri" -ForegroundColor Red
    Write-Host $message -ForegroundColor DarkRed
    throw
  }
}

function Show-RunLinks {
  param([string]$Id)
  Write-Host ""
  Write-Host "Run id:    " -NoNewline -ForegroundColor DarkGray
  Write-Host $Id -ForegroundColor White
  Write-Host "Status:    " -NoNewline -ForegroundColor DarkGray
  Write-Host "$ApiBaseUrl/api/agent-runs/$Id" -ForegroundColor Blue
  Write-Host "Artifacts: " -NoNewline -ForegroundColor DarkGray
  Write-Host "$ApiBaseUrl/api/agent-runs/$Id/artifacts" -ForegroundColor Blue
}

function Watch-Run {
  param([string]$Id)

  Write-Section "Watching run"
  Write-Host "Press Ctrl+C to stop watching." -ForegroundColor DarkGray

  while ($true) {
    Start-Sleep -Seconds 3
    $response = Invoke-AgentApi -Method "GET" -Path "/api/agent-runs/$Id"
    $run = $response.data
    Write-Status -Status $run.status -Step $run.currentStep

    if (@("waiting_approval", "succeeded", "failed", "cancelled", "timed_out") -contains $run.status) {
      if ($run.errorMessage) {
        Write-Host ""
        Write-Host "Error: $($run.errorMessage)" -ForegroundColor Red
      }
      break
    }
  }
}

function Open-AgentPanes {
  param([string]$Id)

  $root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $watchScript = Join-Path $root "scripts\watch-agent-channel.ps1"
  $useWt = $true
  try {
    wt --version > $null 2>&1
    if ($LASTEXITCODE -ne 0) { $useWt = $false }
  } catch {
    $useWt = $false
  }

  if ($useWt) {
    wt -w 0 new-tab --title "Antigravity" --startingDirectory "$root" powershell -NoProfile -ExecutionPolicy Bypass -File "$watchScript" -RunId "$Id" -Channel "Antigravity" `; split-pane -H --title "Codex" --startingDirectory "$root" powershell -NoProfile -ExecutionPolicy Bypass -File "$watchScript" -RunId "$Id" -Channel "Codex"
    return
  }

  Start-Process powershell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $watchScript, "-RunId", $Id, "-Channel", "Antigravity")
  Start-Process powershell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $watchScript, "-RunId", $Id, "-Channel", "Codex")
}

function New-AgentRun {
  param(
    [string]$TaskText,
    [bool]$OpenPanes = $true
  )

  Write-Section "Create task"
  $response = Invoke-AgentApi -Method "POST" -Path "/api/agent-runs" -Body @{ task = $TaskText }
  $id = $response.data.id

  Write-Host "Created agent run." -ForegroundColor Green
  Show-RunLinks -Id $id
  if ($OpenPanes) {
    Open-AgentPanes -Id $id
  }
  Watch-Run -Id $id
}

function Select-RecentRun {
  param([string]$PromptText = "Select run")

  try {
    $response = Invoke-AgentApi -Method "GET" -Path "/api/agent-runs?limit=10"
    $runs = $response.data
  } catch {
    Write-Host "Failed to fetch recent runs." -ForegroundColor Red
    return $null
  }

  if ($null -eq $runs -or $runs.Count -eq 0) {
    Write-Host "No recent runs found." -ForegroundColor DarkGray
    return $null
  }

  Write-Host ""
  Write-Host "  Recent Runs:" -ForegroundColor Cyan
  Write-Line

  $index = 1
  foreach ($run in $runs) {
    $taskExcerpt = if ($run.task.Length -gt 45) { $run.task.Substring(0, 42) + "..." } else { $run.task }
    $time = [DateTime]::Parse($run.createdAt).ToString("MM/dd HH:mm")
    
    $color = switch ($run.status) {
      "succeeded" { "Green" }
      "failed" { "Red" }
      "waiting_approval" { "Magenta" }
      "queued" { "DarkGray" }
      default { "Yellow" }
    }

    Write-Host "  [$index] " -NoNewline -ForegroundColor White
    Write-Host "$($run.status.PadRight(18))" -NoNewline -ForegroundColor $color
    Write-Host " | $time | $taskExcerpt" -ForegroundColor White
    
    $index++
  }
  Write-Line
  
  $choice = Read-Host "$PromptText (1-$($runs.Count), or enter custom ID, press Enter for [1])"
  if ($null -eq $choice) {
    return $null
  }
  
  $choice = $choice.Trim()
  if ($choice -eq "") {
    return $runs[0].id
  }

  if ($choice -match '^\d+$') {
    $idx = [int]$choice
    if ($idx -ge 1 -and $idx -le $runs.Count) {
      return $runs[$idx - 1].id
    }
  }

  return $choice
}

function Show-RunStatus {
  $id = Select-RecentRun -PromptText "Select run to check status"
  if (-not $id) { return }
  $response = Invoke-AgentApi -Method "GET" -Path "/api/agent-runs/$id"
  $run = $response.data

  Write-Section "Run status"
  Write-Host "Task:   $($run.task)"
  Write-Host "Status: " -NoNewline
  Write-Host $run.status -ForegroundColor Cyan
  Write-Host "Step:   $($run.currentStep)"
  if ($run.errorMessage) {
    Write-Host "Error:  $($run.errorMessage)" -ForegroundColor Red
  }
  Show-RunLinks -Id $run.id
}

function Show-Artifacts {
  $id = Select-RecentRun -PromptText "Select run to list artifacts"
  if (-not $id) { return }
  $response = Invoke-AgentApi -Method "GET" -Path "/api/agent-runs/$id/artifacts"

  Write-Section "Artifacts"
  if ($response.data.Count -eq 0) {
    Write-Host "No artifacts yet." -ForegroundColor DarkGray
    return
  }

  foreach ($artifact in $response.data) {
    Write-Host "$($artifact.artifactType)  " -NoNewline -ForegroundColor Cyan
    Write-Host $artifact.name -NoNewline
    Write-Host "  $($artifact.id)" -ForegroundColor DarkGray
  }
}

function Cancel-Run {
  $id = Select-RecentRun -PromptText "Select run to cancel"
  if (-not $id) { return }
  $response = Invoke-AgentApi -Method "POST" -Path "/api/agent-runs/$id/cancel"
  Write-Host "Cancelled run $($response.data.id)." -ForegroundColor Yellow
}

function Approve-Or-Reject-Run {
  $id = Select-RecentRun -PromptText "Select run to Approve/Reject"
  if (-not $id) { return }

  $response = Invoke-AgentApi -Method "GET" -Path "/api/agent-runs/$id"
  $run = $response.data
  
  if ($run.status -ne "waiting_approval") {
    Write-Host "Run $($id) is not in waiting_approval status (current status: $($run.status))." -ForegroundColor Red
    return
  }

  Write-Host ""
  Write-Host "[1] Approve and proceed" -ForegroundColor Green
  Write-Host "[2] Reject/Cancel run" -ForegroundColor Red
  Write-Host "[C] Cancel option" -ForegroundColor White
  Write-Host ""
  
  $choice = Read-Host "Select action"
  if (-not $choice) { return }
  
  switch ($choice.Trim()) {
    "1" {
      $reviewer = Read-Required "Reviewer name (e.g. Lokdeptrai)"
      $note = Read-Host "Approve note (optional)"
      $response = Invoke-AgentApi -Method "POST" -Path "/api/agent-runs/$id/approve" -Body @{ reviewer = $reviewer; note = $note }
      Write-Host "Run approved successfully! Status: $($response.data.status)" -ForegroundColor Green
    }
    "2" {
      $response = Invoke-AgentApi -Method "POST" -Path "/api/agent-runs/$id/cancel"
      Write-Host "Run cancelled/rejected successfully." -ForegroundColor Yellow
    }
    default {
      Write-Host "Cancelled action." -ForegroundColor DarkGray
    }
  }
}

function Test-AgentService {
  Write-Section "Health check"
  $health = Invoke-AgentApi -Method "GET" -Path "/health"
  $ready = Invoke-AgentApi -Method "GET" -Path "/ready"
  Write-Host "Health: $($health.data.status)" -ForegroundColor Green
  Write-Host "Ready:  $($ready.data.status)" -ForegroundColor Green
  Write-Host "Postgres: $($ready.data.dependencies.postgres)" -ForegroundColor Green
}

function Show-Menu {
  Write-Host ""
  Write-Host "[1] New task" -ForegroundColor White
  Write-Host "[2] Check status" -ForegroundColor White
  Write-Host "[3] List artifacts" -ForegroundColor White
  Write-Host "[4] Cancel run" -ForegroundColor White
  Write-Host "[5] Approve/Reject run" -ForegroundColor White
  Write-Host "[6] Health check" -ForegroundColor White
  Write-Host "[Q] Quit" -ForegroundColor White
  Write-Host ""
}

Write-Title

$taskText = ($Task -join " ").Trim()
if ($taskText) {
  New-AgentRun -TaskText $taskText -OpenPanes $true
  exit 0
}

while ($true) {
  Show-Menu
  $choice = Read-Host "Select"
  if ($null -eq $choice) {
    break
  }

  switch ($choice.Trim().ToLowerInvariant()) {
    "" {
      $taskText = Read-Required "Task"
      New-AgentRun -TaskText $taskText
    }
    "1" {
      $taskText = Read-Required "Task"
      New-AgentRun -TaskText $taskText
    }
    "2" { Show-RunStatus }
    "3" { Show-Artifacts }
    "4" { Cancel-Run }
    "5" { Approve-Or-Reject-Run }
    "6" { Test-AgentService }
    "q" { break }
    "quit" { break }
    default {
      Write-Host "Unknown option." -ForegroundColor Red
    }
  }
}
