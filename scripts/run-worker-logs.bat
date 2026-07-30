@echo off
title Online Auction - Worker Logs
cd /d "%~dp0.."
echo Showing live logs for auction-worker, outbox-relay, and async-worker...
docker compose logs -f auction-worker outbox-relay async-worker
