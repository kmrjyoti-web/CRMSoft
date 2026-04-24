#!/usr/bin/env node
/**
 * add-try-catch.js
 * Wraps the execute() method body of CQRS handlers with try/catch + Logger.
 * Safe: skips files that already have try-catch.
 * Does NOT change any business logic.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = path.join(__dirname, '../Application/backend/src/modules');
const MODULE_FILTER = process.argv[2]; // optional: filter to single module

// ─── Find handler files ────────────────────────────────────────────────────
function findHandlers(dir) {
  const results = [];
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === 'dist') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (e.name.endsWith('.handler.ts') && !e.name.endsWith('.spec.ts')) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

// ─── Extract class name from file ────────────────────────────────────────
function extractClassName(src) {
  const m = src.match(/export class (\w+Handler)\b/);
  return m ? m[1] : null;
}

// ─── Transform a single handler file ─────────────────────────────────────
function transformHandler(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');

  // Skip if already has try-catch
  if (/\btry\s*\{/.test(src)) return { status: 'skipped', reason: 'already has try-catch' };

  const className = extractClassName(src);
  if (!className) return { status: 'skipped', reason: 'could not extract class name' };

  // ─── 1. Ensure Logger is imported ────────────────────────────────────
  let needsLoggerImport = false;
  if (!src.includes('Logger')) {
    needsLoggerImport = true;
    // Find the first import line and add Logger import after it, or prepend
    if (src.includes("from '@nestjs/common'")) {
      // Add Logger to existing @nestjs/common import
      src = src.replace(
        /import\s*\{([^}]+)\}\s*from\s*'@nestjs\/common'/,
        (match, imports) => {
          const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
          if (!parts.includes('Logger')) parts.push('Logger');
          return `import { ${parts.join(', ')} } from '@nestjs/common'`;
        }
      );
    } else if (src.includes("from '@nestjs/cqrs'")) {
      // Insert a new Logger import line after @nestjs/cqrs import
      src = src.replace(
        /(import\s*\{[^}]+\}\s*from\s*'@nestjs\/cqrs'[^;]*;)/,
        `$1\nimport { Logger } from '@nestjs/common';`
      );
    } else {
      // Prepend
      src = `import { Logger } from '@nestjs/common';\n` + src;
    }
  }

  // ─── 2. Ensure logger property exists in class ────────────────────────
  const hasLoggerProp = /private\s+readonly\s+logger\s*=/.test(src);
  if (!hasLoggerProp) {
    // Insert after class declaration line + opening brace pattern
    // Find "class XxxHandler ... {" and insert logger prop before constructor or first method
    const classBodyPattern = new RegExp(
      `(export class ${className}[^{]*\\{)([\\s\\S]*?)((?:constructor|async execute|@))`
    );
    const classMatch = src.match(classBodyPattern);
    if (classMatch) {
      src = src.replace(
        classBodyPattern,
        `$1$2  private readonly logger = new Logger(${className}.name);\n\n  $3`
      );
    }
  }

  // ─── 3. Wrap execute() body in try/catch ─────────────────────────────
  // Strategy: find "async execute(" → track to its opening { → find matching }
  // then wrap the body
  const lines = src.split('\n');
  let executeLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/async\s+execute\s*\(/.test(lines[i])) {
      executeLineIdx = i;
      break;
    }
  }
  if (executeLineIdx === -1) return { status: 'skipped', reason: 'execute() not found' };

  // Find the opening brace of execute() BODY.
  // Handles return type annotations like ): Promise<{ foo: string }> {
  // Strategy: look for the first line (from executeLineIdx) that ends with '{'
  // after trimming whitespace — that last '{' on that line opens the method body.
  let openBraceLineIdx = -1;
  for (let i = executeLineIdx; i < Math.min(executeLineIdx + 6, lines.length); i++) {
    const trimmed = lines[i].trimEnd();
    if (trimmed.endsWith('{')) {
      openBraceLineIdx = i;
      break;
    }
  }
  if (openBraceLineIdx === -1) return { status: 'error', reason: 'could not find execute() opening {' };

  // Find closing brace: start AFTER openBraceLineIdx with depth=1
  // (the last '{' on openBraceLineIdx opened the method body)
  let depth = 1;
  let closeBraceLineIdx = -1;
  for (let i = openBraceLineIdx + 1; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { closeBraceLineIdx = i; break; }
      }
    }
    if (closeBraceLineIdx !== -1) break;
  }
  if (closeBraceLineIdx === -1) return { status: 'error', reason: 'could not find execute() closing }' };

  // Extract body lines (between opening { and closing })
  // Handle case where opening { is on same line as execute() signature
  const openLine = lines[openBraceLineIdx];
  const openBraceCharIdx = openLine.lastIndexOf('{'); // use lastIndexOf to skip '{' in return types like Promise<{...}>

  let bodyLines;
  let beforeBody;
  let afterBody;

  if (openBraceLineIdx === closeBraceLineIdx) {
    // Single-line execute — rare but handle it
    return { status: 'skipped', reason: 'single-line execute (unlikely)' };
  }

  // Determine base indentation from the execute() line
  const executeIndent = lines[executeLineIdx].match(/^(\s*)/)[1];
  const bodyIndent = executeIndent + '  '; // one extra level

  // Content after opening { on same line (if any non-whitespace)
  const afterOpenBrace = openLine.slice(openBraceCharIdx + 1).trim();

  // Lines between opening { and closing }
  const midLines = lines.slice(openBraceLineIdx + 1, closeBraceLineIdx);

  // Content before closing } on same line (if any non-whitespace)
  const closeLine = lines[closeBraceLineIdx];
  const closeBeforeBrace = closeLine.slice(0, closeLine.lastIndexOf('}')).trim();

  // Build the body content
  let bodyContent = [];
  if (afterOpenBrace) bodyContent.push(bodyIndent + '  ' + afterOpenBrace);
  for (const line of midLines) {
    if (line.trim() === '') bodyContent.push('');
    else bodyContent.push('  ' + line); // add 2 spaces for try block indent
  }
  if (closeBeforeBrace) bodyContent.push(bodyIndent + '  ' + closeBeforeBrace);

  // Remove empty lines at start/end of body
  while (bodyContent.length > 0 && bodyContent[0].trim() === '') bodyContent.shift();
  while (bodyContent.length > 0 && bodyContent[bodyContent.length - 1].trim() === '') bodyContent.pop();

  // Build the new execute body
  const tryBlock = [
    `${bodyIndent}try {`,
    ...bodyContent,
    `${bodyIndent}} catch (error) {`,
    `${bodyIndent}  this.logger.error(\`${className} failed: \${(error as Error).message}\`, (error as Error).stack);`,
    `${bodyIndent}  throw error;`,
    `${bodyIndent}}`,
  ];

  // Reconstruct file
  // Preserve the original close-brace line's indentation + the } itself
  const closeLinePreserved = closeLine.substring(0, closeLine.lastIndexOf('}') + 1);

  const newLines = [
    ...lines.slice(0, openBraceLineIdx),
    openLine.slice(0, openBraceCharIdx + 1), // keep "  async execute(...) {"
    ...tryBlock,
    closeLinePreserved, // keep "  }" with correct indentation
    ...lines.slice(closeBraceLineIdx + 1),
  ];

  const newSrc = newLines.join('\n');

  // Sanity check: new file should be longer
  if (newSrc.length <= src.length) {
    return { status: 'error', reason: 'transformation produced shorter file (logic error)' };
  }

  fs.writeFileSync(filePath, newSrc, 'utf8');
  return { status: 'transformed', className };
}

// ─── Main ─────────────────────────────────────────────────────────────────
const handlers = findHandlers(BASE);
const filtered = MODULE_FILTER
  ? handlers.filter(h => h.includes(`/modules/${MODULE_FILTER}/`))
  : handlers;

console.log(`Found ${filtered.length} handler files${MODULE_FILTER ? ` (module: ${MODULE_FILTER})` : ''}`);

let transformed = 0, skipped = 0, errors = 0;
const errorList = [];

for (const h of filtered) {
  const rel = h.replace(BASE + '/', '');
  const result = transformHandler(h);
  if (result.status === 'transformed') {
    transformed++;
    if (process.env.VERBOSE) console.log(`  ✅ ${rel}`);
  } else if (result.status === 'error') {
    errors++;
    errorList.push(`${rel}: ${result.reason}`);
    console.log(`  ❌ ERROR ${rel}: ${result.reason}`);
  } else {
    skipped++;
    if (process.env.VERBOSE) console.log(`  ⏭  SKIP ${rel}: ${result.reason}`);
  }
}

console.log(`\nDone: ${transformed} transformed, ${skipped} skipped, ${errors} errors`);
if (errorList.length > 0) {
  console.log('\nErrors:');
  errorList.forEach(e => console.log('  ' + e));
}
