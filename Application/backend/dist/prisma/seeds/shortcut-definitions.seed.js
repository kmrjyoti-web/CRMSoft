"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedShortcutDefinitions = seedShortcutDefinitions;
const shortcut_definitions_data_1 = require("../../src/modules/softwarevendor/keyboard-shortcuts/data/shortcut-definitions.data");
async function seedShortcutDefinitions(prisma, tenantId = '') {
    let count = 0;
    for (const s of shortcut_definitions_data_1.SHORTCUT_DEFINITIONS) {
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
//# sourceMappingURL=shortcut-definitions.seed.js.map