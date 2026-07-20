# Backend automated tests

The database used by the development application is never used by automated tests.

## Commands

- `npm run test:unit` runs `tests/unit/**/*.unit.test.ts` and does not require Docker.
- `npm run test:contracts` runs `tests/contract/**/*.contract.test.ts`, checking routes and middleware with mocked controllers without Docker.
- `npm run test:integration` runs `tests/integration/**/*.integration.test.ts` in a disposable PostgreSQL container, then removes it.
- `npm run test:concurrency` runs `tests/concurrency/**/*.concurrency.integration.test.ts` in the same disposable workflow.
- `npm test` runs unit, contract, integration, and concurrency tests.
- `npm run test:coverage` runs every test once inside one disposable database environment and enforces the coverage gate.
- `npm run test:ci` runs the TypeScript build followed by that complete coverage run, without provisioning a second database.

Database tests require a working Docker daemon. The runner creates `online_auction_ephemeral_test` inside a PostgreSQL 15 container with a random host port and no persistent volume. It always removes the container in a `finally` block. Do not set database test URLs manually or run the database test files directly with Vitest: the destructive cleanup guard accepts only credentials and connection markers issued by the runner.

Schema parity comes from `prisma migrate deploy`; test data comes only from deterministic fixtures. Redis, Kafka, SMTP, Cloudinary, Google OAuth, reCAPTCHA, and Socket.IO side effects are mocked. Any unexpected outbound HTTP request fails the test.
