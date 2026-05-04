/**
 * Seed: System Test Groups
 *
 * Seeds 3 predefined cross-module test flows for OPS-3.
 * These groups are "system" groups (isSystem = true) and cannot be deleted.
 *
 * Usage (standalone):
 *   SEED_TENANT_ID=<tenantId> SEED_ADMIN_ID=<userId> npx ts-node prisma/seeds/test-groups.seed.ts
 */
import { PrismaClient as PlatformClient } from '@prisma/platform-client';

const prisma = new PlatformClient();

const SYSTEM_TENANT_ID = process.env.SEED_TENANT_ID ?? 'system';
const ADMIN_ID = process.env.SEED_ADMIN_ID ?? 'system';

const groups = [
  {
    name: 'Invoice Module Testing',
    description: 'End-to-end flow: create contact → create invoice → record payment → verify balance',
    modules: ['payment'],
    estimatedDuration: 30,
    steps: [
      {
        id: 'step-inv-01',
        name: 'Create Contact',
        endpoint: 'POST /api/v1/contacts',
        requestBody: { firstName: 'Test', lastName: 'Customer', email: 'test-invoice@example.com' },
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.id', operator: 'exists' },
        ],
        saveAs: { contactId: 'body.data.id' },
      },
      {
        id: 'step-inv-02',
        name: 'Create Draft Invoice',
        endpoint: 'POST /api/v1/invoices',
        requestBody: {
          contactId: '{{contactId}}',
          items: [{ description: 'Test Service', quantity: 1, unitPrice: 10000, taxPercent: 18 }],
          currency: 'INR',
          dueDate: '2030-12-31',
        },
        dependsOn: ['step-inv-01'],
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.status', operator: 'eq', expected: 'DRAFT' },
          { field: 'body.data.grandTotal', operator: 'gt', expected: 0 },
        ],
        saveAs: { invoiceId: 'body.data.id', invoiceTotal: 'body.data.grandTotal' },
      },
      {
        id: 'step-inv-03',
        name: 'Send Invoice',
        endpoint: 'PATCH /api/v1/invoices/{{invoiceId}}/send',
        dependsOn: ['step-inv-02'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.status', operator: 'eq', expected: 'SENT' },
        ],
      },
      {
        id: 'step-inv-04',
        name: 'Record Payment',
        endpoint: 'POST /api/v1/payments',
        requestBody: {
          invoiceId: '{{invoiceId}}',
          amount: '{{invoiceTotal}}',
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: '2025-01-15',
        },
        dependsOn: ['step-inv-03'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.id', operator: 'exists' },
        ],
        saveAs: { paymentId: 'body.data.id' },
      },
      {
        id: 'step-inv-05',
        name: 'Verify Invoice Paid',
        endpoint: 'GET /api/v1/invoices/{{invoiceId}}',
        dependsOn: ['step-inv-04'],
        assertions: [
          { field: 'status', operator: 'eq', expected: 200 },
          { field: 'body.data.status', operator: 'eq', expected: 'PAID' },
          { field: 'body.data.balanceDue', operator: 'lte', expected: 0 },
        ],
      },
    ],
  },

  {
    name: 'Quotation to Order Flow',
    description: 'Create lead → create quotation → send → accept',
    modules: ['customer', 'payment'],
    estimatedDuration: 25,
    steps: [
      {
        id: 'step-qto-01',
        name: 'Create Lead',
        endpoint: 'POST /api/v1/leads',
        requestBody: {
          firstName: 'QTO',
          lastName: 'TestLead',
          email: 'qto-test@example.com',
          source: 'WEBSITE',
          estimatedValue: 50000,
        },
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.id', operator: 'exists' },
        ],
        saveAs: { leadId: 'body.data.id' },
      },
      {
        id: 'step-qto-02',
        name: 'Create Quotation',
        endpoint: 'POST /api/v1/quotations',
        requestBody: {
          leadId: '{{leadId}}',
          items: [{ description: 'Software License', quantity: 5, unitPrice: 8000, taxPercent: 18 }],
          currency: 'INR',
          validUntil: '2030-12-31',
        },
        dependsOn: ['step-qto-01'],
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.status', operator: 'eq', expected: 'DRAFT' },
        ],
        saveAs: { quotationId: 'body.data.id' },
      },
      {
        id: 'step-qto-03',
        name: 'Send Quotation',
        endpoint: 'PATCH /api/v1/quotations/{{quotationId}}/send',
        dependsOn: ['step-qto-02'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.status', operator: 'eq', expected: 'SENT' },
        ],
      },
      {
        id: 'step-qto-04',
        name: 'Accept Quotation',
        endpoint: 'PATCH /api/v1/quotations/{{quotationId}}/accept',
        dependsOn: ['step-qto-03'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.status', operator: 'eq', expected: 'ACCEPTED' },
        ],
      },
      {
        id: 'step-qto-05',
        name: 'Verify Lead Updated',
        endpoint: 'GET /api/v1/leads/{{leadId}}',
        dependsOn: ['step-qto-04'],
        assertions: [
          { field: 'status', operator: 'eq', expected: 200 },
          { field: 'body.data.id', operator: 'exists' },
        ],
      },
    ],
  },

  {
    name: 'Lead to Customer Journey',
    description: 'Full lifecycle: create raw contact → verify → convert to lead → qualify → close won',
    modules: ['raw-contacts', 'customer'],
    estimatedDuration: 35,
    steps: [
      {
        id: 'step-ltc-01',
        name: 'Create Raw Contact',
        endpoint: 'POST /api/v1/raw-contacts',
        requestBody: {
          firstName: 'Journey',
          lastName: 'TestContact',
          email: 'journey-test@example.com',
          phone: '+91-9999999999',
          source: 'CAMPAIGN',
        },
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.id', operator: 'exists' },
          { field: 'body.data.status', operator: 'eq', expected: 'UNVERIFIED' },
        ],
        saveAs: { rawContactId: 'body.data.id' },
      },
      {
        id: 'step-ltc-02',
        name: 'Verify Raw Contact',
        endpoint: 'PATCH /api/v1/raw-contacts/{{rawContactId}}/verify',
        dependsOn: ['step-ltc-01'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.status', operator: 'eq', expected: 'VERIFIED' },
        ],
      },
      {
        id: 'step-ltc-03',
        name: 'Create Lead from Contact',
        endpoint: 'POST /api/v1/leads',
        requestBody: {
          rawContactId: '{{rawContactId}}',
          firstName: 'Journey',
          lastName: 'TestContact',
          email: 'journey-test@example.com',
          source: 'CAMPAIGN',
          estimatedValue: 75000,
        },
        dependsOn: ['step-ltc-02'],
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.id', operator: 'exists' },
        ],
        saveAs: { leadId: 'body.data.id' },
      },
      {
        id: 'step-ltc-04',
        name: 'Qualify Lead',
        endpoint: 'PATCH /api/v1/leads/{{leadId}}/stage',
        requestBody: { stage: 'QUALIFIED' },
        dependsOn: ['step-ltc-03'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.stage', operator: 'eq', expected: 'QUALIFIED' },
        ],
      },
      {
        id: 'step-ltc-05',
        name: 'Close Lead as Won',
        endpoint: 'PATCH /api/v1/leads/{{leadId}}/stage',
        requestBody: { stage: 'CLOSED_WON' },
        dependsOn: ['step-ltc-04'],
        assertions: [
          { field: 'status', operator: 'in', expected: [200, 201] },
          { field: 'body.data.stage', operator: 'eq', expected: 'CLOSED_WON' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🌱  Seeding system test groups…');

  for (const group of groups) {
    const existing = await prisma.testGroup.findFirst({
      where: { tenantId: SYSTEM_TENANT_ID, name: group.name, isSystem: true },
    });

    if (existing) {
      await prisma.testGroup.update({
        where: { id: existing.id },
        data: {
          description: group.description,
          modules: group.modules,
          steps: group.steps as any,
          estimatedDuration: group.estimatedDuration,
        },
      });
      console.log(`  ✓ Updated: ${group.name}`);
    } else {
      await prisma.testGroup.create({
        data: {
          tenantId: SYSTEM_TENANT_ID,
          name: group.name,
          description: group.description,
          modules: group.modules,
          steps: group.steps as any,
          estimatedDuration: group.estimatedDuration,
          isSystem: true,
          runCount: 0,
          createdById: ADMIN_ID,
        },
      });
      console.log(`  ✓ Created: ${group.name}`);
    }
  }

  console.log('✅  Test group seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
