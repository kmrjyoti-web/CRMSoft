const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Add @default("") to tenantId fields that don't already have @default
// Pattern: tenantId String  @map("tenant_id") but NOT on Subscription/TenantInvoice/TenantUsage (those have @relation to Tenant)
// We need to match lines like:
//   tenantId  String  @map("tenant_id")
// And change to:
//   tenantId  String  @default("") @map("tenant_id")

// Only match tenantId lines that DON'T already have @default and DON'T have a @relation
const regex = /^(\s+tenantId\s+String\s+)(@map\("tenant_id"\))$/gm;
let count = 0;
schema = schema.replace(regex, (match, prefix, mapPart) => {
  count++;
  return `${prefix}@default("") ${mapPart}`;
});

console.log(`Updated ${count} tenantId fields with @default("")`);
fs.writeFileSync(schemaPath, schema);
