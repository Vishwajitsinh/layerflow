# Start both backend and frontend for LayerFlow
# Run: .\scripts\start-all.ps1

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --reload --port 8000" -PassThru
Write-Host "Backend starting on http://127.0.0.1:8000 (PID: $($backend.Id))"
Start-Sleep -Seconds 3

$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..; npm run dev" -PassThru
Write-Host "Frontend starting (PID: $($frontend.Id))"
Write-Host ""
Write-Host "Open http://localhost:3000 (or 3001/3002 if 3000 is in use)"
Write-Host "Demo: http://localhost:3000/demo"
Write-Host ""
Write-Host "Press Enter to stop..."
Read-Host
