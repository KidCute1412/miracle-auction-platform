# Enterprise API Standards

## When to Apply
- Use when adding or changing Express routes, controllers, validation, API clients, or error handling.
- Use with `secure-auth-owasp` for auth endpoints.
- Use with `frontend-production-quality` when frontend code consumes changed responses.

## Repo Context
- Backend uses Express 5, TypeScript, Joi validation files under `Backend/src/validates`, and Knex models.
- Current code already has role middleware and mixed response/error patterns.
- Frontend service files under `Frontend/src/services` should receive stable response shapes.

## Implementation Checklist
- Validate every body, query, params, and file-upload metadata before controller logic.
- Use Joi consistently because it is already installed and used in the repo.
- Normalize validation errors into a single API error envelope.
- Add typed custom errors with `statusCode`, `code`, `message`, optional `details`, and `isOperational`.
- Centralize Express error handling after all routes.
- Hide stack traces and internal SQL/provider messages in production.
- Return request IDs in error responses and response headers.
- Use response envelopes consistently, for example `{ success: true, data, meta }` and `{ success: false, error: { code, message, details, requestId } }`.
- Ensure pagination responses include stable `meta` fields: `page`, `limit`, `total`, and `totalPages`.
- Keep controller code thin: parse request, call service, return envelope.
- Keep service code responsible for business decisions and model code responsible for data access.
- Align frontend API clients with the response envelope instead of parsing route-specific shapes.

## Acceptance Criteria
- All changed endpoints have Joi validation for inputs.
- All changed endpoints return the standard success/error envelope.
- Production errors do not leak stack traces, SQL text, secrets, tokens, or provider internals.
- Request IDs are available in logs and responses.
- Frontend services handle validation errors and auth errors predictably.
- API behavior is covered by integration tests or documented target tests if test tooling is not yet added.

## Verification Commands
```powershell
cd Backend; npm run build
cd Frontend; npm run build
```

Target commands after adding backend test scripts:
```powershell
cd Backend; npm run test:integration
```

Manual smoke checks:
```powershell
curl -i http://localhost:8000/api/health
curl -i -X POST http://localhost:8000/api/account/login -H "Content-Type: application/json" -d "{}"
```

## Anti-Patterns
- Returning raw `err.message` for every failure.
- Mixing `{ message }`, `{ error }`, arrays, and booleans across endpoints.
- Validating only request bodies while trusting params and query strings.
- Putting business rules inside Joi schemas that need database state.
- Updating backend response shape without updating frontend service handling.

## Portfolio Signal
- The API looks reviewable and production-oriented: predictable contracts, sanitized errors, and traceable requests.
