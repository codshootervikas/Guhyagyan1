@echo off
title Guhya Gyan Sanctuary Server
cls
cd /d "%~dp0"
echo ==========================================================
echo    Guhya Gyan Foundation - Website ^& Admin Server
echo ==========================================================
echo.
echo  Website URL:       http://127.0.0.1:3000/
echo  Admin Dashboard:   http://127.0.0.1:3000/admin.html
echo  About Speaker:     http://127.0.0.1:3000/about-the-speaker.html
echo.
echo ==========================================================
echo  Server shuru ho raha hai aur Browser automatically open hoga!
echo  DHYAN DEIN: Is black window ko band mat kijiyega.
echo ==========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '.\serve.ps1'"

pause
