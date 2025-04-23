@echo off
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b %errorlevel%
)
echo Press any key to close this window...
pause > nul 