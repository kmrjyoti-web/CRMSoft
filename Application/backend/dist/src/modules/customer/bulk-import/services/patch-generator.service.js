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
exports.PatchGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PatchGeneratorService = class PatchGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePatch(entityId, mappedData, targetEntity) {
        const existing = await this.loadEntity(entityId, targetEntity);
        if (!existing) {
            return {
                entityId,
                entityLabel: 'Unknown',
                fields: [],
                hasChanges: false,
                summary: 'Entity not found',
            };
        }
        const entityLabel = this.getLabel(existing, targetEntity);
        const fields = [];
        for (const [key, newVal] of Object.entries(mappedData)) {
            if (key === 'organization' || typeof newVal === 'object')
                continue;
            if (!newVal || newVal === '')
                continue;
            const oldVal = existing[key];
            if (oldVal === undefined)
                continue;
            const oldStr = oldVal != null ? String(oldVal) : '';
            const newStr = String(newVal);
            if (!oldStr && newStr) {
                fields.push({ field: key, oldValue: null, newValue: newStr, action: 'ADD', recommendation: `Will add ${key}` });
            }
            else if (oldStr && oldStr.toLowerCase() !== newStr.toLowerCase()) {
                fields.push({ field: key, oldValue: oldStr, newValue: newStr, action: 'UPDATE', recommendation: `Will update ${key} from "${oldStr}" to "${newStr}"` });
            }
            else {
                fields.push({ field: key, oldValue: oldStr, newValue: newStr, action: 'NO_CHANGE', recommendation: 'No change' });
            }
        }
        const changes = fields.filter(f => f.action !== 'NO_CHANGE');
        const addCount = changes.filter(f => f.action === 'ADD').length;
        const updateCount = changes.filter(f => f.action === 'UPDATE').length;
        let summary = 'No changes detected';
        if (changes.length > 0) {
            const parts = [];
            if (addCount)
                parts.push(`${addCount} field(s) to add`);
            if (updateCount)
                parts.push(`${updateCount} field(s) to update`);
            summary = parts.join(', ');
        }
        return { entityId, entityLabel, fields, hasChanges: changes.length > 0, summary };
    }
    async generatePatchesForRows(rows, targetEntity) {
        const patches = new Map();
        for (const row of rows) {
            const patch = await this.generatePatch(row.entityId, row.mappedData, targetEntity);
            patches.set(row.rowNumber, patch);
        }
        return patches;
    }
    async loadEntity(entityId, targetEntity) {
        try {
            switch (targetEntity) {
                case 'CONTACT':
                    return this.prisma.working.contact.findUnique({ where: { id: entityId } });
                case 'ORGANIZATION':
                    return this.prisma.working.organization.findUnique({ where: { id: entityId } });
                case 'LEAD':
                    return this.prisma.working.lead.findUnique({ where: { id: entityId } });
                default:
                    return null;
            }
        }
        catch {
            return null;
        }
    }
    getLabel(entity, targetEntity) {
        switch (targetEntity) {
            case 'CONTACT': return `${entity.firstName || ''} ${entity.lastName || ''}`.trim();
            case 'ORGANIZATION': return entity.name || '';
            case 'LEAD': return entity.leadNumber || '';
            default: return entity.id || '';
        }
    }
};
exports.PatchGeneratorService = PatchGeneratorService;
exports.PatchGeneratorService = PatchGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatchGeneratorService);
//# sourceMappingURL=patch-generator.service.js.map