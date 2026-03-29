#!/usr/bin/env ts-node
/**
 * CRM-SOFT Auto-Audit Script
 *
 * Collects key health metrics from the codebase and outputs a Notion-ready
 * JSON report. Can also push directly to a Notion database.
 *
 * Usage:
 *   ts-node scripts/audit/run-audit.ts              # print JSON to stdout
 *   ts-node scripts/audit/run-audit.ts --save       # save to audit-report.json
 *   NOTION_TOKEN=ntn_xxx ts-node scripts/audit/run-audit.ts --push-notion
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(ROOT, 'API');
const UI_DIR = path.join(ROOT, 'UI/crm-admin');

interface AuditSection {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  value: string | number;
  details?: string;
}

interface AuditReport {
  timestamp: string;
  version: string;
  sections: AuditSection[];
  score: number; // 0-100
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function run(cmd: string, cwd: string = ROOT): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err: any) {
    return err.stdout?.trim() ?? err.message ?? 'ERROR';
  }
}

function countMatches(cmd: string, cwd: string = ROOT): number {
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return out ? out.split('\n').filter(Boolean).length : 0;
  } catch {
    return 0;
  }
}

function fileExists(p: string): boolean {
  return fs.existsSync(p);
}

// ─── Audit checks ──────────────────────────────────────────────────────────

function checkGitStatus(): AuditSection {
  const status = run('git status --short');
  const count = status ? status.split('\n').filter(Boolean).length : 0;
  return {
    name: 'Git working tree',
    status: count === 0 ? 'PASS' : 'WARN',
    value: count === 0 ? 'Clean' : `${count} uncommitted changes`,
    details: count > 0 ? status.split('\n').slice(0, 5).join(', ') : undefined,
  };
}

function checkApiTypeErrors(): AuditSection {
  const out = run('npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d " "', API_DIR);
  const count = parseInt(out, 10) || 0;
  return {
    name: 'API TypeScript errors',
    status: count === 0 ? 'PASS' : count < 20 ? 'WARN' : 'FAIL',
    value: count,
    details: count > 0 ? 'Run: cd API && npx tsc --noEmit' : undefined,
  };
}

function checkUiTypeErrors(): AuditSection {
  const out = run('npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d " "', UI_DIR);
  const count = parseInt(out, 10) || 0;
  return {
    name: 'UI TypeScript errors',
    status: count <= 259 ? 'PASS' : 'FAIL',
    value: count,
    details: count > 259 ? `Baseline is 259, found ${count}` : undefined,
  };
}

function checkAnyCount(): AuditSection {
  const count = countMatches(
    'grep -r --include="*.ts" --include="*.tsx" ": any" src/ | grep -v ".spec." | grep -v "// eslint-disable" | wc -l',
    API_DIR,
  );
  return {
    name: 'API `any` type count',
    status: count < 50 ? 'PASS' : count < 150 ? 'WARN' : 'FAIL',
    value: count,
    details: 'Excludes test files and eslint-disable comments',
  };
}

function checkTestCount(): AuditSection {
  const out = run(
    'npx jest --passWithNoTests --ci 2>&1 | grep -E "Tests:" | tail -1',
    API_DIR,
  );
  const passMatch = out.match(/(\d+) passed/);
  const failMatch = out.match(/(\d+) failed/);
  const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  return {
    name: 'API unit tests',
    status: failed === 0 ? 'PASS' : 'FAIL',
    value: `${passed} passed${failed > 0 ? `, ${failed} failed` : ''}`,
    details: failed > 0 ? out : undefined,
  };
}

function checkTestSuiteCount(): AuditSection {
  const out = run(
    'npx jest --passWithNoTests --ci 2>&1 | grep -E "Test Suites:" | tail -1',
    API_DIR,
  );
  const match = out.match(/(\d+) passed/);
  const count = match ? parseInt(match[1], 10) : 0;
  return {
    name: 'API test suites',
    status: 'INFO',
    value: count,
  };
}

function checkCoverageThreshold(): AuditSection {
  const out = run(
    'npx jest --passWithNoTests --ci --coverage --coverageReporters=text-summary 2>&1 | grep "Lines"',
    API_DIR,
  );
  const match = out.match(/([\d.]+)%/);
  const pct = match ? parseFloat(match[1]) : 0;
  return {
    name: 'API line coverage',
    status: pct >= 85 ? 'PASS' : pct >= 70 ? 'WARN' : 'FAIL',
    value: pct > 0 ? `${pct.toFixed(1)}%` : 'unknown',
    details: pct < 85 ? 'Target: 85%' : undefined,
  };
}

function checkCoreUiImports(): AuditSection {
  const leaks = countMatches(
    `grep -r --include="*.tsx" "@coreui/" src/ | grep -v "src/components/ui/" | wc -l`,
    UI_DIR,
  );
  return {
    name: 'CoreUI import leaks (UI)',
    status: leaks === 0 ? 'PASS' : 'FAIL',
    value: leaks === 0 ? 'None' : `${leaks} violations`,
    details: leaks > 0 ? 'Files outside src/components/ui/ import @coreui/*' : undefined,
  };
}

function checkLucideImports(): AuditSection {
  const leaks = countMatches(
    `grep -r --include="*.tsx" "from 'lucide-react'" src/ | grep -v "src/components/ui/Icon.tsx" | wc -l`,
    UI_DIR,
  );
  return {
    name: 'lucide-react import leaks (UI)',
    status: leaks === 0 ? 'PASS' : 'FAIL',
    value: leaks === 0 ? 'None' : `${leaks} violations`,
    details: leaks > 0 ? 'Files other than Icon.tsx import from lucide-react' : undefined,
  };
}

function checkPrismaSchema(): AuditSection {
  const schemaExists = fileExists(path.join(API_DIR, 'prisma/schema.prisma'));
  return {
    name: 'Prisma schema',
    status: schemaExists ? 'PASS' : 'FAIL',
    value: schemaExists ? 'Found' : 'Missing',
  };
}

function checkDockerfile(): AuditSection {
  const apiDockerfile = fileExists(path.join(API_DIR, 'Dockerfile'));
  const uiDockerfile = fileExists(path.join(UI_DIR, 'Dockerfile'));
  const both = apiDockerfile && uiDockerfile;
  return {
    name: 'Dockerfiles',
    status: both ? 'PASS' : 'WARN',
    value: `API: ${apiDockerfile ? '✓' : '✗'}, UI: ${uiDockerfile ? '✓' : '✗'}`,
  };
}

function checkGitHubActions(): AuditSection {
  const workflows = fs.existsSync(path.join(ROOT, '.github/workflows'))
    ? fs.readdirSync(path.join(ROOT, '.github/workflows')).filter(f => f.endsWith('.yml'))
    : [];
  return {
    name: 'GitHub Actions workflows',
    status: workflows.length >= 2 ? 'PASS' : 'WARN',
    value: workflows.join(', ') || 'None',
  };
}

function getVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(API_DIR, 'package.json'), 'utf8'));
    return pkg.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function computeScore(sections: AuditSection[]): number {
  const weights: Record<string, number> = {
    'API TypeScript errors': 20,
    'UI TypeScript errors': 15,
    'API unit tests': 20,
    'API line coverage': 15,
    'CoreUI import leaks (UI)': 10,
    'lucide-react import leaks (UI)': 10,
    'Git working tree': 5,
    'Prisma schema': 5,
  };
  let total = 0;
  let max = 0;
  for (const s of sections) {
    const w = weights[s.name];
    if (!w) continue;
    max += w;
    if (s.status === 'PASS') total += w;
    else if (s.status === 'WARN') total += Math.floor(w * 0.5);
  }
  return max > 0 ? Math.round((total / max) * 100) : 100;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const save = args.includes('--save');
  const pushNotion = args.includes('--push-notion');
  const quick = args.includes('--quick'); // skip slow checks

  console.error('🔍 Running CRM-SOFT auto-audit...');

  const sections: AuditSection[] = [
    checkGitStatus(),
    checkPrismaSchema(),
    checkGitHubActions(),
    checkDockerfile(),
    checkCoreUiImports(),
    checkLucideImports(),
  ];

  if (!quick) {
    console.error('  → Checking TypeScript...');
    sections.push(checkApiTypeErrors());
    sections.push(checkUiTypeErrors());
    sections.push(checkAnyCount());
    console.error('  → Running unit tests...');
    sections.push(checkTestCount());
    sections.push(checkTestSuiteCount());
    sections.push(checkCoverageThreshold());
  }

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    version: getVersion(),
    sections,
    score: computeScore(sections),
  };

  const json = JSON.stringify(report, null, 2);

  if (save) {
    const out = path.join(ROOT, 'audit-report.json');
    fs.writeFileSync(out, json, 'utf8');
    console.error(`✅ Saved to ${out}`);
  }

  if (pushNotion) {
    await pushToNotion(report);
  }

  if (!save && !pushNotion) {
    console.log(json);
  }

  // Summary
  const failed = sections.filter(s => s.status === 'FAIL').length;
  const warned = sections.filter(s => s.status === 'WARN').length;
  console.error(`\n📊 Score: ${report.score}/100 | PASS: ${sections.filter(s => s.status === 'PASS').length} | WARN: ${warned} | FAIL: ${failed}`);

  if (failed > 0) process.exit(1);
}

// ─── Notion push ───────────────────────────────────────────────────────────

async function pushToNotion(report: AuditReport) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_AUDIT_DATABASE_ID;
  if (!token) {
    console.error('⚠️  NOTION_TOKEN not set, skipping Notion push');
    return;
  }

  // Dynamic import to avoid hard dependency
  let Client: any;
  try {
    ({ Client } = require('@notionhq/client'));
  } catch {
    console.error('⚠️  @notionhq/client not installed, skipping Notion push');
    return;
  }

  const notion = new Client({ auth: token });

  // Find or use provided database ID
  let databaseId = dbId;
  if (!databaseId) {
    const search = await notion.search({
      query: 'CRM Audit Reports',
      filter: { property: 'object', value: 'database' },
    });
    databaseId = search.results[0]?.id;
    if (!databaseId) {
      console.error('⚠️  Could not find "CRM Audit Reports" database in Notion');
      return;
    }
  }

  const statusEmoji = (s: 'PASS' | 'WARN' | 'FAIL' | 'INFO') =>
    ({ PASS: '✅', WARN: '⚠️', FAIL: '❌', INFO: 'ℹ️' }[s]);

  const sectionText = report.sections
    .map(s => `${statusEmoji(s.status)} **${s.name}**: ${s.value}${s.details ? ` — ${s.details}` : ''}`)
    .join('\n');

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: `Audit ${report.timestamp.slice(0, 10)} — Score ${report.score}/100` } }] },
      Score: { number: report.score },
      Date: { date: { start: report.timestamp } },
      Version: { rich_text: [{ text: { content: report.version } }] },
      Status: {
        select: {
          name: report.score >= 90 ? 'Healthy' : report.score >= 70 ? 'Warning' : 'Critical',
        },
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: sectionText } }],
        },
      },
    ],
  });

  console.error(`✅ Pushed audit report to Notion (score: ${report.score}/100)`);
}

main().catch(e => {
  console.error('Audit failed:', e.message);
  process.exit(1);
});
