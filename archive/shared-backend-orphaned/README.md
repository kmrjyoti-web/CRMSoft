# Archived: Orphaned Shared Backend Packages

**Date archived:** 2026-05-04
**Reason:** 11 packages with 0 imports across entire codebase.
**Original location:** Shared/backend/

## Contents

| Package | Lines | Status |
|---|---|---|
| @crmsoft/audit | ~63 | Superseded by inline in apps-backend |
| @crmsoft/cache | ~103 | Superseded — in-memory Map, Redis preferred |
| @crmsoft/identity | ~86 | Superseded by apps-backend/src/modules/core/auth/ |
| @crmsoft/notifications | ~50 | Stub only |
| @crmsoft/prisma | ~65 | Superseded — multi-client arch replaced single-DB pattern |
| @crmsoft/tenant | ~44 | Superseded by apps-backend/src/modules/core/tenant/ |
| @crmsoft/errors | ~1479 | Reference — most complete error catalog in repo |
| @crmsoft/encryption | ~111 | Reference — AES-256-GCM if field encryption ever needed |
| @crmsoft/global-data | ~117 | Reference — INDIAN_STATES, enums |
| @crmsoft/queue | ~88 | Reference — BullMQ wrapper if queues added |
| @crmsoft/storage | ~83 | Reference — R2StorageService via S3 SDK |

## Why archived (not deleted)

Per project convention — code loss prevention.
Preserved for reference during future SDK extraction.

## Future use

When ready to extract SDKs (after 5-10 paying customers per master plan),
these packages provide reference implementations for packages-backend/.

See: docs/PHASE_2_SHARED_BACKEND_AUDIT.md for full audit findings.
