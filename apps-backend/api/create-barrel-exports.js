#!/usr/bin/env node
/**
 * Creates index.ts barrel exports for all modules missing them.
 * Usage: node create-barrel-exports.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src/modules');

// Convert kebab-case to PascalCase
function toPascal(str) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
}

// Convert a NestJS file name to its exported class name
// e.g. "lead.entity.ts" -> "LeadEntity"
// e.g. "audit-cleanup.service.ts" -> "AuditCleanupService"
// e.g. "create-lead.command.ts" -> "CreateLeadCommand"
function fileToClassName(filename) {
  // Known suffixes to map
  const suffixes = [
    '.entity', '.service', '.command', '.query', '.handler',
    '.module', '.controller', '.guard', '.decorator', '.dto',
    '.interface', '.repository', '.event',
  ];
  let base = filename.replace(/\.ts$/, '');
  let suffix = '';
  for (const s of suffixes) {
    if (base.endsWith(s)) {
      suffix = toPascal(s.slice(1)); // e.g. "Entity", "Service"
      base = base.slice(0, base.length - s.length);
      break;
    }
  }
  return toPascal(base) + suffix;
}

// Convert filename to ERROR token: "activity-errors.ts" -> "ACTIVITY_ERRORS"
function fileToErrorToken(filename) {
  return filename.replace(/\.ts$/, '').toUpperCase().replace(/-/g, '_');
}

// Convert interface filename to interface class and token
// "lead-repository.interface.ts" -> { cls: "ILeadRepository", token: "I_LEAD_REPOSITORY" }
function interfaceFileToExport(filename) {
  const base = filename.replace(/\.ts$/, '').replace(/\.interface$/, '');
  const cls = 'I' + toPascal(base);
  const token = 'I_' + base.toUpperCase().replace(/-/g, '_');
  return { cls, token };
}

function safeReadDir(dirPath) {
  try {
    return fs.readdirSync(dirPath).filter(f => {
      try { return fs.statSync(path.join(dirPath, f)).isFile(); } catch { return false; }
    });
  } catch {
    return [];
  }
}

function dirExists(dirPath) {
  try { return fs.statSync(dirPath).isDirectory(); } catch { return false; }
}

function fileExists(filePath) {
  try { return fs.statSync(filePath).isFile(); } catch { return false; }
}

function generateBarrel(modulePath) {
  const moduleName = path.basename(modulePath);
  const modulePascal = toPascal(moduleName);
  const lines = [];

  // 1. Module export
  if (fileExists(path.join(modulePath, `${moduleName}.module.ts`))) {
    lines.push(`export { ${modulePascal}Module } from './${moduleName}.module';`);
  }

  // 2. Services
  const servicesDir = path.join(modulePath, 'services');
  if (dirExists(servicesDir)) {
    const services = safeReadDir(servicesDir).filter(f => f.endsWith('.service.ts'));
    for (const svc of services) {
      const cls = fileToClassName(svc);
      lines.push(`export { ${cls} } from './services/${svc.replace('.ts', '')}';`);
    }
  }

  // 3. Domain entities
  const entitiesDir = path.join(modulePath, 'domain/entities');
  if (dirExists(entitiesDir)) {
    const entities = safeReadDir(entitiesDir).filter(f => f.endsWith('.entity.ts'));
    for (const entity of entities) {
      const cls = fileToClassName(entity);
      lines.push(`export { ${cls} } from './domain/entities/${entity.replace('.ts', '')}';`);
    }
  }

  // 4. Domain errors
  const errorsDir = path.join(modulePath, 'domain/errors');
  if (dirExists(errorsDir)) {
    const errorFiles = safeReadDir(errorsDir).filter(f => f.endsWith('.ts'));
    for (const ef of errorFiles) {
      const token = fileToErrorToken(ef);
      lines.push(`export { ${token} } from './domain/errors/${ef.replace('.ts', '')}';`);
    }
  }

  // 5. Domain interfaces
  const ifacesDir = path.join(modulePath, 'domain/interfaces');
  if (dirExists(ifacesDir)) {
    const ifaces = safeReadDir(ifacesDir).filter(f => f.endsWith('.interface.ts'));
    for (const iface of ifaces) {
      const { cls, token } = interfaceFileToExport(iface);
      lines.push(`export { ${cls}, ${token} } from './domain/interfaces/${iface.replace('.ts', '')}';`);
    }
  }

  // 6. Application commands
  const commandsDir = path.join(modulePath, 'application/commands');
  if (dirExists(commandsDir)) {
    const commands = safeReadDir(commandsDir).filter(f => f.endsWith('.command.ts'));
    for (const cmd of commands) {
      const cls = fileToClassName(cmd);
      lines.push(`export { ${cls} } from './application/commands/${cmd.replace('.ts', '')}';`);
    }
  }

  // 7. Application queries
  const queriesDir = path.join(modulePath, 'application/queries');
  if (dirExists(queriesDir)) {
    const queries = safeReadDir(queriesDir).filter(f => f.endsWith('.query.ts'));
    for (const q of queries) {
      const cls = fileToClassName(q);
      lines.push(`export { ${cls} } from './application/queries/${q.replace('.ts', '')}';`);
    }
  }

  if (lines.length === 0) {
    lines.push(`export { ${modulePascal}Module } from './${moduleName}.module';`);
  }

  return lines.join('\n') + '\n';
}

// All module paths (relative to BASE) — always regenerate
const modules = [
  'core/dev-logs',
  'core/identity/audit',
  'core/identity/entity-filters',
  'core/identity/menus',
  'core/identity/settings',
  'core/identity/tenant',
  'core/platform/lookups',
  'core/work/custom-fields',
  'core/work/notifications',
  'customer/activities',
  'customer/approval-requests',
  'customer/bulk-import',
  'customer/comments',
  'customer/communications',
  'customer/contact-organizations',
  'customer/contacts',
  'customer/dashboard',
  'customer/demos',
  'customer/documents',
  'customer/email',
  'customer/follow-ups',
  'customer/invitations',
  'customer/leads',
  'customer/organization-directory',
  'customer/organizations',
  'customer/ownership',
  'customer/performance',
  'customer/price-lists',
  'customer/product-pricing',
  'customer/products',
  'customer/quotations',
  'customer/raw-contacts',
  'customer/recurrence',
  'customer/reminders',
  'customer/saved-filters',
  'customer/subscriptions',
  'customer/tasks',
  'customer/tour-plans',
  'customer/whatsapp',
  'customer-portal',
  'marketplace/analytics',
  'marketplace/enquiries',
  'marketplace/feed',
  'marketplace/listings',
  'marketplace/offers',
  'marketplace/requirements',
  'marketplace/reviews',
  'ops/manual-testing',
  'ops/scheduled-test',
  'ops/test-environment',
  'ops/test-groups',
  'ops/test-runner',
  'softwarevendor/workflows',
];

let created = 0;
let notFound = 0;

for (const rel of modules) {
  const modulePath = path.join(BASE, rel);
  const indexPath = path.join(modulePath, 'index.ts');

  if (!dirExists(modulePath)) {
    console.log(`NOT FOUND: ${rel}`);
    notFound++;
    continue;
  }

  const content = generateBarrel(modulePath);
  fs.writeFileSync(indexPath, content, 'utf-8');
  console.log(`WROTE: ${rel}/index.ts`);
  created++;
}

console.log(`\nDone. Wrote: ${created}, Not found: ${notFound}`);
