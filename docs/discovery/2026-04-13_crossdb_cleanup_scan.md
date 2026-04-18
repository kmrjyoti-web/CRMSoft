# Discovery Report — Cross-DB Include Cleanup
**Date:** 2026-04-13  
**Auditor run:** 7 findings, all match §2 list exactly

## Call Sites

| # | File | Line | Entity | FK Field | Include | Downstream Use | Path Type |
|---|------|------|--------|----------|---------|---------------|-----------|
| 1 | calendar.service.ts | 32 | calendarEvent | userId | `user: { select: {id,firstName,lastName} }` | Returns event with user name attached | Request handler |
| 2 | ownership-core.service.ts | 34 | entityOwner | userId | `user: { select: {id,firstName,lastName,email,avatar} }` | Returns owner with user details | Request handler |
| 3 | ownership-core.service.ts | 52 | entityOwner | userId | Same as #2 | Returns created owner | Request handler |
| 4 | ownership-core.service.ts | 98 | entityOwner | userId | Same as #2 | Returns transferred owner | Request handler |
| 5 | ownership-core.service.ts | 159 | entityOwner | userId+assignedById | `user: {...}, assignedByUser: {...}` | Returns entity owners list | Request handler |
| 6 | add-watcher.handler.ts | 25 | taskWatcher | userId | `user: { select: {id,firstName,lastName} }` | Returns created watcher | CQRS handler |
| 7 | data-masking.service.ts | 230 | dataMaskingPolicy | roleId | `role: { select: {id,displayName} }` | Returns policies with role name | Request handler |

## Resolver Methods Available

- `resolveUsers(records, fkFields, userSelect?)` — batch, auto-names relations
- `resolveUser(userId)` — single record
- `resolveRoles(records, fkField?, roleSelect?)` — batch, auto-names `role` relation

All 7 sites can be fixed with existing resolver methods. No new methods needed.
