import { PrismaClient } from '@prisma/client';

export async function seedAmcWarranty(prisma: PrismaClient) {
  // ─── WARRANTY TEMPLATES ───────────────────────────────────────────────────
  const warrantySeeds = [
    // ELECTRONICS
    { industryCode: 'electronics', code: 'W-ELEC-FULL-12M', name: '1 Year Full Warranty', durationValue: 12, durationType: 'MONTHS', coverageType: 'FULL', inclusions: ['PCB', 'Motor', 'Compressor', 'Display', 'Sensor', 'Remote'], exclusions: ['Physical Damage', 'Water Damage', 'Misuse', 'Consumables', 'Batteries'], maxClaims: null, serviceCharge: 0, laborChargeType: 'FREE', partsChargeType: 'FREE', responseTimeSlaHours: 48, resolutionSlaDays: 7 },
    { industryCode: 'electronics', code: 'W-ELEC-COMP-5Y', name: '5 Year Compressor Warranty', durationValue: 5, durationType: 'YEARS', coverageType: 'LIMITED', inclusions: ['Compressor Only'], exclusions: ['Gas Charging', 'Installation Defect', 'Voltage Damage'], maxClaims: 2, maxClaimsPeriod: 'TOTAL', laborChargeType: 'FIXED', laborChargeAmount: 500, partsChargeType: 'FREE' },
    { industryCode: 'electronics', code: 'W-ELEC-MFG-6M', name: '6 Month Manufacturing Defect', durationValue: 6, durationType: 'MONTHS', coverageType: 'MANUFACTURING_DEFECT_ONLY', inclusions: ['Manufacturing defects only'], exclusions: ['Wear & tear', 'Accidental damage', 'Misuse'] },
    // SOFTWARE
    { industryCode: 'software', code: 'W-SW-BUGFIX-3M', name: '3 Month Bug Fix Warranty', durationValue: 3, durationType: 'MONTHS', coverageType: 'LIMITED', inclusions: ['Bug fixes', 'Critical patches', 'Security updates'], exclusions: ['New features', 'Customization', 'Training', 'Data migration'], supportChannels: ['ONLINE', 'PHONE'], locationType: 'REMOTE', responseTimeSlaHours: 24, resolutionSlaDays: 3 },
    { industryCode: 'software', code: 'W-SW-FULL-12M', name: '1 Year Full Support', durationValue: 12, durationType: 'MONTHS', coverageType: 'FULL', inclusions: ['Bug fixes', 'Updates', 'Minor enhancements', 'Online support'], exclusions: ['Major features', 'Infrastructure', 'Third-party integrations'] },
    // INDUSTRIAL
    { industryCode: 'industrial', code: 'W-IND-FULL-24M', name: '2 Year Comprehensive', durationValue: 24, durationType: 'MONTHS', coverageType: 'FULL', inclusions: ['All mechanical parts', 'Electronics', 'Hydraulics'], exclusions: ['Consumables (filters, oil)', 'Wear parts (belts, seals)'], responseTimeSlaHours: 4, resolutionSlaDays: 2 },
    // MEDICAL
    { industryCode: 'medical', code: 'W-MED-FULL-12M', name: '1 Year Comprehensive + Calibration', durationValue: 12, durationType: 'MONTHS', coverageType: 'FULL', inclusions: ['All parts', 'Quarterly calibration', 'Calibration certificate'], exclusions: ['Consumables', 'Probes (wear items)'] },
    // AUTOMOTIVE
    { industryCode: 'automotive', code: 'W-AUTO-3Y-100K', name: '3 Year / 1 Lakh KM', durationValue: 3, durationType: 'YEARS', coverageType: 'FULL', inclusions: ['Engine', 'Transmission', 'Electrical', 'Suspension'], exclusions: ['Tyres', 'Battery', 'Brake pads', 'Clutch plate', 'Consumables'] },
    // FMCG
    { industryCode: 'fmcg', code: 'W-FMCG-REPLACE-7D', name: '7 Day Replacement', durationValue: 7, durationType: 'DAYS', coverageType: 'FULL', inclusions: ['Full replacement if defective'], exclusions: ['Opened/used products', 'Expired products'] },
  ];

  for (const seed of warrantySeeds) {
    const existing = await prisma.warrantyTemplate.findFirst({ where: { code: seed.code, isSystemTemplate: true } });
    if (!existing) {
      await prisma.warrantyTemplate.create({
        data: {
          ...seed,
          isSystemTemplate: true,
          inclusions: seed.inclusions ?? [],
          exclusions: seed.exclusions ?? [],
          supportChannels: (seed as any).supportChannels ?? [],
          serviceCharge: (seed as any).serviceCharge ?? 0,
          laborChargeType: seed.laborChargeType ?? 'FREE',
          partsChargeType: seed.partsChargeType ?? 'FREE',
        },
      });
    }
  }
  console.log(`✅ Warranty templates seeded (${warrantySeeds.length})`);

  // ─── AMC PLAN TEMPLATES ───────────────────────────────────────────────────
  const amcSeeds = [
    // ELECTRONICS
    { industryCode: 'electronics', code: 'AMC-ELEC-SILVER', name: 'Silver AMC', planTier: 'SILVER', durationValue: 12, durationType: 'MONTHS', charges: 5000, billingCycle: 'YEARLY', freeVisits: 2, freeCallSupport: 6, freeOnlineSupport: 12, afterFreeVisitCharge: 500, afterFreeCallCharge: 100, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 6, partsIncluded: ['Filters', 'Gas Charging'], partsExcluded: ['Compressor', 'PCB', 'Motor'], excludedPartsChargeType: 'AT_COST', slaResponseHours: 48, slaResolutionDays: 5, gracePeriodDays: 15, renewalDiscount: 10 },
    { industryCode: 'electronics', code: 'AMC-ELEC-GOLD', name: 'Gold AMC', planTier: 'GOLD', durationValue: 12, durationType: 'MONTHS', charges: 10000, billingCycle: 'YEARLY', freeVisits: 4, freeCallSupport: 12, freeOnlineSupport: 24, afterFreeVisitCharge: 300, afterFreeCallCharge: 50, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 3, partsIncluded: ['All parts except compressor'], partsExcluded: ['Compressor'], excludedPartsChargeType: 'COST_PLUS', partsChargeMarkup: 10, slaResponseHours: 24, slaResolutionDays: 3, gracePeriodDays: 30, renewalDiscount: 15 },
    { industryCode: 'electronics', code: 'AMC-ELEC-PLATINUM', name: 'Platinum AMC', planTier: 'PLATINUM', durationValue: 12, durationType: 'MONTHS', charges: 18000, billingCycle: 'YEARLY', freeVisits: 6, freeCallSupport: -1, freeOnlineSupport: -1, afterFreeVisitCharge: 0, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 2, partsIncluded: ['ALL'], partsExcluded: [], slaResponseHours: 4, slaResolutionDays: 1, penaltyPerDay: 500, gracePeriodDays: 30, renewalDiscount: 20 },
    // SOFTWARE
    { industryCode: 'software', code: 'AMC-SW-BASIC', name: 'Basic Support', planTier: 'BASIC', durationValue: 12, durationType: 'MONTHS', charges: 25000, billingCycle: 'YEARLY', freeVisits: 0, freeCallSupport: 12, freeOnlineSupport: -1, afterFreeCallCharge: 200, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 12, partsIncluded: ['Bug fixes', 'Security patches'], partsExcluded: ['New features', 'Customization', 'Data migration'], slaResponseHours: 24, slaResolutionDays: 5 },
    { industryCode: 'software', code: 'AMC-SW-PREMIUM', name: 'Premium Support', planTier: 'GOLD', durationValue: 12, durationType: 'MONTHS', charges: 50000, billingCycle: 'YEARLY', freeVisits: 4, freeCallSupport: -1, freeOnlineSupport: -1, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 3, partsIncluded: ['Bug fixes', 'Minor features', 'Training (2 sessions)'], partsExcluded: ['Major features', 'Infrastructure changes'], slaResponseHours: 4, slaResolutionDays: 2, renewalDiscount: 10 },
    // INDUSTRIAL
    { industryCode: 'industrial', code: 'AMC-IND-PREVENTIVE', name: 'Preventive Maintenance', planTier: 'GOLD', durationValue: 12, durationType: 'MONTHS', charges: 100000, billingCycle: 'QUARTERLY', freeVisits: 4, freeCallSupport: -1, freeOnlineSupport: 0, visitScheduleType: 'USAGE_HOURS', visitScheduleValue: 500, partsIncluded: ['Filters', 'Belts', 'Oil', 'Seals'], partsExcluded: ['Motors', 'Gearbox', 'Hydraulic pump'], excludedPartsChargeType: 'AT_COST', slaResponseHours: 4, slaResolutionDays: 1, penaltyPerDay: 2000 },
    // MEDICAL
    { industryCode: 'medical', code: 'AMC-MED-COMPREHENSIVE', name: 'Comprehensive + Calibration', planTier: 'PLATINUM', durationValue: 12, durationType: 'MONTHS', charges: 200000, billingCycle: 'YEARLY', freeVisits: 4, freeCallSupport: -1, freeOnlineSupport: -1, visitScheduleType: 'INTERVAL_MONTHS', visitScheduleValue: 3, partsIncluded: ['ALL'], partsExcluded: [], slaResponseHours: 2, slaResolutionDays: 1, penaltyPerDay: 5000 },
    // AUTOMOTIVE
    { industryCode: 'automotive', code: 'AMC-AUTO-SERVICE', name: 'Annual Service Contract', planTier: 'GOLD', durationValue: 12, durationType: 'MONTHS', charges: 8000, billingCycle: 'YEARLY', freeVisits: 3, freeCallSupport: 0, freeOnlineSupport: 0, visitScheduleType: 'USAGE_KM', visitScheduleValue: 10000, partsIncluded: ['Oil', 'Oil Filter', 'Air Filter', 'Spark Plugs'], partsExcluded: ['Tyres', 'Battery', 'Brake pads', 'Clutch'], excludedPartsChargeType: 'MRP' },
  ];

  for (const seed of amcSeeds) {
    const existing = await prisma.aMCPlanTemplate.findFirst({ where: { code: seed.code, isSystemTemplate: true } });
    if (!existing) {
      await prisma.aMCPlanTemplate.create({
        data: {
          ...seed,
          isSystemTemplate: true,
          partsIncluded: seed.partsIncluded ?? [],
          partsExcluded: seed.partsExcluded ?? [],
          freeCallSupport: seed.freeCallSupport < 0 ? 9999 : seed.freeCallSupport,
          freeOnlineSupport: seed.freeOnlineSupport < 0 ? 9999 : seed.freeOnlineSupport,
        },
      });
    }
  }
  console.log(`✅ AMC plan templates seeded (${amcSeeds.length})`);
}
