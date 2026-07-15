@echo off
title Online Auction - Backend
cd /d "%~dp0..\Backend"
call npm install
call npm run dev
