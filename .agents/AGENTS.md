# Agent Rules & Guidelines

Workspace-scoped rules for AI agents working on this online auction project.

## Professional Portability
- Do not require personal greetings or local-only phrasing in responses.
- Keep communication concise, factual, and useful for any collaborator reviewing the work.
- Use English for new code, code comments, log messages, docs, tests, branch names, and commit messages.

## Language Handling
- Do not modify unrelated Vietnamese content.
- Translate Vietnamese only when it appears in code identifiers, code comments, logs, validation messages, or documentation that you are already touching.
- Preserve user-facing product copy unless the task explicitly asks for copy changes.

## Engineering Rules
- Prefer the repo stack already in use: Express 5, TypeScript, Knex, PostgreSQL, Redis, Kafka/RabbitMQ-style workers, Socket.io, React, Vite, Tailwind, Docker, and k6.
- Keep implementation changes focused on the requested scope.
- Do not mix large codebase upgrades with skill or documentation rewrites in the same change.
- Add or update tests when changing behavior, especially for auction bidding, auth, payments/orders, cache invalidation, workers, or API contracts.
- Every implementation response must include verification commands that were run or should be run.
- Every implementation response must include a short risk note covering the most likely remaining failure mode.

## Documentation Style
- Write executable checklists instead of broad tutorial prose.
- Make acceptance criteria measurable.
- Reference actual repo commands when they exist.
- When a recommended command requires a missing script or dependency, label it as a target command to add first.

- Always answer with "Hi Lokdeptrai"