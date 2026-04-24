/**
 * Adds try-catch + Logger to every handler that lacks it.
 * Safe: only modifies execute() body, never touches imports or class structure incorrectly.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = path.join(__dirname, 'src', 'modules');

function findHandlers(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findHandlers(full));
    } else if (
      e.isFile() &&
      e.name.endsWith('.ts') &&
      !e.name.endsWith('.spec.ts') &&
      full.includes(`${path.sep}handlers${path.sep}`)
    ) {
      results.push(full);
    }
  }
  return results;
}

function processHandler(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');

  // Skip if already has try-catch in execute
  if (/try\s*\{/.test(src)) return { file: filePath, action: 'SKIPPED (has try-catch)' };

  // Must have an execute or handle method
  if (!/async\s+execute\s*\(/.test(src) && !/async\s+handle\s*\(/.test(src)) {
    return { file: filePath, action: 'SKIPPED (no execute/handle method)' };
  }

  let result = src;

  // 1. Add Logger import if missing
  if (!result.includes("from '@nestjs/common'")) {
    // Add after the first import line
    result = result.replace(
      /^(import\s+\{[^}]+\}\s+from\s+'@nestjs\/cqrs';)/m,
      `import { Logger } from '@nestjs/common';\n$1`,
    );
  } else if (!result.includes('Logger') || !result.match(/import\s*\{[^}]*Logger[^}]*\}\s*from\s*'@nestjs\/common'/)) {
    // Logger not in the @nestjs/common import — add it
    result = result.replace(
      /import\s*\{([^}]+)\}\s*from\s*'@nestjs\/common'/,
      (match, imports) => {
        const items = imports.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes('Logger')) items.push('Logger');
        return `import { ${items.join(', ')} } from '@nestjs/common'`;
      },
    );
  }

  // 2. Extract class name for logger context
  const classMatch = result.match(/export\s+class\s+(\w+)/);
  if (!classMatch) return { file: filePath, action: 'SKIPPED (no class found)' };
  const className = classMatch[1];

  // 3. Add logger property after constructor opening line if missing
  if (!result.includes('private readonly logger')) {
    result = result.replace(
      /(export\s+class\s+\w+[^{]*\{)/,
      `$1\n  private readonly logger = new Logger(${className}.name);`,
    );
  }

  // 4. Wrap execute/handle body in try-catch
  // Match: async execute(params) { ... body ... }
  // Strategy: find the method, collect its body, wrap it
  result = result.replace(
    /(async\s+(?:execute|handle)\s*\([^)]*\)[^{]*)\{([\s\S]*?)(\n  \})/,
    (match, signature, body, closing) => {
      // Don't double-wrap
      if (body.includes('try {')) return match;

      const trimmedBody = body.replace(/^\n/, '').replace(/\n$/, '');
      const indentedBody = trimmedBody
        .split('\n')
        .map(line => (line.trim() ? '      ' + line.trimStart() : line))
        .join('\n');

      return `${signature}{
    const traceId = (command as any)?.traceId ?? (query as any)?.traceId ?? crypto.randomUUID();
    try {
${indentedBody}
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        \`[\${traceId}] ${className} failed: \${err.message}\`,
        err.stack,
      );
      throw error;
    }${closing}`;
    },
  );

  // Replace 'command' or 'query' variable in traceId line based on actual param name
  const execMatch = result.match(/async\s+(?:execute|handle)\s*\((\w+):/);
  if (execMatch) {
    const paramName = execMatch[1];
    result = result.replace(
      /\(command as any\)\?\.traceId \?\? \(query as any\)\?\.traceId/,
      `(${paramName} as any)?.traceId`,
    );
  }

  // Add crypto import if not present (Node built-in, no import needed in Node 21+, but for safety)
  // NestJS uses Node 18+ which has global crypto, so no import needed.

  if (result === src) return { file: filePath, action: 'SKIPPED (no change)' };

  fs.writeFileSync(filePath, result, 'utf8');
  return { file: filePath, action: 'UPDATED' };
}

const handlers = findHandlers(BASE);
console.log(`Found ${handlers.length} handler files`);

let updated = 0;
let skipped = 0;
const errors = [];

for (const h of handlers) {
  try {
    const result = processHandler(h);
    if (result.action.startsWith('UPDATED')) {
      updated++;
      console.log(`  ✓ ${path.relative(BASE, result.file)}`);
    } else {
      skipped++;
    }
  } catch (err) {
    errors.push({ file: h, err: err.message });
    console.error(`  ✗ ERROR: ${path.relative(BASE, h)} — ${err.message}`);
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors.length} errors`);
if (errors.length > 0) {
  console.error('\nErrors:');
  errors.forEach(e => console.error(`  ${e.file}: ${e.err}`));
  process.exit(1);
}
