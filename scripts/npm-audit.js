#!/usr/bin/env node
/**
 * npm-audit.js
 * Runs `npm audit` across every package in the CRMSoft monorepo.
 *
 * Usage:
 *   node scripts/npm-audit.js           # audit only, print summary
 *   node scripts/npm-audit.js --fix     # run `npm audit fix` on each package
 *   node scripts/npm-audit.js --ci      # exit 1 if critical or high vulns found
 *   node scripts/npm-audit.js --json    # also write docs/security-reports/YYYY-MM-DD.json
 *
 * Skips vendored libs (lib/coreui/*).
 */

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARGS = process.argv.slice(2);
const FIX  = ARGS.includes('--fix');
const CI   = ARGS.includes('--ci');
const JSON_OUT = ARGS.includes('--json');

// ─── Packages to audit ────────────────────────────────────────────────────────
const PACKAGES = [
  // Backend
  { name: 'api',              dir: 'Application/backend' },
  // Frontends
  { name: 'customer-portal',  dir: 'Application/frontend/customer-portal' },
  { name: 'marketplace',      dir: 'Application/frontend/marketplace' },
  { name: 'crm-admin',        dir: 'Customer/frontend/crm-admin' },
  { name: 'vendor-panel',     dir: 'Vendor/frontend/vendor-panel' },
  // WhiteLabel
  { name: 'wl-api',           dir: 'WhiteLabel/wl-api' },
  { name: 'wl-admin',         dir: 'WhiteLabel/wl-admin' },
  { name: 'wl-partner',       dir: 'WhiteLabel/wl-partner' },
  // Shared SDK packages
  { name: '@crmsoft/common',         dir: 'Shared/common' },
  { name: '@crmsoft/frontend',       dir: 'Shared/frontend' },
  { name: '@crmsoft/prisma-schemas', dir: 'Shared/prisma-schemas' },
  { name: '@crmsoft/identity',       dir: 'Shared/backend/identity' },
  { name: '@crmsoft/tenant',         dir: 'Shared/backend/tenant' },
  { name: '@crmsoft/errors',         dir: 'Shared/backend/errors' },
  { name: '@crmsoft/notifications',  dir: 'Shared/backend/notifications' },
  { name: '@crmsoft/storage',        dir: 'Shared/backend/storage' },
  { name: '@crmsoft/audit',          dir: 'Shared/backend/audit' },
  { name: '@crmsoft/cache',          dir: 'Shared/backend/cache' },
  { name: '@crmsoft/encryption',     dir: 'Shared/backend/encryption' },
  { name: '@crmsoft/global-data',    dir: 'Shared/backend/global-data' },
  { name: '@crmsoft/prisma',         dir: 'Shared/backend/prisma' },
  { name: '@crmsoft/queue',          dir: 'Shared/backend/queue' },
];

const SEVERITY_ORDER = ['critical', 'high', 'moderate', 'low', 'info'];
const SEVERITY_COLOR = {
  critical: '\x1b[1;31m', // bold red
  high:     '\x1b[0;31m', // red
  moderate: '\x1b[0;33m', // yellow
  low:      '\x1b[0;36m', // cyan
  info:     '\x1b[0;37m', // grey
};
const RESET = '\x1b[0m';
const GREEN = '\x1b[0;32m';
const BOLD  = '\x1b[1m';

function color(sev, text) {
  return (SEVERITY_COLOR[sev] || '') + text + RESET;
}

function hasLockfile(dir) {
  return (
    fs.existsSync(path.join(dir, 'package-lock.json')) ||
    fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ||
    fs.existsSync(path.join(dir, 'yarn.lock'))
  );
}

function isPnpm(dir) {
  return fs.existsSync(path.join(dir, 'pnpm-lock.yaml'));
}

// ─── Run audit on one package ─────────────────────────────────────────────────
function auditPackage(pkg) {
  const absDir = path.join(ROOT, pkg.dir);

  if (!fs.existsSync(absDir)) {
    return { ...pkg, status: 'missing', vulns: {}, total: 0 };
  }
  if (!hasLockfile(absDir)) {
    return { ...pkg, status: 'no-lockfile', vulns: {}, total: 0 };
  }

  const usePnpm = isPnpm(absDir);
  const auditCmd = usePnpm
    ? 'pnpm audit --json'
    : 'npm audit --json';

  try {
    const out = execSync(auditCmd, {
      cwd: absDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
      // npm audit exits 1 when vulns found — suppress throw
    });
    return parseAuditOutput(pkg, out, usePnpm);
  } catch (err) {
    // npm audit exits non-zero when vulns present; stdout still has JSON
    const out = err.stdout || '';
    if (out.trim().startsWith('{')) {
      return parseAuditOutput(pkg, out, usePnpm);
    }
    return { ...pkg, status: 'error', error: err.message.slice(0, 120), vulns: {}, total: 0 };
  }
}

function parseAuditOutput(pkg, rawJson, isPnpmFormat) {
  let data;
  try { data = JSON.parse(rawJson); } catch {
    return { ...pkg, status: 'parse-error', vulns: {}, total: 0 };
  }

  // npm audit JSON v2 (npm 7+)
  const vulns = {};
  let total = 0;

  if (data.metadata?.vulnerabilities) {
    const v = data.metadata.vulnerabilities;
    for (const sev of SEVERITY_ORDER) {
      const n = v[sev] || 0;
      if (n > 0) vulns[sev] = n;
      total += n;
    }
  } else if (data.vulnerabilities) {
    // npm v6 format
    for (const [, info] of Object.entries(data.vulnerabilities)) {
      const sev = (info.severity || 'info').toLowerCase();
      vulns[sev] = (vulns[sev] || 0) + 1;
      total++;
    }
  }

  return { ...pkg, status: total === 0 ? 'clean' : 'vulns', vulns, total, raw: data };
}

// ─── Run audit fix on one package ────────────────────────────────────────────
function fixPackage(pkg) {
  const absDir = path.join(ROOT, pkg.dir);
  if (!fs.existsSync(absDir) || !hasLockfile(absDir)) return;

  const usePnpm = isPnpm(absDir);
  const fixCmd  = usePnpm ? 'pnpm audit --fix' : 'npm audit fix';
  console.log(`  ${BOLD}→ npm audit fix${RESET}: ${pkg.name}`);
  spawnSync(fixCmd.split(' ')[0], fixCmd.split(' ').slice(1), {
    cwd: absDir, stdio: 'inherit',
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}CRMSoft NPM Security Audit${RESET}`);
console.log(`${'─'.repeat(60)}`);
if (FIX) console.log(`${BOLD}Mode: audit + fix${RESET}\n`);

const results = [];
const totals  = {};

for (const pkg of PACKAGES) {
  process.stdout.write(`  Auditing ${pkg.name.padEnd(30)} `);
  const result = auditPackage(pkg);
  results.push(result);

  if (result.status === 'clean') {
    console.log(`${GREEN}✓ clean${RESET}`);
  } else if (result.status === 'vulns') {
    const parts = SEVERITY_ORDER
      .filter(s => result.vulns[s])
      .map(s => color(s, `${result.vulns[s]} ${s}`));
    console.log(parts.join('  '));
    // accumulate totals
    for (const [sev, count] of Object.entries(result.vulns)) {
      totals[sev] = (totals[sev] || 0) + count;
    }
    if (FIX) fixPackage(pkg);
  } else if (result.status === 'missing') {
    console.log(`\x1b[2m(directory not found)\x1b[0m`);
  } else if (result.status === 'no-lockfile') {
    console.log(`\x1b[2m(no lockfile — skipped)\x1b[0m`);
  } else {
    console.log(`\x1b[31m${result.status}${result.error ? ': ' + result.error : ''}\x1b[0m`);
  }
}

// ─── Summary table ────────────────────────────────────────────────────────────
const totalVulns = Object.values(totals).reduce((a, b) => a + b, 0);
const cleanCount = results.filter(r => r.status === 'clean').length;
const vulnCount  = results.filter(r => r.status === 'vulns').length;

console.log(`\n${'─'.repeat(60)}`);
console.log(`${BOLD}Summary${RESET}`);
console.log(`${'─'.repeat(60)}`);
console.log(`  Packages audited : ${PACKAGES.length}`);
console.log(`  ${GREEN}Clean            : ${cleanCount}${RESET}`);
if (vulnCount > 0) {
  console.log(`  Packages with vulns: ${vulnCount}`);
  console.log(`  Total vulnerabilities: ${totalVulns}`);
  for (const sev of SEVERITY_ORDER) {
    if (totals[sev]) {
      console.log(`    ${color(sev, `${sev.padEnd(10)}: ${totals[sev]}`)}`);
    }
  }
}

// ─── JSON report ──────────────────────────────────────────────────────────────
if (JSON_OUT) {
  const reportDir = path.join(ROOT, 'docs/security-reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(reportDir, `${date}.json`);
  const report = {
    date,
    packages: PACKAGES.length,
    clean: cleanCount,
    withVulns: vulnCount,
    totals,
    details: results.map(r => ({
      name: r.name,
      dir:  r.dir,
      status: r.status,
      vulns: r.vulns,
      total: r.total,
    })),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved → ${reportPath.replace(ROOT + '/', '')}`);
}

// ─── CI gate ──────────────────────────────────────────────────────────────────
if (CI) {
  const critHigh = (totals.critical || 0) + (totals.high || 0);
  if (critHigh > 0) {
    console.log(`\n${color('critical', `✖ CI GATE FAILED: ${critHigh} critical/high vulnerabilities found`)}`);
    process.exit(1);
  }
  console.log(`\n${GREEN}✓ CI gate passed — no critical/high vulnerabilities${RESET}`);
}

console.log('');
