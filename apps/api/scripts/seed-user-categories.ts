/**
 * Seed 5 user categories + 4 Travel subcategories into PlatformConsoleDB.
 * Run: npx tsx scripts/seed-user-categories.ts
 */
import { PrismaClient } from '.prisma/platform-console-client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL } },
});

const CATEGORIES = [
  {
    code: 'COMPANY_B2B',
    name: 'Company (B2B)',
    description: 'Business-to-business company (DMC, Manufacturer, Stockist)',
    icon: 'Building2',
    canOfferToB2b: true, canOfferToB2c: true,
    canViewB2bShopping: true, canViewB2cShopping: true,
    canBrowseB2bOffers: true,
    canOfferServicesB2b: false, canOfferServicesB2c: false,
    marketplaceRole: 'SELLER_B2B_B2C', sortOrder: 1,
  },
  {
    code: 'COMPANY_B2C',
    name: 'Company (B2C)',
    description: 'Customer-facing business (Travel Agent, Retail Shop)',
    icon: 'Store',
    canOfferToB2b: false, canOfferToB2c: true,
    canViewB2bShopping: false, canViewB2cShopping: true,
    canBrowseB2bOffers: false,
    canOfferServicesB2b: false, canOfferServicesB2c: false,
    marketplaceRole: 'SELLER_B2C_ONLY', sortOrder: 2,
  },
  {
    code: 'INDIVIDUAL_SP',
    name: 'Individual Service Provider',
    description: 'Solo professional (Tour Guide, Electrician, Consultant)',
    icon: 'User',
    canOfferToB2b: false, canOfferToB2c: false,
    canViewB2bShopping: false, canViewB2cShopping: true,
    canBrowseB2bOffers: false,
    canOfferServicesB2b: true, canOfferServicesB2c: true,
    marketplaceRole: 'SERVICE_PROVIDER_DUAL', sortOrder: 3,
  },
  {
    code: 'CUSTOMER',
    name: 'Customer',
    description: 'End consumer who buys products and services',
    icon: 'ShoppingCart',
    canOfferToB2b: false, canOfferToB2c: false,
    canViewB2bShopping: false, canViewB2cShopping: true,
    canBrowseB2bOffers: false,
    canOfferServicesB2b: false, canOfferServicesB2c: false,
    marketplaceRole: 'BUYER_B2C', sortOrder: 4,
  },
  {
    code: 'EMPLOYEE',
    name: 'Employee',
    description: 'Employee of a registered company or service provider',
    icon: 'Users',
    canOfferToB2b: false, canOfferToB2c: false,
    canViewB2bShopping: false, canViewB2cShopping: false,
    canBrowseB2bOffers: false,
    canOfferServicesB2b: false, canOfferServicesB2c: false,
    marketplaceRole: 'INTERNAL', sortOrder: 5,
  },
];

const TRAVEL_SUBCATEGORIES = [
  {
    categoryCode: 'COMPANY_B2B',
    code: 'DMC_PROVIDER',
    name: 'DMC Provider',
    description: 'Destination Management Company providing tour packages',
    requiresDocumentUpload: true,
    requiredDocuments: ['business_license', 'gst_certificate', 'pan_card'],
    requiresApproval: true,
    sortOrder: 1,
    registrationFields: [
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'license_number', label: 'Tourism License No.', type: 'text', required: true },
      { name: 'gst_number', label: 'GST Number', type: 'text', required: true },
      { name: 'pan_number', label: 'PAN Number', type: 'text', required: true },
      { name: 'tour_types', label: 'Tour Types', type: 'multiselect', options: ['Adventure', 'Cultural', 'Luxury', 'Business', 'Pilgrimage'], required: true },
      { name: 'countries_covered', label: 'Countries Covered', type: 'text', required: true },
      { name: 'contact_person', label: 'Contact Person', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'phone', required: true },
      { name: 'address', label: 'Office Address', type: 'textarea', required: true },
    ],
  },
  {
    categoryCode: 'COMPANY_B2C',
    code: 'AGENT',
    name: 'Travel Agent',
    description: 'Consumer-facing travel booking agency',
    requiresDocumentUpload: true,
    requiredDocuments: ['business_registration'],
    requiresApproval: true,
    sortOrder: 2,
    registrationFields: [
      { name: 'agency_name', label: 'Agency Name', type: 'text', required: true },
      { name: 'gst_number', label: 'GST Number', type: 'text', required: false },
      { name: 'territory', label: 'Service Territory', type: 'text', required: true },
      { name: 'specialization', label: 'Specialization', type: 'multiselect', options: ['Leisure', 'Corporate', 'MICE', 'Pilgrimage', 'Adventure'], required: true },
      { name: 'contact_person', label: 'Contact Person', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'phone', required: true },
      { name: 'address', label: 'Office Address', type: 'textarea', required: true },
    ],
  },
  {
    categoryCode: 'INDIVIDUAL_SP',
    code: 'TOUR_GUIDE',
    name: 'Tour Guide',
    description: 'Individual guide serving B2B clients and direct customers',
    requiresDocumentUpload: true,
    requiredDocuments: ['guide_certification', 'id_proof'],
    requiresApproval: true,
    sortOrder: 3,
    registrationFields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'languages', label: 'Languages Spoken', type: 'multiselect', options: ['English', 'Hindi', 'French', 'Spanish', 'German', 'Japanese', 'Chinese'], required: true },
      { name: 'specializations', label: 'Specializations', type: 'multiselect', options: ['Historical', 'Nature', 'Adventure', 'Food Tours', 'Photography', 'Cultural'], required: true },
      { name: 'certification', label: 'Guide Certification Number', type: 'text', required: true },
      { name: 'experience_years', label: 'Years of Experience', type: 'number', required: true },
      { name: 'phone', label: 'Phone', type: 'phone', required: true },
      { name: 'city', label: 'Base City', type: 'text', required: true },
    ],
  },
  {
    categoryCode: 'CUSTOMER',
    code: 'TRAVELER',
    name: 'Traveler',
    description: 'End customer booking tours and travel experiences',
    requiresDocumentUpload: false,
    requiredDocuments: [],
    requiresApproval: false,
    sortOrder: 4,
    registrationFields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'phone', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'travel_preferences', label: 'Travel Preferences', type: 'multiselect', options: ['Adventure', 'Luxury', 'Budget', 'Family', 'Solo', 'Cultural'], required: false },
    ],
  },
];

async function main() {
  // Seed categories
  console.log('Seeding user categories...');
  for (const cat of CATEGORIES) {
    await (prisma as any).userCategory.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
    console.log(`  ✅ ${cat.code}`);
  }

  // Find TRAVEL vertical
  const travel = await (prisma as any).pc_vertical_v2.findUnique({
    where: { vertical_code: 'TRAVEL' },
  });
  if (!travel) {
    console.error('❌ TRAVEL vertical not found — run seedInitialVerticals first');
    return;
  }

  // Seed Travel subcategories
  console.log('\nSeeding Travel subcategories...');
  for (const sub of TRAVEL_SUBCATEGORIES) {
    const category = await (prisma as any).userCategory.findUnique({
      where: { code: sub.categoryCode },
    });

    await (prisma as any).subcategory.upsert({
      where: { verticalId_code: { verticalId: travel.id, code: sub.code } },
      update: {
        name: sub.name,
        description: sub.description,
        registrationFields: sub.registrationFields,
        requiresDocumentUpload: sub.requiresDocumentUpload,
        requiredDocuments: sub.requiredDocuments,
        requiresApproval: sub.requiresApproval,
        sortOrder: sub.sortOrder,
      },
      create: {
        verticalId: travel.id,
        categoryId: category.id,
        code: sub.code,
        name: sub.name,
        description: sub.description,
        registrationFields: sub.registrationFields,
        requiresDocumentUpload: sub.requiresDocumentUpload,
        requiredDocuments: sub.requiredDocuments,
        requiresApproval: sub.requiresApproval,
        sortOrder: sub.sortOrder,
      },
    });
    console.log(`  ✅ ${sub.code} (${sub.categoryCode})`);
  }

  console.log('\nDone!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
