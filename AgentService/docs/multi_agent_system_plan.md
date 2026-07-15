# Implementation Plan: Reusable Multi-Agent Platform & Metrics Dashboard

This document outlines a phased, actionable checklist for transforming `AgentService` into a portable, true multi-agent platform with a real-time web interface and granular metrics observability.

---

## Phase 1: Core Agent Refactoring (True Multi-Agent Pattern)

Transition the rigid sequence (`context_indexing -> planning -> implementing -> testing -> reviewing`) to a dynamic graph controlled by a Supervisor/Orchestrator.

- [ ] **Define Agent Personas & Prompt Templates**:
  - Update `AgentService/src/workflow/prompts.ts` to support supervisor guidance and specialized tool-calling personas (Planner, Coder, Tester, Reviewer).
- [ ] **Implement Supervisor Routing Node**:
  - Add a Supervisor node in the LangGraph setup to analyze the plan status, determine the next agent to invoke, or route back to previous steps dynamically based on outputs.
- [ ] **Transition to Tool-calling Architecture**:
  - Equip Coder with specific files-reading/writing tools, and Tester with execution/reporting tools, moving away from executing raw, monolithic scripts on stdin.
- [ ] **Validate Core Graph Integration**:
  - Run the test suite `npm test` to ensure that state routing, conditional edges, and transitions work properly.

---

## Phase 2: CLI Packaging & Reusability

Enable running the multi-agent system in any target repository without hardcoding paths.

- [ ] **Decouple Repository Settings**:
  - Modify `AgentService/src/config/projectConfig.ts` to dynamically resolve paths using a local `.agentservice.json` config in the target repository root.
  - Define fields in `.agentservice.json`: `projectName`, `buildCommand`, `testCommand`, `excludePaths`, `maxIterations`, and custom provider configurations.
- [ ] **Build the CLI Bootstrapper**:
  - Create a CLI package entry point (`AgentService/src/bin/cli.ts`) using a CLI parser library (e.g. `commander`).
  - Implement two core commands:
    - `agent-service init`: Scaffolds a default `.agentservice.json` in the current folder.
    - `agent-service run "<task>"`: Calls the AgentService API server to register and schedule a run.

---

## Phase 3: DB Schema Extensions & Metrics Tracking

Track token consumption, execution times, costs, and success rates for observability.

- [ ] **Create Database Migration**:
  - Write a migration file `AgentService/migrations/002_observability_metrics.sql` to extend schema tables:
    ```sql
    ALTER TABLE agent_runs ADD COLUMN total_tokens INT DEFAULT 0;
    ALTER TABLE agent_runs ADD COLUMN total_cost NUMERIC(10, 5) DEFAULT 0.00000;
    ALTER TABLE agent_runs ADD COLUMN total_duration_ms INT DEFAULT 0;
    
    ALTER TABLE agent_steps ADD COLUMN tokens_used INT DEFAULT 0;
    ALTER TABLE agent_steps ADD COLUMN cost NUMERIC(10, 5) DEFAULT 0.00000;
    ```
- [ ] **Implement Token & Cost Instrumentation**:
  - Update LLM provider adapters to parse token usage data from the model responses (prompt tokens, completion tokens) and record them to database step records.
  - Calculate costs dynamically based on model pricing (e.g., Gemini / GPT input/output cost profiles).

---

## Phase 4: Express API & Real-time Log Streaming

Expose agent runs, steps, and stream live stdout logs to the dashboard.

- [ ] **Add WebSocket Server (Socket.io)**:
  - Integrate `socket.io` into `AgentService/src/server.ts`.
  - Implement namespace/room bindings per `runId` to stream live execution logs and command stdout from the runner hooks to connected web clients.
- [ ] **Develop Metrics API Endpoints**:
  - Add API endpoints to query:
    - `/api/metrics/summary`: Aggregate statistics on total runs, costs, average duration, and token usages.
    - `/api/metrics/latency`: Step-by-step latency breakdown.
    - `/api/metrics/failure-rates`: Recurrence of test and build failures.

---

## Phase 5: React Admin Dashboard (Web UI)

Build a clean, responsive web interface for managing runs, viewing diffs, and analyzing metrics.

- [ ] **Setup React/Vite Client Project**:
  - Scaffold a lightweight Vite-based React application inside `AgentService/dashboard/`.
  - Integrate TailwindCSS for clean, premium styling and `recharts` for metrics visual graphing.
- [ ] **Implement Live Terminal Console Panel**:
  - Design a real-time console component using `xterm.js` or a custom terminal log viewer connected via WebSocket to stream log events dynamically.
- [ ] **Build Interactive Git Diff & Approval UI**:
  - Create a side-by-side file comparison viewer to display the proposed `workspace.patch` changes.
  - Add "Approve" (calls `/api/agent-runs/:id/approve` to merge to main repo) and "Reject" (sends feedback back to Coder) control actions.
- [ ] **Build Analytics Metrics View**:
  - Create dashboards with charts showing total costs, daily token consumption, average iteration counts, and step duration profiles.
- [ ] **Package API & Dashboard Together**:
  - Configure the Express server to host the static production build of the React dashboard in non-development modes.
