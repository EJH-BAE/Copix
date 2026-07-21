@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Copix Studio - gpt-oss via Ollama
echo  ==================================
echo  1. Install Ollama from ollama.com
echo  2. Model panel: Pull gpt-oss:20b -^> Tune -^> Export
echo  3. Chat uses your tuned copix-gpt-oss model
echo.

where node >nul 2>&1 || (
	echo [Copix Studio] Node.js is required. Install from https://nodejs.org
	goto :fail
)

if not exist "node_modules\" (
	echo [Copix Studio] First run - installing npm dependencies...
	call npm install || goto :fail
)

node scripts\install-electron.mjs || goto :fail

echo [Copix Studio] Preparing dependencies (first run may take 1-2 min)...
call npx vite optimize || goto :fail

call npm run dev || goto :fail
exit /b 0

:fail
echo.
echo [Copix Studio] Launch failed. See errors above.
pause
exit /b 1
