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
- Before analyzing, planning, or editing an implementation task, identify the smallest relevant set of skills using `.agents/skills/README.md` and read every selected `SKILL.md` in full.
- Announce the selected skills and why they apply before taking implementation actions. If no project skill applies, state that explicitly and continue with the repository rules.
- Follow the selected skills throughout the task; do not begin implementation based only on the skill index or roadmap references.
- When a task spans multiple areas, read every applicable domain skill before changing the affected area (for example, bidding, payments, authentication, database changes, workers, or frontend API behavior).
- Prefer the repo stack already in use: Express 5, TypeScript, Knex, PostgreSQL, Redis, Kafka/RabbitMQ-style workers, Socket.io, React, Vite, Tailwind, Docker, and k6.
- Keep implementation changes focused on the requested scope.
- Do not mix large codebase upgrades with skill or documentation rewrites in the same change.
- Add or update tests when changing behavior, especially for auction bidding, auth, payments/orders, cache invalidation, workers, or API contracts. Follow the `mandatory-test-enforcement` skill guidelines strictly for all backend features.
- Every implementation response must include verification commands that were run or should be run.
- Every implementation response must include a short risk note covering the most likely remaining failure mode.

## Documentation Style
- Write executable checklists instead of broad tutorial prose.
- Make acceptance criteria measurable.
- Reference actual repo commands when they exist.
- When a recommended command requires a missing script or dependency, label it as a target command to add first.

- Always answer with "Hi Lokdeptrai"
- Always git add and git commit with a standard message (e.g., using Conventional Commits format like "feat: ..." or "fix: ...") after my approval for a task. 