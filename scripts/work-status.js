#!/usr/bin/env node
/**
 * scripts/work-status.js — Cross-platform work:status (Windows-safe)
 * Read-only — changes nothing.
 * Usage: npm run work:status
 */
'use strict';

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8', stdio: 'pipe',
      shell: process.platform === 'win32',
    }).trim();
  } catch (e) {
    return (e.stdout || '').trim();
  }
}

const SESSION_FILE = path.join(ROOT, '.work-session.json');

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  WORK:STATUS                                                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');

// ── Machine ───────────────────────────────────────────────────────────────────
console.log('');
console.log(`  Machine:     ${os.hostname()} (${process.platform})`);
console.log(`  Branch:      ${run('git branch --show-current')}`);
console.log(`  Commit:      ${run('git rev-parse --short HEAD')} — ${run('git log -1 --pretty=%s')}`);
const dirty = run('git status --porcelain').split('\n').filter(Boolean).length;
console.log(`  Uncommitted: ${dirty} files`);

// Unpushed commits
const unpushed = run('git log --oneline @{u}..HEAD 2>/dev/null || echo ""')
  .split('\n').filter(Boolean);
if (unpushed.length > 0) {
  console.log(`\n  ⚠️  ${unpushed.length} commit(s) not pushed:`);
  unpushed.forEach(l => console.log(`    ${l}`));
}

// ── Session file ──────────────────────────────────────────────────────────────
console.log('');
if (fs.existsSync(SESSION_FILE)) {
  try {
    const d = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    console.log('  Session file: .work-session.json');
    console.log(`    Session ID:   ${(d.sessionId || '?').slice(0, 12)}...`);
    console.log(`    Started:      ${d.startedAt || '?'}`);
    console.log(`    Closed:       ${d.closedAt  || '(still open)'}`);
    console.log(`    Machine:      ${d.machine || '?'} (${d.os || '?'})`);
    console.log(`    Task:         ${d.currentTask || '?'}`);
    console.log(`    Tests:        ${d.testsStatus || '?'}`);
    console.log(`    Build:        ${d.buildStatus || '?'}`);
    console.log(`    Prev machine: ${d.previousMachine || 'none'}`);
  } catch (e) {
    console.log(`  Session file: error reading — ${e.message}`);
  }
} else {
  console.log('  Session file: not found');
}

// ── Project stats ─────────────────────────────────────────────────────────────
console.log('');
console.log('  Project:');
const backendMods = path.join(ROOT, 'Application', 'backend', 'src', 'modules');
if (fs.existsSync(backendMods)) {
  const modCount = run(`find "${backendMods}" -maxdepth 2 -name "*.module.ts" | wc -l`).trim();
  const specCount = run(`find "${path.join(ROOT,'Application','backend','src')}" -name "*.spec.ts" | wc -l`).trim();
  console.log(`    NestJS modules: ${modCount}`);
  console.log(`    Spec files:     ${specCount}`);
}

// ── Git log ───────────────────────────────────────────────────────────────────
console.log('');
console.log('  Last 5 commits:');
run('git log --oneline -5').split('\n').forEach(l => console.log(`    ${l}`));
console.log('');
