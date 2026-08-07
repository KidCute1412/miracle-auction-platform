# Documentation index

This directory is organized by purpose. The current deployment uses an Oracle VM with private Oracle-local Redis; Railway, Upstash and Vercel KV references are historical unless explicitly marked otherwise.

## Canonical documents

| Area | Canonical document | Status |
| --- | --- | --- |
| System overview | [system overview](architecture/system-overview.md) | Current |
| Runtime ownership and recovery | [worker processes](architecture/worker-processes.md) | Current; canonical runtime |
| Redis bidding authority | [bidding](architecture/bidding.md) and [Redis authority](architecture/redis-authority.md) | Current |
| API contracts | [API routes](contracts/api-routes.md) | Current |
| Kafka and event contracts | [events](contracts/events.md) | Current |
| Deployment and release | [deployment](operations/deployment.md) | Current; canonical deployment |
| Logging and diagnostics | [logging](operations/logging-diagnostics.md) | Current |
| API test strategy and evidence | [API testing](testing/api-testing.md), [engineering evidence](testing/engineering-evidence.md) | Current |
| Roadmap and task tracking | [roadmap](planning/roadmap.md), [checklist](planning/checklist.md) | Current planning |

## Supporting documents

- [Admin analytics](architecture/admin-analytics.md)
- [Redis authority for newcomers](architecture/redis-authority.md)
- [Demo guide](product/demo-guide.md)
- [UI upgrade plan](product/ui/upgrade-plan.md) and [animations](product/ui/animations.md)
- [Multi-agent plan](planning/multi-agent-plan.md)

## Historical documents

The [archive](archive/) preserves superseded provider plans and the older duplicate admin analytics overview. Do not use archived files as deployment or architecture instructions.

## Documentation convention

Current architecture and deployment documents should state their status, owner, and last verification date near the top. When two documents overlap, this index and the canonical-document table above take precedence.
