import { PrismaClient } from '@prisma/platform-client';

const LOCKED_MODULE_CODES = [
  'usr', 'cfg', 'inv', 'crm', 'sal', 'pay', 'acc', 'tax',
  'hr', 'mkt', 'lic', 'ven', 'wf', 'not', 'rpt', 'doc', 'cmn', 'aud',
  'qa', // 19th: Test Management (test plans, runs, results, evidences)
] as const;

const VERTICALS = [
  {
    code: 'gv',
    name: 'General',
    description: 'Default vertical — generic CRM functionality',
    tablePrefix: 'gv_',
    isActive: true,
    isBuilt: true,
    sortOrder: 1,
    modules: ['usr', 'cfg', 'crm', 'sal', 'inv', 'pay', 'acc', 'tax', 'not', 'rpt', 'doc', 'cmn', 'aud', 'qa'],
  },
  {
    code: 'soft',
    name: 'Software Vendor',
    description: 'CRMSoft platform ops — own vertical (Admin Console 3006)',
    tablePrefix: 'soft_',
    isActive: true,
    isBuilt: true,
    sortOrder: 2,
    modules: ['usr', 'cfg', 'lic', 'ven', 'mkt', 'pay', 'acc', 'not', 'rpt', 'aud', 'qa'],
  },
];

export async function seedVerticalRegistry(prisma: PrismaClient) {
  for (const v of VERTICALS) {
    const { modules, ...verticalData } = v;

    const vertical = await prisma.gvCfgVertical.upsert({
      where: { code: v.code },
      create: verticalData,
      update: {
        name: v.name,
        description: v.description,
        tablePrefix: v.tablePrefix,
        isActive: v.isActive,
        isBuilt: v.isBuilt,
        sortOrder: v.sortOrder,
      },
    });

    for (const moduleCode of modules) {
      await prisma.gvCfgVerticalModule.upsert({
        where: {
          verticalId_moduleCode: {
            verticalId: vertical.id,
            moduleCode,
          },
        },
        create: {
          verticalId: vertical.id,
          moduleCode,
          isRequired: ['usr', 'cfg'].includes(moduleCode),
        },
        update: {
          isRequired: ['usr', 'cfg'].includes(moduleCode),
        },
      });
    }
  }
}
