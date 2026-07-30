# Repository Guidelines

## Project Structure & Module Organization

- `Backend/src/` contains the Express API and modular-monolith domains. Runtime entry points are `server.ts`, `auction-worker.ts`, `outbox-relay.ts`, and `async-worker.ts`.
- `Backend/tests/` groups Vitest suites into `unit/`, `contract/`, `integration/`, and `concurrency/`. Prisma schema and migrations live in `Backend/prisma/`.
- `Frontend/src/` contains the React/Vite application; organize UI under `components/`, route screens under `pages/`, API clients under `services/`, and reusable behavior under `hooks/`.
- `AgentService/src/` is separate development automation, not part of the auction runtime.
- `docs/` documents architecture and operations. `PerformanceTests/` contains k6 scenarios and benchmark artifacts.

## Build, Test, and Development Commands

Install dependencies separately in `Backend`, `Frontend`, and `AgentService`.

```powershell
docker compose up -d postgres redis kafka
cd Backend; npm run dev                 # API with watch mode
npm run auction-worker                 # Redis Stream projector/closer
npm run outbox-relay                   # PostgreSQL outbox to Kafka
npm run async-worker                   # Dashboard and notification work
npm run build; npm test                # Compile and run backend suites
cd ../Frontend; npm run dev             # Vite development server
npm run lint; npm run build; npm test   # Frontend quality gates
cd ../AgentService; npm run build; npm test
```

Run `docker compose config` after Compose changes. Use `npm run test:integration` or `test:concurrency` in `Backend` for focused database testing.

## Coding Style & Naming Conventions

Use TypeScript, ES modules, two-space indentation, and existing Prettier/ESLint rules. Prefer explicit types and avoid `any`. Use `camelCase` for variables/functions, `PascalCase` for React components and types, and descriptive kebab/dot suffixes such as `place-bid.use-case.ts` or `*.integration.test.ts`. Keep controllers thin; place business rules in application/domain code and infrastructure concerns in adapters.

## Testing Guidelines

Every behavior change requires tests. Use Vitest and Supertest in the backend, Vitest with Testing Library in the frontend, and Node’s test runner in `AgentService`. Cover success, validation, authorization, and failure paths. Concurrency-sensitive auction changes must verify final database/Redis invariants, not only HTTP responses. Never point integration or k6 tests at production services.

## Commit & Pull Request Guidelines

Follow the observed Conventional Commit style: `feat(frontend): ...`, `fix(bidding): ...`, or `feat(benchmark): ...`. Keep commits focused and imperative. Pull requests should explain behavior, architecture impact, migrations/configuration, commands run, and residual risks. Link relevant issues and include screenshots for UI changes or benchmark artifacts for performance claims.

## Security & Architecture Notes

Never commit `.env` files or credentials; update `.env.example` when configuration changes. PostgreSQL is durable storage, Redis is authoritative for active-auction mutations, and Kafka handles downstream effects. Preserve idempotency, per-auction ordering, outbox atomicity, and the single `auction-worker` constraint unless tests and measurements justify a redesign.
