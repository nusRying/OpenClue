# OpenClue Absolute Intelligence - Mission Verification Tool
# Version 2.5 - Resonance Fixed

function Send-Signal {
    param(
        [Parameter(Mandatory=$true)]
        $Action,
        [Parameter(Mandatory=$true)]
        $Message
    )

    $BaseUrl = "https://agents.kutraa.com/webhook"
    $Path = "OpenCluePulse"
    if ($Action -eq "session_end") { $Path = "OpenClueActions" }
    
    $Url = "$BaseUrl/$Path"

    $Body = @{
        action = $Action
        event_type = $Action
        message = $Message
        metadata = @{
            sessionKey = "FINAL_MISSION_VERIFY"
            agentId = "main"
            project_id = "92722fc2-fd08-408a-881a-1395a9a29d5c"
        }
    } | ConvertTo-Json

    Write-Host "[Signal] Sending $Action to $Url..." -ForegroundColor Cyan
    try {
        $Response = Invoke-RestMethod -Uri $Url -Method Post -ContentType "application/json" -Body $Body
        Write-Host "[Result] Success! Response: $($Response | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        Write-Host "[Error] Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.InnerException) { Write-Host "   Detail: $($_.Exception.InnerException.Message)" }
    }
}

# --- MENU ---
Clear-Host
Write-Host "--- OpenClue Absolute Intelligence: Final Check ---" -ForegroundColor Yellow
Write-Host "1. Verify Conversation Sync & Activity Log"
Write-Host "2. Verify AI Mission Summarizer & Project Intel"
Write-Host ""
$Choice = Read-Host "Enter test choice (1 or 2)"

if ($Choice -eq "1") {
    Send-Signal -Action "message:sent" -Message "MISSION_CONTROL: Backend logic verified. Signal reaching database."
} elseif ($Choice -eq "2") {
    Send-Signal -Action "session_end" -Message "Final mission report: System is fully autonomous."
} else {
    Write-Host "Invalid choice." -ForegroundColor Red
}
