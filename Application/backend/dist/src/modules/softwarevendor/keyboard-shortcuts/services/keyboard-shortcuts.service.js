"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardShortcutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const shortcut_definitions_data_1 = require("../data/shortcut-definitions.data");
let KeyboardShortcutsService = class KeyboardShortcutsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllForUser(userId, tenantId) {
        const definitions = await this.prisma.shortcutDefinition.findMany({
            where: {
                OR: [{ tenantId: '' }, { tenantId }],
                isActive: true,
            },
            include: {
                userOverrides: {
                    where: { userId, isActive: true },
                },
            },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
        return definitions.map((def) => {
            const override = def.userOverrides[0];
            return {
                id: def.id,
                code: def.code,
                label: def.label,
                description: def.description,
                category: def.category,
                actionType: def.actionType,
                targetPath: def.targetPath,
                targetModule: def.targetModule,
                targetFunction: def.targetFunction,
                defaultKey: def.defaultKey,
                activeKey: override?.customKey ?? def.defaultKey,
                isCustomized: !!override,
                isLocked: def.isLocked,
                isSystem: def.isSystem,
                sortOrder: def.sortOrder,
            };
        });
    }
    async upsertOverride(userId, tenantId, shortcutId, dto) {
        const def = await this.prisma.shortcutDefinition.findUnique({ where: { id: shortcutId } });
        if (!def)
            throw new common_1.BadRequestException('Shortcut not found.');
        if (def.isLocked)
            throw new common_1.BadRequestException('This shortcut is locked by admin and cannot be changed.');
        const conflict = await this.prisma.shortcutUserOverride.findFirst({
            where: {
                tenantId,
                userId,
                customKey: dto.customKey,
                shortcutId: { not: shortcutId },
                isActive: true,
            },
        });
        if (conflict) {
            const conflictDef = await this.prisma.shortcutDefinition.findUnique({ where: { id: conflict.shortcutId } });
            throw new common_1.BadRequestException(`Key "${dto.customKey}" is already used by "${conflictDef?.label ?? 'another shortcut'}". Change that shortcut first.`);
        }
        return this.prisma.shortcutUserOverride.upsert({
            where: {
                tenantId_userId_shortcutId: { tenantId, userId, shortcutId },
            },
            update: { customKey: dto.customKey, isActive: true },
            create: { tenantId, userId, shortcutId, customKey: dto.customKey },
        });
    }
    async removeOverride(userId, tenantId, shortcutId) {
        await this.prisma.shortcutUserOverride.deleteMany({
            where: { tenantId, userId, shortcutId },
        });
        return { reset: true };
    }
    async resetAllOverrides(userId, tenantId) {
        const { count } = await this.prisma.shortcutUserOverride.deleteMany({
            where: { tenantId, userId },
        });
        return { reset: count };
    }
    async createCustom(userId, tenantId, dto) {
        const code = `CUSTOM_${userId.slice(0, 8)}_${Date.now()}`;
        const def = await this.prisma.shortcutDefinition.create({
            data: {
                tenantId,
                code,
                label: dto.label,
                description: dto.description,
                actionType: 'NAVIGATE',
                targetPath: dto.targetPath,
                targetModule: dto.targetModule,
                defaultKey: dto.defaultKey,
                category: dto.category ?? 'CUSTOM',
                isSystem: false,
                isLocked: false,
            },
        });
        await this.prisma.shortcutUserOverride.create({
            data: { tenantId, userId, shortcutId: def.id, customKey: dto.defaultKey },
        });
        return def;
    }
    async checkConflict(userId, tenantId, key, excludeShortcutId) {
        const override = await this.prisma.shortcutUserOverride.findFirst({
            where: {
                tenantId, userId, customKey: key, isActive: true,
                ...(excludeShortcutId ? { shortcutId: { not: excludeShortcutId } } : {}),
            },
            include: { shortcut: { select: { label: true, code: true } } },
        });
        if (override) {
            return { hasConflict: true, conflictsWith: override.shortcut?.label };
        }
        const defaultMatch = await this.prisma.shortcutDefinition.findFirst({
            where: {
                defaultKey: key,
                isActive: true,
                OR: [{ tenantId: '' }, { tenantId }],
                ...(excludeShortcutId ? { id: { not: excludeShortcutId } } : {}),
                userOverrides: { none: { userId, isActive: true } },
            },
        });
        if (defaultMatch) {
            return { hasConflict: true, conflictsWith: defaultMatch.label };
        }
        return { hasConflict: false, conflictsWith: null };
    }
    async adminListDefinitions(tenantId) {
        return this.prisma.shortcutDefinition.findMany({
            where: { OR: [{ tenantId: '' }, { tenantId }], isActive: true },
            include: { _count: { select: { userOverrides: true } } },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }
    async lockShortcut(id) {
        return this.prisma.shortcutDefinition.update({ where: { id }, data: { isLocked: true } });
    }
    async unlockShortcut(id) {
        return this.prisma.shortcutDefinition.update({ where: { id }, data: { isLocked: false } });
    }
    async updateDefinition(id, dto) {
        return this.prisma.shortcutDefinition.update({ where: { id }, data: dto });
    }
    async seedDefaults(tenantId = '') {
        let count = 0;
        for (const s of shortcut_definitions_data_1.SHORTCUT_DEFINITIONS) {
            await this.prisma.shortcutDefinition.upsert({
                where: { tenantId_code: { tenantId, code: s.code } },
                update: {
                    label: s.label,
                    description: s.description,
                    category: s.category,
                    actionType: s.actionType,
                    targetPath: s.targetPath,
                    targetModule: s.targetModule,
                    targetFunction: s.targetFunction,
                    defaultKey: s.defaultKey,
                    isLocked: s.isLocked ?? false,
                    isSystem: s.isSystem ?? false,
                    sortOrder: s.sortOrder,
                },
                create: {
                    tenantId,
                    code: s.code,
                    label: s.label,
                    description: s.description,
                    category: s.category,
                    actionType: s.actionType,
                    targetPath: s.targetPath,
                    targetModule: s.targetModule,
                    targetFunction: s.targetFunction,
                    defaultKey: s.defaultKey,
                    isLocked: s.isLocked ?? false,
                    isSystem: s.isSystem ?? false,
                    sortOrder: s.sortOrder,
                },
            });
            count++;
        }
        return { seeded: count };
    }
};
exports.KeyboardShortcutsService = KeyboardShortcutsService;
exports.KeyboardShortcutsService = KeyboardShortcutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KeyboardShortcutsService);
//# sourceMappingURL=keyboard-shortcuts.service.js.map