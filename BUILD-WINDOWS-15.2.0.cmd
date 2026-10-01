@echo off
setlocal
where go >nul 2>&1
if errorlevel 1 (
  echo Go 1.23 oder neuer fehlt. Bitte erst den Go-Compiler installieren.
  exit /b 1
)
cd /d "%~dp0desktop\app" || exit /b 1
if not exist "..\..\downloads" mkdir "..\..\downloads"
set GOOS=windows
set GOARCH=amd64
set CGO_ENABLED=0
go build -trimpath -ldflags="-s -w" -o "..\..\downloads\Beziehungsdynamiken-Desktop-15.2.0-windows.exe" .
if errorlevel 1 exit /b 1
echo Fertig: downloads\Beziehungsdynamiken-Desktop-15.2.0-windows.exe
