---
name: secure-auth-owasp
description: Use for auth flows, role checks, cookies, CORS, rate limits, account recovery, and OWASP mitigations.
---

# Secure Auth & OWASP Mitigation

## When to Apply
- Use for login, register, refresh token, logout, OAuth, OTP, role checks, cookies, CORS, rate limits, and account recovery.
- Use with `enterprise-api-standards` for consistent errors.
- Use with `automated-testing-methodology` for auth regression coverage.

## Repo Context
- Backend dependencies include `jsonwebtoken`, `bcrypt`, `bcryptjs`, `cookie-parser`, `cors`, `express-rate-limit`, `rate-limit-redis`, and `ioredis`.
- `helmet` and CSRF middleware are not currently listed in `Backend/package.json`; add them before enforcing those controls.
- Frontend uses Google OAuth and reCAPTCHA packages.
- Redis is available through Docker Compose and should back rate limits or token reuse detection where appropriate.

## Implementation Checklist
- Store refresh tokens in HttpOnly, Secure, SameSite cookies.
- Use short-lived access tokens and refresh token rotation.
- Detect refresh token reuse by storing token family/version or hashed refresh token IDs in PostgreSQL or Redis.
- Revoke the token family on suspected reuse.
- Add CSRF protection for cookie-auth state-changing endpoints.
- Restrict CORS to configured frontend origins; never use wildcard origins with credentials.
- Validate OAuth, OTP, login, and reset-password payloads with Joi.
- Hash passwords with a single selected library and consistent cost settings.
- Use RBAC middleware for admin, seller, bidder, and owner-only paths.
- Add `helmet` for security headers after installing it.
- Store secrets only in environment variables; never commit live `.env` values.
- Apply Redis-backed rate limits to login, OTP, refresh, password reset, and bid submission.
- Ensure logs never include passwords, tokens, OTPs, cookies, or captcha responses.
- Run dependency audit before release.

## Acceptance Criteria
- Auth cookies use secure attributes in production.
- Refresh token rotation invalidates old tokens and detects reuse.
- State-changing cookie-auth routes have CSRF protection.
- CORS allowlist is environment-driven and tested.
- RBAC tests cover allowed role, denied role, missing user, and resource owner cases.
- Security-sensitive error messages are generic but still useful to the client.

## Verification Commands
```powershell
cd Backend; npm run build
cd Backend; npm audit
cd Frontend; npm run build
```

Target commands after adding test scripts:
```powershell
cd Backend; npm run test:integration -- auth
```

Manual smoke checks:
```powershell
curl -i -X OPTIONS http://localhost:8000/api/account/login
curl -i -X POST http://localhost:8000/api/account/login -H "Content-Type: application/json" -d "{}"
```

## Anti-Patterns
- Storing refresh tokens in localStorage.
- Accepting any CORS origin while using cookies.
- Returning "email exists" or "password wrong" details that enable enumeration.
- Logging token payloads, cookies, OTPs, or request bodies for auth endpoints.
- Adding role checks only in the frontend.

## Portfolio Signal
- Auth demonstrates OWASP-aware design: cookie safety, CSRF, rotation, reuse detection, RBAC, rate limiting, and clean secret handling.
