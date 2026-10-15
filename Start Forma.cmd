@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 or later is required.
  pause
  exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm 11 is required. Install it with: npm install -g pnpm@11
  pause
  exit /b 1
)
if not exist "node_modules" (
  call pnpm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://127.0.0.1:4173 after the local server starts.
echo All included records are fictional. Press Ctrl+C to stop.
call pnpm dev
pause
