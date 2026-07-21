# Copix install helper for Windows
# Requires: Node.js (see .nvmrc), Visual Studio Build Tools with C++ workload

param(
    [switch]$Launch
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path "$Root\package.json")) {
    throw "Could not find Copix root (expected package.json in $Root)"
}
Set-Location $Root

Write-Host "Copix install (root: $Root)" -ForegroundColor Cyan

Write-Host "`n[1/5] Prerequisites" -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required. Copix .nvmrc pins $(Get-Content .nvmrc)."
}
Write-Host "Node: $(node --version)"

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null
    if ($vsPath) {
        Write-Host "Visual Studio C++ tools: $vsPath" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Install 'Desktop development with C++' in Visual Studio Build Tools." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "WARNING: Visual Studio Installer not found." -ForegroundColor DarkYellow
}

Write-Host "`n[2/5] Restore build/ if missing" -ForegroundColor Yellow
if (-not (Test-Path "build\npm\postinstall.ts")) {
    git checkout HEAD -- build
}

Write-Host "`n[3/5] npm install (remote deps skipped on Windows)" -ForegroundColor Yellow
$env:VSCODE_FORCE_INSTALL = '1'
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n[4/5] Rebuild native modules" -ForegroundColor Yellow
& "$Root\scripts\rebuild-native.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n[5/5] Transpile TypeScript (dev build)" -ForegroundColor Yellow
Write-Host "NOTE: Do NOT run 'npm run compile-client' unless you need a production build — it can fail and wipe out/."
npm run transpile-client
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nCopix is ready." -ForegroundColor Green
Write-Host "  Launch:  .\scripts\copix.bat"
Write-Host "           (always use this — NOT Copix.exe directly, or you get a blank window)"
Write-Host "  Dev:     npm run watch   (terminal 1) + .\scripts\copix.bat (terminal 2)"
Write-Host "  Agent:   Ctrl+Shift+I"

if ($Launch) {
    & "$Root\scripts\copix.bat"
}
