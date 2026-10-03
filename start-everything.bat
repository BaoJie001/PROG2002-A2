@echo off
REM ===========================================================================
REM  One-click start for the Charity Events website.
REM
REM    1. starts MySQL 8.0 (hidden, using start-mysql-silent.vbs)
REM    2. waits until the database is actually accepting connections
REM    3. starts the Express API in its own window
REM    4. opens http://localhost:3000/ in your browser
REM
REM  To stop everything: close the API window, then end mysqld.exe in
REM  Task Manager.
REM ===========================================================================

echo.
echo [1/4] Starting MySQL 8.0...
cscript //nologo "%~dp0start-mysql-silent.vbs"

echo [2/4] Waiting for the database on port 3306...
set TRIES=0
:WAIT
set /a TRIES+=1
if %TRIES% GTR 40 (
    echo.
    echo MySQL did not start. Is start-mysql.bat able to run on its own?
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 goto WAIT
echo       Database is up.

echo [3/4] Starting the API on http://localhost:3000 ...
start "Charity Events API" cmd /k "cd /d "%~dp0api" && npm run dev"

timeout /t 5 /nobreak >nul

echo [4/4] Opening the website...
start "" http://localhost:3000/

echo.
echo Done. Keep the "Charity Events API" window open while you use the site.
echo.
pause
