@echo off
title Online Auction - Backend
if "%BID_ENGINE%"=="" set "BID_ENGINE=redis"
if "%REDIS_URL%"=="" set "REDIS_URL=redis://localhost:16379"
cd /d "%~dp0..\Backend"
call npm run dev

