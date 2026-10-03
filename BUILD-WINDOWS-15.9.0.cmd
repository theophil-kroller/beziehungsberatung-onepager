@echo off
setlocal
where go >nul 2>&1
if errorlevel 1 (
  echo Go 1.23 oder neuer fehlt. Bitte erst den Go-Compiler installieren.
  exit /b 1
)
if not exist "%~dp0desktop\app\web\public\emotion" mkdir "%~dp0desktop\app\web\public\emotion"
xcopy /E /I /Y "%~dp0public\emotion\*" "%~dp0desktop\app\web\public\emotion\" >nul
cd /d "%~dp0desktop\app" || exit /b 1
if not exist "..\..\downloads" mkdir "..\..\downloads"
set GOOS=windows
set GOARCH=amd64
set CGO_ENABLED=0
go build -trimpath -ldflags="-s -w" -o "..\..\downloads\Beziehungsdynamiken-Desktop-15.9.0-windows.exe" .
if errorlevel 1 exit /b 1
echo Fertig: downloads\Beziehungsdynamiken-Desktop-15.9.0-windows.exe
