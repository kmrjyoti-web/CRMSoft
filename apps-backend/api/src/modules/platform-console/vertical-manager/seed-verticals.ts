import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

const INITIAL_VERTICALS = [
  { code: 'GENERAL', name: 'General CRM', nameHi: 'सामान्य CRM', status: 'ACTIVE' },
  { code: 'SOFTWARE_VENDOR', name: 'Software Vendor', nameHi: 'सॉफ्टवेयर विक्रेता', status: 'ACTIVE' },
  { code: 'PHARMA', name: 'Pharmaceutical', nameHi: 'फार्मा', status: 'BETA' },
  { code: 'TOURISM', name: 'Tourism & Travel', nameHi: 'पर्यटन', status: 'BETA' },
  { code: 'RESTAURANT', name: 'Restaurant & Food', nameHi: 'रेस्तरां', status: 'BETA' },
  { code: 'RETAIL', name: 'Retail & Commerce', nameHi: 'खुदरा', status: 'BETA' },
  { code: 'REAL_ESTATE', name: 'Real Estate', nameHi: 'रियल एस्टेट', status: 'BETA' },
];

export async function seedInitialVerticals(db: PlatformConsolePrismaService) {
  for (const vertical of INITIAL_VERTICALS) {
    await db.verticalRegistry.upsert({
      where: { code: vertical.code },
      update: {
        name: vertical.name,
        nameHi: vertical.nameHi,
        status: vertical.status,
      },
      create: {
        code: vertical.code,
        name: vertical.name,
        nameHi: vertical.nameHi,
        status: vertical.status,
        schemaVersion: '1.0.0',
        modulesCount: 0,
        schemasConfig: {},
      },
    });

    await db.verticalHealth.upsert({
      where: { verticalType: vertical.code },
      update: {},
      create: {
        verticalType: vertical.code,
        apiStatus: 'UNKNOWN',
        dbStatus: 'UNKNOWN',
        testStatus: 'UNKNOWN',
        errorRate: 0,
        lastChecked: new Date(),
      },
    });

    await db.verticalVersion.upsert({
      where: { verticalType: vertical.code },
      update: {},
      create: {
        verticalType: vertical.code,
        currentVersion: '0.0.0',
        lastUpdated: new Date(),
        healthStatus: 'PENDING',
      },
    });
  }
}
