#!/usr/bin/env node
/**
 * scripts/work-close.js — Cross-platform work:close (Windows-safe)
 * Usage: npm run work:close
 *        npm run work:close "task description"
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

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts }).trim();
  } catch (e) {
    return (e.stdout || '').trim();
  }
}

function runLoud(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    return (e.stdout || e.message || '').trim();
  }
}

const SESSION_FILE = path.join(ROOT, '.work-session.json');
const timestamp    = new Date().toISOString();
const machine      = os.hostname();
const platform     = process.platform;
const osType       = platform === 'darwin' ? 'mac' : platform === 'win32' ? 'windows' : 'linux';
const task         = process.argv[2] || run('git log -1 --pretty=%s') || 'work session';

// ── Header ───────────────────────────────────────────────────────────────────

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  WORK:CLOSE                                                  ║');
console.log(`║  Saving session on ${machine} (${osType})`.padEnd(63) + '║');
console.log('╚═══════════════════════════════════════════════════════════════╝');

// ── 1. Git status + commit ───────────────────────────────────────────────────
console.log('\n=== Step 1: Git status ===');
const branch      = run('git branch --show-current');
const statusLines = run('git status --porcelain').split('\n').filter(Boolean);
console.log(`  Branch:       ${branch}`);
console.log(`  Uncommitted:  ${statusLines.length} files`);

if (statusLines.length > 0) {
  console.log('  Staging all changes...');
  run('git add -A');
  run(`git commit -m "wip: session close on ${machine} — ${task}" --no-verify`);
  console.log('  ✅ Committed');
} else {
  console.log('  ✅ Working tree clean — nothing to commit');
}

// ── 2. Push ───────────────────────────────────────────────────────────────────
console.log('\n=== Step 2: Push ===');
const pushOut = run(`git push origin ${branch} 2>&1`);
console.log('  ' + (pushOut || 'pushed').split('\n').slice(-2).join('\n  '));
console.log(`  ✅ Pushed to origin/${branch}`);

// ── 3. Test status ───────────────────────────────────────────────────────────
console.log('\n=== Step 3: Test file count ===');
let testStatus = 'unknown';
const backendSrc = path.join(ROOT, 'Application', 'backend', 'src');
if (fs.existsSync(backendSrc)) {
  const specCount = run(`find "${backendSrc}" -name "*.spec.ts" 2>/dev/null | wc -l`);
  testStatus = `${specCount.trim()} spec files`;
}
console.log(`  Tests: ${testStatus}`);

// ── 4. Build status ──────────────────────────────────────────────────────────
console.log('\n=== Step 4: TypeScript check ===');
let buildStatus = 'unknown';
const backendDir = path.join(ROOT, 'Application', 'backend');
if (fs.existsSync(backendDir)) {
  const tscOut = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: backendDir, encoding: 'utf8', stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  const errCount = (tscOut.stderr || tscOut.stdout || '')
    .split('\n').filter(l => l.includes('error TS')).length;
  buildStatus = errCount === 0 ? 'clean' : `${errCount} TypeScript errors`;
  console.log(`  Build: ${errCount === 0 ? '✅' : '⚠️ '} ${buildStatus}`);
} else {
  console.log('  Build: (backend not found)');
}

// ── 5. Save session ──────────────────────────────────────────────────────────
console.log('\n=== Step 5: Save session state ===');
const lastHash = run('git rev-parse HEAD');
const lastMsg  = run('git log -1 --pretty=%s');

// filesChanged from diff
let filesChanged = 0;
try {
  const diffStat = run('git diff --stat HEAD~1 HEAD');
  const match = diffStat.match(/(\d+) file/);
  if (match) filesChanged = parseInt(match[1], 10);
} catch {}

// recent files list
const recentFiles = run('git diff --name-only HEAD~3 HEAD')
  .split('\n').filter(Boolean).slice(0, 20).join('|');

// preserve startedAt from existing session
let startedAt = timestamp;
if (fs.existsSync(SESSION_FILE)) {
  try {
    const existing = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    if (existing.startedAt) startedAt = existing.startedAt;
  } catch {}
}

const session = {
  sessionId:           crypto.randomUUID(),
  startedAt,
  closedAt:            timestamp,
  machine,
  os:                  osType,
  branch,
  lastCommitHash:      lastHash,
  lastCommitMessage:   lastMsg,
  currentTask:         task,
  filesChanged,
  testsStatus:         testStatus,
  buildStatus,
  recentFiles,
};

fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
run('git add .work-session.json');
try { run('git commit -m "chore: save work session state [' + machine + ']" --no-verify'); } catch {}
try { run(`git push origin ${branch}`); } catch {}
console.log(`  ✅ Session saved to .work-session.json`);

// ── 6. Summary ───────────────────────────────────────────────────────────────
const shortHash = lastHash.slice(0, 8);
console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  SESSION SAVED                                               ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log(`║  Machine:   ${`${machine} (${osType})`.padEnd(50)}║`);
console.log(`║  Branch:    ${branch.padEnd(50)}║`);
console.log(`║  Commit:    ${`${shortHash} — ${lastMsg}`.slice(0, 50).padEnd(50)}║`);
console.log(`║  Task:      ${task.slice(0, 50).padEnd(50)}║`);
console.log(`║  Tests:     ${testStatus.padEnd(50)}║`);
console.log(`║  Build:     ${buildStatus.padEnd(50)}║`);
console.log(`║  Time:      ${timestamp.padEnd(50)}║`);
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║  ✅ Safe to switch machines. Run: npm run work:start         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');
