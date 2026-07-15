# AgentService

Standalone multi-agent development automation service for this monorepo.

## Quick Start

From the repository root:

```powershell
.\start-agents.bat
```

The script starts local Postgres through Docker Compose, installs AgentService dependencies if needed, applies the AgentService migration, and opens separate terminals for the API and worker.

When Windows Terminal (`wt`) is available, the API and worker are opened in one `Online Auction - Agents` tab with split panes. Otherwise, the script falls back to two separate command windows.

Submit a task from the repository root:

```powershell
.\agent-task.bat
```

This prompts for a task, creates an agent run, prints the status/artifact URLs, and polls the run until it reaches a terminal or approval state.

If migration fails with `password authentication failed for user "postgres"`, `AgentService/.env` is pointing at the wrong Postgres. This project maps its Docker Postgres to host port `15432` to avoid conflicts with other projects, so the default local URL is:

```env
DATABASE_URL=postgresql://postgres:my_local_password@localhost:15432/online_auction_agents
```

## Runtime

- API server: `npm run dev` or `npm start`
- Worker: `npm run worker` or `npm run start:worker`
- Typecheck: `npm run build`
- Tests: `npm test`

Copy `.env.example` to `.env` if you need custom values:

- `DATABASE_URL`
- `ANTIGRAVITY_CLI_PATH` for planning. Use `antigravity` if it is available in PATH.
- `CODEX_CLI_PATH` for implementation, testing, and review. Use `codex` if it is available in PATH.
- `AGENT_REPO_ROOT` to the source repository root
- `AGENT_WORKSPACE_ROOT` to an isolated writable workspace directory

## Database

Apply `migrations/001_agent_service_schema.sql` to the PostgreSQL database before starting the API or worker.

The schema stores:

- `agent_runs`
- `agent_steps`
- `agent_artifacts`
- `agent_command_audits`
- `agent_approvals`

## API

- `POST /api/agent-runs`
- `GET /api/agent-runs/:id`
- `GET /api/agent-runs/:id/artifacts`
- `POST /api/agent-runs/:id/approve`
- `POST /api/agent-runs/:id/cancel`
- `GET /health`
- `GET /ready`

All API responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": ... }` envelopes.
