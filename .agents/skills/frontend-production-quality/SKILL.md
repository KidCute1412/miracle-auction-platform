---
name: frontend-production-quality
description: Use for React pages, forms, API clients, routing, socket features, dashboards, and responsive UI.
---

# Frontend Production Quality

## When to Apply
- Use for React pages, forms, API clients, routing, socket features, admin dashboards, and responsive UI improvements.
- Use with `enterprise-api-standards` when backend response shapes change.
- Use with `auction-domain-correctness` for product detail and bidding UI.

## Repo Context
- Frontend uses React 19, Vite, TypeScript, Tailwind, Radix UI, lucide-react, sonner, SweetAlert2, and Socket.io client.
- Current scripts: `npm run lint`, `npm run build`, `npm run dev`, `npm run preview`.
- API clients live under `Frontend/src/services`.
- Bidding socket hook exists at `Frontend/src/hooks/useSocketBidding.ts`.

## Implementation Checklist
- Use typed service functions and avoid parsing inconsistent response shapes in components.
- Provide loading, error, empty, success, and disabled states for every data-fetching view.
- Keep forms accessible: labels, focus states, keyboard submission, validation messages tied to fields.
- Align client validation with backend Joi rules without making frontend the only enforcement layer.
- Clean up Socket.io listeners in `useEffect` teardown and avoid duplicate subscriptions.
- Handle reconnects, stale product IDs, and page navigation for bid rooms.
- Show bid failures from API error codes in user-friendly copy.
- Keep admin screens dense and scannable; avoid landing-page styling for operational tools.
- Verify mobile layouts for product lists, product detail, bid history, checkout/order flows, and admin tables.
- Use semantic buttons and links; do not attach click behavior to non-interactive elements.
- Prevent layout shifts for images, cards, countdowns, and bid controls with stable dimensions.
- Avoid `any` in component state, service responses, and socket payloads.

## Acceptance Criteria
- Frontend lint and build pass.
- Changed screens have explicit loading, error, empty, and success states.
- Forms are keyboard usable and announce validation errors.
- Socket listeners are registered once and cleaned up on unmount or product change.
- API errors render consistently without crashing the page.
- Responsive checks cover mobile and desktop widths.

## Verification Commands
```powershell
cd Frontend; npm run lint
cd Frontend; npm run build
cd Frontend; npm run dev
```

Manual browser checks:
```text
product list mobile and desktop
product detail bid flow
bid history live update
login/register validation
admin dashboard table behavior
network error and empty-state behavior
```

Target commands after adding frontend tests:
```powershell
cd Frontend; npm run test
cd Frontend; npm run test:e2e
```

## Anti-Patterns
- Swallowing API errors and leaving stale UI.
- Registering Socket.io listeners on every render.
- Using `any` for service responses or socket payloads.
- Hiding disabled controls without explaining unavailable actions.
- Depending on color alone for status or validation.

## Portfolio Signal
- The UI feels production-ready: resilient API handling, accessible forms, clean sockets, responsive layouts, and reliable build gates.
