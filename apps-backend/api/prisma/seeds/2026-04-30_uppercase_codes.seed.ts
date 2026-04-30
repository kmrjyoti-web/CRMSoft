import { PrismaClient } from '@prisma/client';

/**
 * Golden Rule #15 — one-time migration.
 * Converts all lowercase/kebab-case system codes to UPPER_SNAKE_CASE in live DB data.
 * Safe to re-run: updateMany with a specific where clause is idempotent.
 */
export async function migrateUppercaseCodes(prisma: PrismaClient): Promise<void> {
  console.log('--- Migrating system codes to UPPER_SNAKE_CASE ---');

  // ── Document Templates ─────────────────────────────────────────────

  const templateCodeMap: Record<string, string> = {
    'gst-invoice-standard':    'GST_INVOICE_STANDARD',
    'gst-invoice-modern':      'GST_INVOICE_MODERN',
    'restaurant-bill':         'RESTAURANT_BILL',
    'quotation-standard':      'QUOTATION_STANDARD',
    'quotation-detailed':      'QUOTATION_DETAILED',
    'tourism-itinerary-quote': 'TOURISM_ITINERARY_QUOTE',
    'payment-receipt':         'PAYMENT_RECEIPT',
    'purchase-order-standard': 'PURCHASE_ORDER_STANDARD',
    'delivery-challan':        'DELIVERY_CHALLAN',
    'sale-challan':            'SALE_CHALLAN',
    'credit-note':             'CREDIT_NOTE',
    'sales-report':            'SALES_REPORT',
    'customer-statement':      'CUSTOMER_STATEMENT',
  };

  let templateCount = 0;
  for (const [oldCode, newCode] of Object.entries(templateCodeMap)) {
    const result = await (prisma as any).documentTemplate.updateMany({
      where: { code: oldCode },
      data: { code: newCode },
    });
    if (result.count > 0) {
      console.log(`  documentTemplate: '${oldCode}' → '${newCode}' (${result.count} row(s))`);
      templateCount += result.count;
    }
  }
  console.log(`  Total document template rows migrated: ${templateCount}`);

  // ── Module Definitions ─────────────────────────────────────────────

  const moduleCodeMap: Record<string, string> = {
    contacts:    'CONTACTS',
    leads:       'LEADS',
    products:    'PRODUCTS',
    quotations:  'QUOTATIONS',
    invoices:    'INVOICES',
    payments:    'PAYMENTS',
    whatsapp:    'WHATSAPP',
    tasks:       'TASKS',
    reports:     'REPORTS',
    inventory:   'INVENTORY',
    marketplace: 'MARKETPLACE',
  };

  let moduleCount = 0;
  for (const [oldCode, newCode] of Object.entries(moduleCodeMap)) {
    const result = await (prisma as any).moduleDefinition.updateMany({
      where: { code: oldCode },
      data: { code: newCode },
    });
    if (result.count > 0) {
      console.log(`  moduleDefinition: '${oldCode}' → '${newCode}' (${result.count} row(s))`);
      moduleCount += result.count;
    }
  }
  console.log(`  Total module definition rows migrated: ${moduleCount}`);

  // ── Subscription Packages ──────────────────────────────────────────

  const packageCodeMap: Record<string, string> = {
    free:         'FREE',
    starter:      'STARTER',
    professional: 'PROFESSIONAL',
    enterprise:   'ENTERPRISE',
  };

  let packageCount = 0;
  for (const [oldCode, newCode] of Object.entries(packageCodeMap)) {
    const result = await (prisma as any).subscriptionPackage.updateMany({
      where: { packageCode: oldCode },
      data: { packageCode: newCode },
    });
    if (result.count > 0) {
      console.log(`  subscriptionPackage: '${oldCode}' → '${newCode}' (${result.count} row(s))`);
      packageCount += result.count;
    }
  }
  console.log(`  Total subscription package rows migrated: ${packageCount}`);

  // ── Tenant planCode ────────────────────────────────────────────────
  // Tenants store planCode — update any that still carry lowercase values.

  let tenantCount = 0;
  for (const [oldCode, newCode] of Object.entries(packageCodeMap)) {
    const result = await (prisma as any).tenant.updateMany({
      where: { planCode: oldCode },
      data: { planCode: newCode },
    });
    if (result.count > 0) {
      console.log(`  tenant.planCode: '${oldCode}' → '${newCode}' (${result.count} row(s))`);
      tenantCount += result.count;
    }
  }
  console.log(`  Total tenant planCode rows migrated: ${tenantCount}`);

  console.log('--- UPPER_SNAKE_CASE migration complete ---');
}
