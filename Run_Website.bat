@echo off
title Guhya Gyan Sanctuary Server
cls
cd /d "%~dp0"
if exist "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793265414159_86117020.jpg" (
    if not exist "%~dp0assets\images" mkdir "%~dp0assets\images"
    copy /Y "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793265414159_86117020.jpg" "%~dp0assets\images\harinama-chintamani-poster.jpg" >nul 2>&1
)
if exist "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793354102045_6f0f6322.jpg" (
    if not exist "%~dp0assets\images" mkdir "%~dp0assets\images"
    copy /Y "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793354102045_6f0f6322.jpg" "%~dp0assets\images\vraj-kishor-das.jpg" >nul 2>&1
)
echo ==========================================================
echo    Guhya Gyan Foundation - Website ^& Admin Server
echo ==========================================================
echo.
echo  Website URL:       http://127.0.0.1:3000/
echo  Contact Us:        http://127.0.0.1:3000/contact.html
echo  About Speaker:     http://127.0.0.1:3000/about-the-speaker.html
echo  Admin Dashboard:   http://127.0.0.1:3000/admin.html
echo.
echo ==========================================================
echo  Server shuru ho raha hai aur Browser automatically open hoga!
echo  DHYAN DEIN: Is black window ko band mat kijiyega.
echo ==========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '.\serve.ps1'"

pause
