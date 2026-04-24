/**
 * GlobalReferenceDB seed — ISO countries, Indian states/UTs, major cities, system lookups
 * Idempotent: safe to run multiple times (upsert by unique key)
 *
 * Usage: pnpm seed:global-reference
 */
import { PrismaClient } from '.prisma/global-reference-client';

const prisma = new PrismaClient();

// ─── ISO Countries (India focus + common trading partners) ─────────
const COUNTRIES = [
  { code: 'IN', code3: 'IND', name: 'India', nameLocal: 'भारत', phoneCode: '+91', currencyCode: 'INR', sortOrder: 1 },
  { code: 'US', code3: 'USA', name: 'United States', phoneCode: '+1', currencyCode: 'USD', sortOrder: 2 },
  { code: 'GB', code3: 'GBR', name: 'United Kingdom', phoneCode: '+44', currencyCode: 'GBP', sortOrder: 3 },
  { code: 'AE', code3: 'ARE', name: 'United Arab Emirates', phoneCode: '+971', currencyCode: 'AED', sortOrder: 4 },
  { code: 'SG', code3: 'SGP', name: 'Singapore', phoneCode: '+65', currencyCode: 'SGD', sortOrder: 5 },
  { code: 'AU', code3: 'AUS', name: 'Australia', phoneCode: '+61', currencyCode: 'AUD', sortOrder: 6 },
  { code: 'CA', code3: 'CAN', name: 'Canada', phoneCode: '+1', currencyCode: 'CAD', sortOrder: 7 },
  { code: 'DE', code3: 'DEU', name: 'Germany', phoneCode: '+49', currencyCode: 'EUR', sortOrder: 8 },
  { code: 'JP', code3: 'JPN', name: 'Japan', phoneCode: '+81', currencyCode: 'JPY', sortOrder: 9 },
  { code: 'CN', code3: 'CHN', name: 'China', phoneCode: '+86', currencyCode: 'CNY', sortOrder: 10 },
];

// ─── Indian States + UTs (36 total) with GST codes ────────────────
const INDIAN_STATES = [
  { code: 'AP', name: 'Andhra Pradesh', nameLocal: 'आंध्र प्रदेश', gstStateCode: '37' },
  { code: 'AR', name: 'Arunachal Pradesh', nameLocal: 'अरुणाचल प्रदेश', gstStateCode: '12' },
  { code: 'AS', name: 'Assam', nameLocal: 'असम', gstStateCode: '18' },
  { code: 'BR', name: 'Bihar', nameLocal: 'बिहार', gstStateCode: '10' },
  { code: 'CT', name: 'Chhattisgarh', nameLocal: 'छत्तीसगढ़', gstStateCode: '22' },
  { code: 'GA', name: 'Goa', nameLocal: 'गोवा', gstStateCode: '30' },
  { code: 'GJ', name: 'Gujarat', nameLocal: 'गुजरात', gstStateCode: '24' },
  { code: 'HR', name: 'Haryana', nameLocal: 'हरियाणा', gstStateCode: '06' },
  { code: 'HP', name: 'Himachal Pradesh', nameLocal: 'हिमाचल प्रदेश', gstStateCode: '02' },
  { code: 'JH', name: 'Jharkhand', nameLocal: 'झारखंड', gstStateCode: '20' },
  { code: 'KA', name: 'Karnataka', nameLocal: 'कर्नाटक', gstStateCode: '29' },
  { code: 'KL', name: 'Kerala', nameLocal: 'केरल', gstStateCode: '32' },
  { code: 'MP', name: 'Madhya Pradesh', nameLocal: 'मध्य प्रदेश', gstStateCode: '23' },
  { code: 'MH', name: 'Maharashtra', nameLocal: 'महाराष्ट्र', gstStateCode: '27' },
  { code: 'MN', name: 'Manipur', nameLocal: 'मणिपुर', gstStateCode: '14' },
  { code: 'ML', name: 'Meghalaya', nameLocal: 'मेघालय', gstStateCode: '17' },
  { code: 'MZ', name: 'Mizoram', nameLocal: 'मिजोरम', gstStateCode: '15' },
  { code: 'NL', name: 'Nagaland', nameLocal: 'नागालैंड', gstStateCode: '13' },
  { code: 'OR', name: 'Odisha', nameLocal: 'ओडिशा', gstStateCode: '21' },
  { code: 'PB', name: 'Punjab', nameLocal: 'पंजाब', gstStateCode: '03' },
  { code: 'RJ', name: 'Rajasthan', nameLocal: 'राजस्थान', gstStateCode: '08' },
  { code: 'SK', name: 'Sikkim', nameLocal: 'सिक्किम', gstStateCode: '11' },
  { code: 'TN', name: 'Tamil Nadu', nameLocal: 'तमिल नाडु', gstStateCode: '33' },
  { code: 'TG', name: 'Telangana', nameLocal: 'तेलंगाना', gstStateCode: '36' },
  { code: 'TR', name: 'Tripura', nameLocal: 'त्रिपुरा', gstStateCode: '16' },
  { code: 'UP', name: 'Uttar Pradesh', nameLocal: 'उत्तर प्रदेश', gstStateCode: '09' },
  { code: 'UK', name: 'Uttarakhand', nameLocal: 'उत्तराखंड', gstStateCode: '05' },
  { code: 'WB', name: 'West Bengal', nameLocal: 'पश्चिम बंगाल', gstStateCode: '19' },
  // Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', gstStateCode: '35' },
  { code: 'CH', name: 'Chandigarh', gstStateCode: '04' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', gstStateCode: '26' },
  { code: 'DL', name: 'Delhi', nameLocal: 'दिल्ली', gstStateCode: '07' },
  { code: 'JK', name: 'Jammu and Kashmir', nameLocal: 'जम्मू और कश्मीर', gstStateCode: '01' },
  { code: 'LA', name: 'Ladakh', nameLocal: 'लद्दाख', gstStateCode: '38' },
  { code: 'LD', name: 'Lakshadweep', gstStateCode: '31' },
  { code: 'PY', name: 'Puducherry', gstStateCode: '34' },
];

// ─── Major Indian cities (Tier 1 + key Tier 2) ────────────────────
const INDIAN_CITIES: Record<string, { name: string; nameLocal?: string; tier: string }[]> = {
  MH: [
    { name: 'Mumbai', nameLocal: 'मुंबई', tier: 'TIER_1' },
    { name: 'Pune', nameLocal: 'पुणे', tier: 'TIER_1' },
    { name: 'Nagpur', nameLocal: 'नागपुर', tier: 'TIER_2' },
    { name: 'Nashik', tier: 'TIER_2' },
    { name: 'Aurangabad', tier: 'TIER_2' },
  ],
  DL: [{ name: 'New Delhi', nameLocal: 'नई दिल्ली', tier: 'TIER_1' }],
  KA: [
    { name: 'Bengaluru', nameLocal: 'बेंगलुरु', tier: 'TIER_1' },
    { name: 'Mysuru', tier: 'TIER_2' },
  ],
  TN: [
    { name: 'Chennai', nameLocal: 'चेन्नई', tier: 'TIER_1' },
    { name: 'Coimbatore', tier: 'TIER_2' },
  ],
  TG: [{ name: 'Hyderabad', nameLocal: 'हैदराबाद', tier: 'TIER_1' }],
  WB: [{ name: 'Kolkata', nameLocal: 'कोलकाता', tier: 'TIER_1' }],
  GJ: [
    { name: 'Ahmedabad', nameLocal: 'अहमदाबाद', tier: 'TIER_1' },
    { name: 'Surat', tier: 'TIER_2' },
    { name: 'Vadodara', tier: 'TIER_2' },
    { name: 'Rajkot', tier: 'TIER_2' },
  ],
  RJ: [{ name: 'Jaipur', nameLocal: 'जयपुर', tier: 'TIER_1' }, { name: 'Jodhpur', tier: 'TIER_2' }],
  UP: [
    { name: 'Lucknow', nameLocal: 'लखनऊ', tier: 'TIER_1' },
    { name: 'Noida', tier: 'TIER_2' },
    { name: 'Kanpur', tier: 'TIER_2' },
    { name: 'Agra', tier: 'TIER_2' },
    { name: 'Varanasi', tier: 'TIER_2' },
  ],
  PB: [{ name: 'Chandigarh', tier: 'TIER_1' }, { name: 'Ludhiana', tier: 'TIER_2' }],
  KL: [{ name: 'Kochi', tier: 'TIER_2' }, { name: 'Thiruvananthapuram', tier: 'TIER_2' }],
  MP: [{ name: 'Indore', tier: 'TIER_2' }, { name: 'Bhopal', tier: 'TIER_2' }],
  HR: [{ name: 'Gurugram', tier: 'TIER_1' }, { name: 'Faridabad', tier: 'TIER_2' }],
  AP: [{ name: 'Visakhapatnam', tier: 'TIER_2' }, { name: 'Vijayawada', tier: 'TIER_2' }],
  BR: [{ name: 'Patna', tier: 'TIER_2' }],
  OR: [{ name: 'Bhubaneswar', tier: 'TIER_2' }],
  JH: [{ name: 'Ranchi', tier: 'TIER_2' }, { name: 'Jamshedpur', tier: 'TIER_2' }],
  CT: [{ name: 'Raipur', tier: 'TIER_2' }],
  GA: [{ name: 'Panaji', tier: 'TIER_2' }],
};

// ─── System lookup types ───────────────────────────────────────────
const SYSTEM_LOOKUPS: { code: string; displayName: string; values: { code: string; label: string; labelHi?: string }[] }[] = [
  {
    code: 'GENDER', displayName: 'Gender',
    values: [
      { code: 'MALE', label: 'Male', labelHi: 'पुरुष' },
      { code: 'FEMALE', label: 'Female', labelHi: 'महिला' },
      { code: 'OTHER', label: 'Other', labelHi: 'अन्य' },
      { code: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
    ],
  },
  {
    code: 'MARITAL_STATUS', displayName: 'Marital Status',
    values: [
      { code: 'SINGLE', label: 'Single', labelHi: 'अविवाहित' },
      { code: 'MARRIED', label: 'Married', labelHi: 'विवाहित' },
      { code: 'DIVORCED', label: 'Divorced' },
      { code: 'WIDOWED', label: 'Widowed' },
    ],
  },
  {
    code: 'BLOOD_GROUP', displayName: 'Blood Group',
    values: [
      { code: 'A_POS', label: 'A+' }, { code: 'A_NEG', label: 'A-' },
      { code: 'B_POS', label: 'B+' }, { code: 'B_NEG', label: 'B-' },
      { code: 'O_POS', label: 'O+' }, { code: 'O_NEG', label: 'O-' },
      { code: 'AB_POS', label: 'AB+' }, { code: 'AB_NEG', label: 'AB-' },
    ],
  },
  {
    code: 'SALUTATION', displayName: 'Salutation',
    values: [
      { code: 'MR', label: 'Mr.', labelHi: 'श्री' },
      { code: 'MRS', label: 'Mrs.', labelHi: 'श्रीमती' },
      { code: 'MS', label: 'Ms.', labelHi: 'सुश्री' },
      { code: 'DR', label: 'Dr.', labelHi: 'डॉ.' },
    ],
  },
];

async function main() {
  console.log('Seeding GlobalReferenceDB...');

  // 1. Countries
  for (const c of COUNTRIES) {
    await prisma.glCfgCountry.upsert({
      where: { code: c.code },
      create: c,
      update: { name: c.name, code3: c.code3, phoneCode: c.phoneCode, currencyCode: c.currencyCode },
    });
  }
  console.log(`  Countries: ${COUNTRIES.length} upserted`);

  // 2. Indian states (India must exist first)
  const india = await prisma.glCfgCountry.findUnique({ where: { code: 'IN' } });
  if (!india) throw new Error('India country record not found');

  for (const s of INDIAN_STATES) {
    await prisma.glCfgState.upsert({
      where: { countryId_code: { countryId: india.id, code: s.code } },
      create: { countryId: india.id, code: s.code, name: s.name, nameLocal: s.nameLocal, gstStateCode: s.gstStateCode },
      update: { name: s.name, nameLocal: s.nameLocal, gstStateCode: s.gstStateCode },
    });
  }
  console.log(`  States: ${INDIAN_STATES.length} upserted`);

  // 3. Cities
  let cityCount = 0;
  for (const [stateCode, cities] of Object.entries(INDIAN_CITIES)) {
    const state = await prisma.glCfgState.findFirst({ where: { countryId: india.id, code: stateCode } });
    if (!state) { console.warn(`  State ${stateCode} not found, skipping cities`); continue; }

    for (const c of cities) {
      const existing = await prisma.glCfgCity.findFirst({ where: { stateId: state.id, name: c.name } });
      if (!existing) {
        await prisma.glCfgCity.create({ data: { stateId: state.id, name: c.name, nameLocal: c.nameLocal, tier: c.tier } });
      }
      cityCount++;
    }
  }
  console.log(`  Cities: ${cityCount} processed`);

  // 4. System lookups
  for (const lt of SYSTEM_LOOKUPS) {
    const lookupType = await prisma.glCfgLookupType.upsert({
      where: { code: lt.code },
      create: { code: lt.code, displayName: lt.displayName, isSystem: true },
      update: { displayName: lt.displayName },
    });

    for (let i = 0; i < lt.values.length; i++) {
      const v = lt.values[i];
      await prisma.glCfgLookupValue.upsert({
        where: { lookupTypeId_code: { lookupTypeId: lookupType.id, code: v.code } },
        create: { lookupTypeId: lookupType.id, code: v.code, label: v.label, labelHi: v.labelHi, sortOrder: i + 1 },
        update: { label: v.label, labelHi: v.labelHi, sortOrder: i + 1 },
      });
    }
  }
  console.log(`  Lookup types: ${SYSTEM_LOOKUPS.length}, values: ${SYSTEM_LOOKUPS.reduce((s, l) => s + l.values.length, 0)}`);

  console.log('GlobalReferenceDB seed complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
