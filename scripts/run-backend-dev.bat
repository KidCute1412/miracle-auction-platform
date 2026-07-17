@echo off
title Online Auction - Backend
cd /d "%~dp0..\Backend"
call npm install
echo Running database migrations...
call npm run migrate:latest
call npx prisma migrate deploy
call npm run dev
