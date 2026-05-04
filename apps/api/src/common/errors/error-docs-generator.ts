import { ERROR_CODES, TOTAL_ERROR_CODES } from './error-codes';

/**
 * Auto-generates a markdown error reference document from ERROR_CODES.
 * Run: npx ts-node src/common/errors/error-docs-generator.ts
 */
export function generateErrorReference(): string {
  const lines: string[] = [];

  lines.push('# CRM API — Error Code Reference');
  lines.push('');
  lines.push(`> Auto-generated. Total error codes: **${TOTAL_ERROR_CODES}**`);
  lines.push('');
  lines.push('## Error Response Format');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "success": false,');
  lines.push('  "statusCode": 404,');
  lines.push('  "message": "Lead does not exist",');
  lines.push('  "error": {');
  lines.push('    "code": "LEAD_NOT_FOUND",');
  lines.push('    "message": "Lead does not exist",');
  lines.push('    "details": null,');
  lines.push('    "suggestion": "Verify the lead ID. Use GET /leads to list all leads.",');
  lines.push('    "documentationUrl": "/docs/errors#LEAD_NOT_FOUND"');
  lines.push('  },');
  lines.push('  "timestamp": "2026-02-27T10:30:00.000Z",');
  lines.push('  "path": "/api/v1/leads/xyz",');
  lines.push('  "requestId": "req_abc123def456"');
  lines.push('}');
  lines.push('```');
  lines.push('');

  // Group codes by category
  const categories: Record<string, typeof ERROR_CODES[string][]> = {};
  for (const def of Object.values(ERROR_CODES)) {
    const prefix = def.code.split('_').slice(0, -1).join('_') || 'GENERIC';
    let category: string;

    if (['INTERNAL', 'VALIDATION', 'NOT', 'DUPLICATE', 'INVALID', 'OPERATION', 'RATE', 'SERVICE'].includes(prefix.split('_')[0])) {
      category = 'Generic';
    } else if (prefix.startsWith('AUTH') || prefix === 'FORBIDDEN' || prefix.startsWith('PERMISSION') || prefix.startsWith('ROLE_INSUFFICIENT')) {
      category = 'Auth & Access';
    } else if (prefix.startsWith('TENANT') || prefix.startsWith('PLAN') || prefix.startsWith('FEATURE') || prefix.startsWith('SUBSCRIPTION')) {
      category = 'Tenant & Subscription';
    } else if (prefix.startsWith('LEAD')) {
      category = 'Lead';
    } else if (prefix.startsWith('CONTACT')) {
      category = 'Contact';
    } else if (prefix.startsWith('ORGANIZATION')) {
      category = 'Organization';
    } else if (prefix.startsWith('QUOTATION')) {
      category = 'Quotation';
    } else if (prefix.startsWith('PRODUCT')) {
      category = 'Product';
    } else if (prefix.startsWith('EMAIL')) {
      category = 'Email';
    } else if (prefix.startsWith('WHATSAPP')) {
      category = 'WhatsApp';
    } else if (prefix.startsWith('DOCUMENT')) {
      category = 'Document';
    } else if (prefix.startsWith('IMPORT') || prefix.startsWith('EXPORT')) {
      category = 'Import / Export';
    } else if (prefix.startsWith('WORKFLOW')) {
      category = 'Workflow';
    } else if (prefix.startsWith('CONFIG') || prefix.startsWith('CREDENTIAL') || prefix.startsWith('ENCRYPTION')) {
      category = 'Config & Credentials';
    } else if (prefix.startsWith('CRON')) {
      category = 'Cron Jobs';
    } else if (prefix.startsWith('SYNC')) {
      category = 'Offline Sync';
    } else if (prefix.startsWith('REPORT')) {
      category = 'Reports';
    } else {
      category = 'UNCATEGORIZED_ERROR';
    }

    if (!categories[category]) categories[category] = [];
    categories[category].push(def);
  }

  lines.push('## Error Codes by Category');
  lines.push('');

  for (const [category, codes] of Object.entries(categories)) {
    lines.push(`### ${category}`);
    lines.push('');
    lines.push('| Code | HTTP | Message | Suggestion |');
    lines.push('|------|------|---------|------------|');

    for (const def of codes) {
      const msg = def.message.replace(/\|/g, '\\|');
      const sug = def.suggestion.replace(/\|/g, '\\|');
      lines.push(`| \`${def.code}\` | ${def.httpStatus} | ${msg} | ${sug} |`);
    }
    lines.push('');
  }

  lines.push('## Usage Examples');
  lines.push('');
  lines.push('### Throwing Errors in Services');
  lines.push('');
  lines.push('```typescript');
  lines.push("import { AppError } from '../common/errors';");
  lines.push('');
  lines.push("// Simple error");
  lines.push("throw AppError.from('LEAD_NOT_FOUND');");
  lines.push('');
  lines.push("// With interpolation");
  lines.push("throw AppError.from('PLAN_LIMIT_REACHED', { current: 500, limit: 500 });");
  lines.push('');
  lines.push("// With details");
  lines.push("throw AppError.from('VALIDATION_ERROR').withDetails([");
  lines.push("  { field: 'email', message: 'must be a valid email' },");
  lines.push("]);");
  lines.push('```');
  lines.push('');
  lines.push('### Handling Errors in Frontend');
  lines.push('');
  lines.push('```typescript');
  lines.push('const response = await fetch("/api/v1/leads/xyz");');
  lines.push('const body = await response.json();');
  lines.push('');
  lines.push('if (!body.success) {');
  lines.push('  console.error(`Error ${body.error.code}: ${body.error.message}`);');
  lines.push('  console.log(`Fix: ${body.error.suggestion}`);');
  lines.push('  if (body.error.details) {');
  lines.push('    // Handle field-level validation errors');
  lines.push('    body.error.details.forEach(d => console.log(`${d.field}: ${d.message}`));');
  lines.push('  }');
  lines.push('}');
  lines.push('```');

  return lines.join('\n');
}

// Allow running as script
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const doc = generateErrorReference();
  const outPath = path.resolve(__dirname, '../../../docs/ERROR_REFERENCE.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, doc, 'utf-8');
  console.log(`Error reference generated at: ${outPath}`);
  console.log(`Total error codes: ${TOTAL_ERROR_CODES}`);
}
