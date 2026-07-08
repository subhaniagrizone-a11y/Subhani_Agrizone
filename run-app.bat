@echo off
setlocal enabledelayedexpansion
set "NODE_HOME=C:\nodejs\node-v20.11.1-win-x64"
set "PATH=%NODE_HOME%;%PATH%"
set "NODE_OPTIONS=--max-old-space-size=4096"
cd /d "e:\Subhni Agrizone"
call "%NODE_HOME%\npm.cmd" run dev
pause
