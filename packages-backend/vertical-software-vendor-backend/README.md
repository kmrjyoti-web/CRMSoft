# @crmsoft/vertical-software-vendor-backend

**Status:** PLACEHOLDER

## Purpose

Backend logic specific to the **software-vendor** vertical:

- Zod schemas for the `verticalData` JSON column on relevant entities
- Vertical-specific service methods that don't belong in the core API
- Optional cron jobs / scheduled tasks for software-vendor-only workflows

## Scope Note

This package is for **CRMSoft customers in the software-vendor industry**. It is NOT for CRMSoft's own software-vendor-related platform ops (those would live in `apps-backend/api/` directly).
