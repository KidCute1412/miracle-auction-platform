@echo off
title Online Auction - Frontend
cd /d "%~dp0..\Frontend"
call npm install
call npm run dev
