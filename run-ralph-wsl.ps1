# Run Ralph from PowerShell by launching WSL and running ralph there.
# Use this when Ralph is installed inside WSL (your Linux environment), not on Windows.

$projectDir = $PSScriptRoot
# Convert Windows path to WSL path: C:\Users\hweth\OneDrive\Desktop\Tele-Porto -> /mnt/c/Users/hweth/OneDrive/Desktop/Tele-Porto
$wslPath = $projectDir -replace '\\', '/' -replace '^([A-Za-z]):', { '/mnt/' + $Matches[1].ToLower() }

Write-Host "Starting Ralph in WSL (project: $wslPath)..." -ForegroundColor Cyan
Write-Host ""

wsl -e bash -c "cd '$wslPath' && ralph --monitor"
