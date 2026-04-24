# @crmsoft/core-business-types

**Status:** PLACEHOLDER

## Purpose

Holds the **7 hardcoded Core Business Types** that define CRMSoft's customer domain model:

1. `B2B`
2. `B2C`
3. `CUSTOMER`
4. `MANUFACTURER`
5. `SERVICE_PROVIDER`
6. `INDIVIDUAL_SERVICE_PROVIDER`
7. `EMPLOYEE`

## Governance

| Role | Can Add? | Can Modify? | Can Delete? |
|---|:-:|:-:|:-:|
| Software Provider (CRMSoft) | ✅ | ✅ | ✅ |
| Brand | ❌ | ❌ | ❌ |
| Customer (B2B / B2C) | ❌ | ❌ | ❌ |
| WL Partner | ❌ | ❌ | ❌ |

## V5 Integration

Backend modules import the enum from this package; database constraints (PlatformDB `BusinessTypeRegistry`) enforce the same values. The enum is the single source of truth.

See `docs/db/v5/10_DYNAMIC_FIELDS_V5.md` (on `develop`) for the full architecture.
