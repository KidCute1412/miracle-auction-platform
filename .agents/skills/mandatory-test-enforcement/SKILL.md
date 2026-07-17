---
name: mandatory-test-enforcement
description: Enforce writing unit and integration tests for every code change or new API feature.
---

# Mandatory Test Enforcement

## When to Apply
- Apply to EVERY task that adds a new API endpoint, alters business logic, fixes a bug, or changes data structures.
- Use this skill to ensure no code changes are accepted without corresponding automated tests.

## Key Rules for Agents
1. **Never skip testing:** If a file has modified logic, verify or add a unit test in its respective module.
2. **For every new API route:**
   - Write at least one successful Integration Test using `supertest`.
   - Write at least one failure path Integration Test (e.g., invalid input, unauthorized access, or resource not found).
3. **Keep tests isolated:** Ensure database operations are wrapped in transactions or cleaned up in `afterEach` hooks using isolated test databases.
4. **Run existing tests before and after modifications:**
   ```powershell
   cd Backend; npm run test
   ```
5. **No Placeholders in Tests:** Do not use `TODO` comments or empty test cases (`it("should do something")` with no assertions). Every test must be fully implemented and executing active assertions.

## Verification Checklist
- [ ] `npm run test` executes and succeeds without any failures.
- [ ] Test coverage threshold requirements are met.
- [ ] No actual production or development data was overwritten during test execution.
