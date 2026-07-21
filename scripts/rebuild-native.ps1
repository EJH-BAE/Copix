# Rebuild Copix native modules using the patched bundled node-gyp (SpectreMitigation=false).
$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

function Invoke-NodeGypRebuild([string]$dir) {
    Push-Location $dir
    try {
        cmd /c "node `"$nodeGyp`" rebuild 2>&1"
        if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }
    } finally {
        Pop-Location
    }
}

$nodeGyp = Join-Path $Root 'build\npm\gyp\node_modules\node-gyp\bin\node-gyp.js'
if (-not (Test-Path $nodeGyp)) {
    throw "Bundled node-gyp not found at $nodeGyp. Run: npm install (with build/ restored)."
}

$env:npm_config_disturl = 'https://electronjs.org/headers'
$env:npm_config_target = '42.5.0'
$env:npm_config_ms_build_id = '14525058'
$env:npm_config_runtime = 'electron'
$env:npm_config_build_from_source = 'true'
$env:npm_config_msbuild_args = '/p:SpectreMitigation=false'
$env:npm_config_node_gyp = $nodeGyp

$packages = @(
    '@vscode/policy-watcher',
    '@vscode/windows-registry',
    '@vscode/spdlog',
    '@vscode/deviceid',
    '@vscode/windows-mutex',
    '@vscode/windows-process-tree',
    '@vscode/windows-ca-certs',
    '@vscode/sqlite3',
    'node-pty',
    'native-keymap',
    'native-watchdog',
    '@parcel/watcher',
    'windows-foreground-love'
)

Write-Host "Rebuilding native modules with patched node-gyp..." -ForegroundColor Cyan

foreach ($pkg in $packages) {
    $dir = Join-Path $Root "node_modules\$($pkg.Replace('/','\'))"
    if (-not (Test-Path $dir)) {
        Write-Host "  skip $pkg (not installed)" -ForegroundColor DarkGray
        continue
    }
    Write-Host "  rebuild $pkg" -ForegroundColor Yellow
    try {
        Invoke-NodeGypRebuild $dir
    } catch {
        throw "node-gyp rebuild failed for $pkg ($($_.Exception.Message))"
    }
}

Write-Host "Native rebuild complete." -ForegroundColor Green
