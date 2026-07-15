@echo off
title Online Auction - Agent Worker
cd /d "%~dp0..\AgentService"
npm run worker
