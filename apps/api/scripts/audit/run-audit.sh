#!/bin/bash
# DB Schema Auditor — shell wrapper for CI
# Usage: pnpm audit:db [--check=naming] [--db=working] [--format=json] [--deep]

set -euo pipefail
cd "$(dirname "$0")/../.."

npx ts-node --transpile-only src/modules/softwarevendor/db-auditor/cli/audit.cli.ts "$@"
