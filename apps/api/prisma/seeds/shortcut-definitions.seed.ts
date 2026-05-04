import { PrismaClient } from '@prisma/client';
import { SHORTCUT_DEFINITIONS } from '../../src/modules/softwarevendor/keyboard-shortcuts/data/shortcut-definitions.data';

export async function seedShortcutDefinitions(prisma: PrismaClient, tenantId = '') {
  let count = 0;
  for (const s of SHORTCUT_DEFINITIONS) {
    await prisma.shortcutDefinition.upsert({
      where: { tenantId_code: { tenantId, code: s.code } },
      update: {
        label: s.label,
        description: s.description ?? null,
        category: s.category,
        actionType: s.actionType,
        targetPath: s.targetPath ?? null,
        targetModule: s.targetModule ?? null,
        targetFunction: s.targetFunction ?? null,
        defaultKey: s.defaultKey,
        isLocked: s.isLocked ?? false,
        isSystem: s.isSystem ?? false,
        sortOrder: s.sortOrder,
      },
      create: {
        tenantId,
        code: s.code,
        label: s.label,
        description: s.description ?? null,
        category: s.category,
        actionType: s.actionType,
        targetPath: s.targetPath ?? null,
        targetModule: s.targetModule ?? null,
        targetFunction: s.targetFunction ?? null,
        defaultKey: s.defaultKey,
        isLocked: s.isLocked ?? false,
        isSystem: s.isSystem ?? false,
        sortOrder: s.sortOrder,
      },
    });
    count++;
  }
  console.log(`  ✅ Seeded ${count} shortcut definitions`);
  return count;
}
