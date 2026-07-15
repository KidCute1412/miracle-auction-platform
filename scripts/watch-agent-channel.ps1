param(
  [string]$RunId = "",
  [Parameter(Mandatory = $true)]
  [string]$Channel
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$ApiBaseUrl = if ($env:AGENT_SERVICE_URL) { $env:AGENT_SERVICE_URL.TrimEnd("/") } else { "http://localhost:8010" }
$after = 0
$currentRunId = $RunId

Write-Host "$Channel channel" -ForegroundColor Cyan
Write-Host "$ApiBaseUrl/api/agent-runs" -ForegroundColor DarkGray

function Get-LatestRunId {
  try {
    $response = Invoke-WebRequest -Method GET -Uri "$ApiBaseUrl/api/agent-runs?limit=10" -UseBasicParsing -TimeoutSec 5
    $body = $response.Content | ConvertFrom-Json
    if ($null -eq $body.data -or $body.data.Count -eq 0) {
      return ""
    }

    $active = $body.data | Where-Object { @("queued", "context_indexing", "planning", "implementing", "testing", "reviewing", "waiting_approval") -contains $_.status } | Select-Object -First 1
    if ($active) {
      return $active.id
    }

    return $body.data[0].id
  } catch {
    return ""
  }
}

while ($true) {
  try {
    if (-not $currentRunId) {
      $currentRunId = Get-LatestRunId
      if ($currentRunId) {
        $after = 0
        Write-Host ""
        Write-Host "Following run $currentRunId" -ForegroundColor DarkGray
      } else {
        Write-Host "." -NoNewline -ForegroundColor DarkGray
        Start-Sleep -Milliseconds 1200
        continue
      }
    }

    if (-not $RunId) {
      $latestRunId = Get-LatestRunId
      if ($latestRunId -and $latestRunId -ne $currentRunId) {
        $currentRunId = $latestRunId
        $after = 0
        Write-Host ""
        Write-Host "Following run $currentRunId" -ForegroundColor DarkGray
      }
    }

    $response = Invoke-WebRequest -Method GET -Uri "$ApiBaseUrl/api/agent-runs/$currentRunId/events?after=$after" -UseBasicParsing -TimeoutSec 20
    $body = $response.Content | ConvertFrom-Json
    foreach ($event in $body.data) {
      $after = [int64]$event.sequence
      if ($event.channel -ne $Channel) {
        continue
      }
      $color = switch ($event.eventType) {
        "stderr" {
          if ($event.content -match "(?i)error|failed|exception|fatal|invalid") {
            "Red"
          } else {
            "DarkGray"
          }
        }
        "error" { "Red" }
        "status" { "DarkGray" }
        default { "White" }
      }
      if ($event.content) {
        Write-Host $event.content -NoNewline -ForegroundColor $color
      }
    }
  } catch {
    Write-Host "Event polling failed: $($_.Exception.Message)" -ForegroundColor Red
  }

  Start-Sleep -Milliseconds 800
}
