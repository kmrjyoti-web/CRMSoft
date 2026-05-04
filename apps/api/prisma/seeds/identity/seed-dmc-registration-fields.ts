/**
 * seed-dmc-registration-fields.ts
 *
 * Seeds 13 registration fields for combined code B2B_TRAV_TRAVL_DMC
 * into the platform-console DB (pc_registration_field table).
 *
 * Usage:
 *   npx ts-node --transpile-only prisma/seeds/identity/seed-dmc-registration-fields.ts
 */

import { PrismaClient } from '.prisma/platform-console-client';

const pcDb = new PrismaClient({
  datasources: { db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL } },
});

const COMBINED_CODE_ID = '37c8a5cc-ff4c-47d3-8201-1a20046f485c'; // B2B_TRAV_TRAVL_DMC

const FIELDS = [
  {
    fieldKey: 'companyName',
    fieldType: 'text',
    label: 'Company Name',
    placeholder: 'Your travel company name',
    required: true,
    sortOrder: 1,
  },
  {
    fieldKey: 'gstNumber',
    fieldType: 'text',
    label: 'GST Number',
    placeholder: '22AAAAA0000A1Z5',
    required: true,
    sortOrder: 2,
    validation: { pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', message: 'Enter valid 15-digit GSTIN' },
  },
  {
    fieldKey: 'contactPerson',
    fieldType: 'text',
    label: 'Contact Person',
    placeholder: 'Full name of primary contact',
    required: true,
    sortOrder: 3,
  },
  {
    fieldKey: 'designation',
    fieldType: 'text',
    label: 'Designation',
    placeholder: 'e.g. Operations Manager',
    required: false,
    sortOrder: 4,
  },
  {
    fieldKey: 'mobile',
    fieldType: 'phone',
    label: 'Mobile Number',
    placeholder: '+91 98765 43210',
    required: true,
    sortOrder: 5,
  },
  {
    fieldKey: 'businessEmail',
    fieldType: 'email',
    label: 'Business Email',
    placeholder: 'contact@yourcompany.com',
    required: true,
    sortOrder: 6,
  },
  {
    fieldKey: 'address',
    fieldType: 'textarea',
    label: 'Office Address',
    placeholder: 'Street, locality',
    required: true,
    sortOrder: 7,
  },
  {
    fieldKey: 'city',
    fieldType: 'text',
    label: 'City',
    placeholder: 'e.g. Mumbai',
    required: true,
    sortOrder: 8,
  },
  {
    fieldKey: 'state',
    fieldType: 'text',
    label: 'State',
    placeholder: 'e.g. Maharashtra',
    required: true,
    sortOrder: 9,
  },
  {
    fieldKey: 'pincode',
    fieldType: 'text',
    label: 'Pincode',
    placeholder: '400001',
    required: true,
    sortOrder: 10,
    validation: { pattern: '^[1-9][0-9]{5}$', message: 'Enter valid 6-digit pincode' },
  },
  {
    fieldKey: 'specializations',
    fieldType: 'multiselect',
    label: 'Specializations',
    placeholder: null,
    required: false,
    sortOrder: 11,
    options: [
      { value: 'domestic', label: 'Domestic Travel' },
      { value: 'international', label: 'International Travel' },
      { value: 'corporate', label: 'Corporate Travel' },
      { value: 'leisure', label: 'Leisure / Holidays' },
      { value: 'mice', label: 'MICE' },
      { value: 'adventure', label: 'Adventure Tours' },
      { value: 'pilgrimage', label: 'Pilgrimage' },
    ],
  },
  {
    fieldKey: 'yearsInBusiness',
    fieldType: 'number',
    label: 'Years in Business',
    placeholder: '5',
    required: false,
    sortOrder: 12,
  },
  {
    fieldKey: 'website',
    fieldType: 'text',
    label: 'Website (optional)',
    placeholder: 'https://yourcompany.com',
    required: false,
    sortOrder: 13,
  },
];

async function main() {
  console.log('Seeding registration fields for B2B_TRAV_TRAVL_DMC...');

  let inserted = 0;
  let skipped = 0;

  for (const f of FIELDS) {
    const exists = await pcDb.pcRegistrationField.findFirst({
      where: { combinedCodeId: COMBINED_CODE_ID, fieldKey: f.fieldKey },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await pcDb.pcRegistrationField.create({
      data: {
        combinedCodeId: COMBINED_CODE_ID,
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        label: f.label,
        placeholder: f.placeholder ?? null,
        required: f.required,
        options: (f as any).options ? JSON.stringify((f as any).options) : null,
        validation: (f as any).validation ? JSON.stringify((f as any).validation) : null,
        sortOrder: f.sortOrder,
        isActive: true,
        translations: '{}',
      } as any,
    });
    inserted++;
  }

  console.log(`✅ Inserted ${inserted}, skipped ${skipped} (already existed)`);
}

main().catch(console.error).finally(() => pcDb.$disconnect());
