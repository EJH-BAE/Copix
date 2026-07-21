@echo off
setlocal
title Copix

pushd %~dp0\..

:: Required for dev CSS loading (without this you get a blank gray window)
set NODE_ENV=development
set VSCODE_DEV=1
set VSCODE_CLI=1
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

if not exist "out\vs\workbench\workbench.desktop.main.js" (
    echo.
    echo [Copix] out/ is missing. Run first:
    echo   npm run transpile-client
    echo.
    exit /b 1
)

if "%VSCODE_SKIP_PRELAUNCH%"=="" (
    node build/lib/preLaunch.ts || (
        echo Failed to prepare Copix for launch.
        exit /b 1
    )
)

set "NAMESHORT="
for /f "tokens=2 delims=:," %%a in ('findstr /R /C:"\"nameShort\":.*" product.json') do if not defined NAMESHORT set "NAMESHORT=%%~a"
set NAMESHORT=%NAMESHORT: "=%
set NAMESHORT=%NAMESHORT:"=%.exe
set CODE=".build\electron\%NAMESHORT%"

set DISABLE_TEST_EXTENSION="--disable-extension=vscode.vscode-api-tests --disable-extension=GitHub.copilot --disable-extension=GitHub.copilot-chat"
for %%A in (%*) do (
    if "%%~A"=="--extensionTestsPath" (
        set DISABLE_TEST_EXTENSION=""
    )
)

:: Launch Copix (%CODE% already includes quotes — do NOT wrap in extra quotes)
%CODE% . --skip-welcome %DISABLE_TEST_EXTENSION% %*

popd
endlocal
