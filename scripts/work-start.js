#!/usr/bin/env node
/**
 * scripts/work-start.js — Cross-platform work:start (Windows-safe)
 * Usage: npm run work:start
 */
'use strict';

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const crypto = require('crypto');

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

function run(cmd, cwd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: cwd || ROOT,
      shell: process.platform === 'win32',
    }).trim();
  } catch (e) {
    return (e.stdout || '').trim();
  }
}

const SESSION_FILE = path.join(ROOT, '.work-session.json');
const timestamp    = new Date().toISOString();
const machine      = os.hostname();
const platform     = process.platform;
const osType       = platform === 'darwin' ? 'mac' : platform === 'win32' ? 'windows' : 'linux';

// ── Header ───────────────────────────────────────────────────────────────────
console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  WORK:START                                                  ║');
console.log(`║  Resuming on ${machine} (${osType})`.padEnd(63) + '║');
console.log('╚═══════════════════════════════════════════════════════════════╝');

// ── 1. Pull ───────────────────────────────────────────────────────────────────
console.log('\n=== Step 1: Pull latest code ===');
const branch = run('git branch --show-current');
console.log(`  Branch: ${branch}`);
run('git fetch origin');
const pullOut = run(`git pull origin ${branch} --rebase`);
console.log('  ' + pullOut.split('\n').slice(-2).join('\n  '));
console.log('  ✅ Code synced');

// ── 2. Dependencies ───────────────────────────────────────────────────────────
console.log('\n=== Step 2: Check dependencies ===');
const lockChanged = run('git diff HEAD~1 HEAD --name-only')
  .split('\n')
  .filter(f => /package-lock\.json|pnpm-lock\.yaml|yarn\.lock/.test(f)).length;

if (lockChanged > 0) {
  console.log('  🔄 Lockfile changed — installing dependencies...');
  const dirs = [
    'Application/backend',
    'Customer/frontend/crm-admin',
    'Vendor/frontend/vendor-panel',
    'WhiteLabel/wl-api',
  ];
  for (const dir of dirs) {
    const fullDir = path.join(ROOT, dir);
    if (fs.existsSync(fullDir)) {
      console.log(`  → ${dir}`);
      run('npm ci --silent', fullDir);
    }
  }
  console.log('  ✅ Dependencies installed');
} else {
  console.log('  ✅ Lockfiles unchanged — skipping install');
}

// ── 3. Prisma ─────────────────────────────────────────────────────────────────
console.log('\n=== Step 3: Prisma schemas ===');
const schemaChanged = run('git diff HEAD~1 HEAD --name-only')
  .split('\n').filter(f => f.endsWith('.prisma')).length;

if (schemaChanged > 0) {
  console.log('  🔄 Schema changed — regenerating Prisma clients...');
  const backendDir = path.join(ROOT, 'Application', 'backend');
  if (fs.existsSync(backendDir)) {
    run('npx prisma generate', backendDir);
    console.log('  ✅ Prisma clients regenerated');
  }
} else {
  console.log('  ✅ Schemas unchanged — skipping generate');
}

// ── 4. Previous session ───────────────────────────────────────────────────────
console.log('\n=== Step 4: Previous session context ===');
let prevMachine = 'none';
let prevClosed  = 'none';
let prevTask    = 'New session';

if (fs.existsSync(SESSION_FILE)) {
  try {
    const d = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    prevMachine = d.machine  || 'unknown';
    prevClosed  = d.closedAt || '(session not closed)';
    prevTask    = d.currentTask || 'New session';
    const prevOs       = d.os || '?';
    const prevTests    = d.testsStatus || '?';
    const prevBuild    = d.buildStatus || '?';
    const prevHash     = (d.lastCommitHash || '').slice(0, 8);
    const prevMsg      = d.lastCommitMessage || '';
    const recentFiles  = (d.recentFiles || '').split('|').filter(Boolean);

    console.log(`  Last machine:  ${prevMachine} (${prevOs})`);
    console.log(`  Session closed:${prevClosed}`);
    console.log(`  Last task:     ${prevTask}`);
    console.log(`  Tests:         ${prevTests}`);
    console.log(`  Build:         ${prevBuild}`);
    console.log(`  Last commit:   ${prevHash} — ${prevMsg}`);
    if (recentFiles.length) {
      console.log('  Recent files:');
      recentFiles.slice(0, 10).forEach(f => console.log(`    • ${f}`));
    }
  } catch (e) {
    console.log(`  (Could not read session: ${e.message})`);
  }
} else {
  console.log('  No previous session found — fresh start.');
}

// ── 5. Health check ──────────────────────────────────────────────────────────
console.log('\n=== Step 5: Health check ===');

// TypeScript
process.stdout.write('  TypeScript:  ');
const backendDir = path.join(ROOT, 'Application', 'backend');
if (fs.existsSync(backendDir)) {
  const tscResult = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: backendDir, encoding: 'utf8', stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  const errCount = ((tscResult.stderr || '') + (tscResult.stdout || ''))
    .split('\n').filter(l => l.includes('error TS')).length;
  console.log(errCount === 0 ? '✅ clean' : `⚠️  ${errCount} errors`);
} else {
  console.log('(backend not found)');
}

// Test count
const backendSrc = path.join(ROOT, 'Application', 'backend', 'src');
const specCount = fs.existsSync(backendSrc)
  ? run(`find "${backendSrc}" -name "*.spec.ts" | wc -l`).trim()
  : '0';
console.log(`  Test files:  ${specCount} spec files found`);

// Recent commits
console.log('  Last 3 commits:');
run('git log --oneline -3').split('\n').forEach(l => console.log(`    ${l}`));

// ── 6. Write new session ─────────────────────────────────────────────────────
console.log('\n=== Step 6: Starting new session ===');

const session = {
  sessionId:          crypto.randomUUID(),
  startedAt:          timestamp,
  machine,
  os:                 osType,
  branch,
  lastCommitHash:     run('git rev-parse HEAD'),
  lastCommitMessage:  run('git log -1 --pretty=%s'),
  currentTask:        prevTask,
  previousMachine:    prevMachine,
  previousClosedAt:   prevClosed,
  testsStatus:        'not checked yet',
  buildStatus:        'not checked yet',
};

fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
console.log('  ✅ New session started');

// ── 7. Summary ───────────────────────────────────────────────────────────────
console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  SESSION STARTED                                             ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log(`║  Machine:    ${`${machine} (${osType})`.padEnd(49)}║`);
console.log(`║  Branch:     ${branch.padEnd(49)}║`);
console.log(`║  Previous:   ${prevMachine.padEnd(49)}║`);
console.log(`║  Last task:  ${prevTask.slice(0, 49).padEnd(49)}║`);
console.log(`║  Time:       ${timestamp.padEnd(49)}║`);
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║  ✅ Ready to work. Run: npm run work:close when done         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');
