# TypeScript Code Quality

## When to Apply
- Use for any TypeScript code change in Backend or Frontend.
- Use with every skill that touches services, controllers, models, hooks, workers, or API clients.
- Use before expanding tests or CI so type boundaries stay clear.

## Repo Context
- Backend and Frontend are TypeScript ESM projects.
- Backend has interfaces, models, modules, routes, middlewares, validates, jobs, and workers.
- Frontend has service clients, hooks, interfaces, pages, routes, and UI components.

## Implementation Checklist
- Keep request, response, DTO, domain, and database row types separate when shapes differ.
- Type environment config once and validate required variables at startup.
- Avoid unsafe `any`; use `unknown` at boundaries and narrow it.
- Type Express request params, body, query, and authenticated user context.
- Type Knex query results instead of assuming `any[]`.
- Type Socket.io event names and payloads on backend and frontend.
- Type Kafka event payloads with versioned event interfaces.
- Keep controllers thin and services explicit about return types.
- Keep frontend API clients typed and do not expose raw `fetch`/Axios responses to components.
- Use discriminated unions for domain statuses and error codes.
- Do not silence TypeScript errors with casts unless the boundary is validated.
- Prefer small local helper types over broad global declarations.

## Acceptance Criteria
- `npm run build` passes in Backend and Frontend.
- New or changed code does not introduce new unsafe `any`.
- API and socket payloads have named types shared or mirrored intentionally.
- Environment variables are validated before use.
- Type casts are justified by validation or library limitations.

## Verification Commands
```powershell
cd Backend; npm run build
cd Frontend; npm run build
cd Frontend; npm run lint
```

Search checks:
```powershell
rg -n ": any|as any|unknown as|@ts-ignore|@ts-expect-error" Backend/src Frontend/src
rg -n "process\.env" Backend/src Frontend/src
```

Target commands after adding stricter scripts:
```powershell
cd Backend; npm run typecheck
cd Frontend; npm run typecheck
```

## Anti-Patterns
- Passing database rows directly to frontend contracts without DTO mapping.
- Using `any` for request bodies, socket messages, or Kafka events.
- Reading `process.env` throughout application code.
- Casting invalid input instead of validating and narrowing.
- Making one large shared type represent every layer.

## Portfolio Signal
- TypeScript improves maintainability instead of only satisfying compilation: clear contracts, typed boundaries, and fewer runtime surprises.
