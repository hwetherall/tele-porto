# Run Ralph from PowerShell (Ralph is a set of Bash scripts).
# Requires: Git Bash, and Ralph installed via install.sh (in Git Bash).
# That installs to $HOME/.ralph and $HOME/.local/bin — PowerShell doesn't see that PATH,
# so this script runs Ralph via Bash with the right paths.

$ErrorActionPreference = "Stop"

# Convert Windows path to Git Bash path: C:\Users\foo\bar -> /c/Users/foo/bar
function To-BashPath {
    param([string]$winPath)
    if (-not $winPath) { return "" }
    $p = $winPath -replace '\\', '/'
    if ($p -match '^([A-Za-z]):(.*)$') {
        return '/' + $Matches[1].ToLower() + $Matches[2]
    }
    return $p
}

# Ralph install location: install.sh puts scripts in $HOME/.ralph (Git Bash $HOME = USERPROFILE)
$ralphHome = $env:RALPH_HOME
if (-not $ralphHome) {
    $ralphHome = "$env:USERPROFILE\.ralph"
}
if (-not (Test-Path "$ralphHome\ralph_loop.sh")) {
    # Fallback: clone directory if they set RALPH_HOME to the repo
    $candidates = @(
        "$env:USERPROFILE\ralph-claude-code",
        "$env:USERPROFILE\OneDrive\Desktop\ralph-claude-code"
    )
    foreach ($dir in $candidates) {
        if (Test-Path "$dir\ralph_loop.sh") {
            $ralphHome = $dir
            break
        }
    }
}

# Find Bash (Git Bash on Windows)
$bashExe = $null
$bashPaths = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
)
foreach ($p in $bashPaths) {
    if (Test-Path $p) {
        $bashExe = $p
        break
    }
}

if (-not $bashExe) {
    Write-Host "Bash not found. Install Git for Windows (Git Bash) from https://git-scm.com/"
    Write-Host ""
    Write-Host "Then in Git Bash: clone ralph-claude-code, run ./install.sh, add ~/.local/bin to PATH in ~/.bashrc"
    exit 1
}

if (-not (Test-Path "$ralphHome\ralph_loop.sh")) {
    Write-Host "Ralph not found at: $ralphHome"
    Write-Host ""
    Write-Host "Install Ralph in Git Bash:"
    Write-Host "  1. Open Git Bash"
    Write-Host "  2. git clone https://github.com/frankbria/ralph-claude-code.git"
    Write-Host "  3. cd ralph-claude-code && ./install.sh"
    Write-Host "  4. Add to ~/.bashrc:  export PATH=\"`$HOME/.local/bin:`$PATH\""
    Write-Host "  5. Close and reopen Git Bash, then either:"
    Write-Host "     - Run 'ralph --monitor' from this project folder in Git Bash, or"
    Write-Host "     - Run this script again from PowerShell:  .\run-ralph.ps1 --monitor"
    exit 1
}

$projectRoot = $PSScriptRoot
$projectBash = To-BashPath $projectRoot
$ralphBash = To-BashPath $ralphHome
$monitor = if ($args -contains "--monitor") { "--monitor" } else { "" }

# Run Ralph: CWD must be the project (so .ralph/ and .ralphrc are found)
& $bashExe -c "cd '$projectBash' && '$ralphBash/ralph_loop.sh' $monitor"
exit $LASTEXITCODE
