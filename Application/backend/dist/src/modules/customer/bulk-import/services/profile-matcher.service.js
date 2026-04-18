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
exports.ProfileMatcherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ProfileMatcherService = class ProfileMatcherService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    matchHeaders(fileHeaders, profile) {
        const mapping = profile.fieldMapping || [];
        const normalizedFileHeaders = fileHeaders.map((h) => h.toLowerCase().trim());
        const resolvedMapping = [];
        const unmatchedHeaders = [];
        let matchedCount = 0;
        for (const m of mapping) {
            const sourceNorm = (m.sourceHeader || '').toLowerCase().trim();
            const aliases = (m.aliases || []).map((a) => a.toLowerCase().trim());
            const allNames = [sourceNorm, ...aliases];
            const matchIdx = normalizedFileHeaders.findIndex((h) => allNames.includes(h));
            if (matchIdx >= 0) {
                matchedCount++;
                resolvedMapping.push({ ...m, matchedHeader: fileHeaders[matchIdx], matched: true });
            }
            else {
                resolvedMapping.push({ ...m, matchedHeader: null, matched: false });
                unmatchedHeaders.push(m.sourceHeader);
            }
        }
        const totalExpected = mapping.length;
        const matchScore = totalExpected > 0 ? (matchedCount / totalExpected) * 100 : 0;
        let status;
        if (matchScore >= 90)
            status = 'FULL_MATCH';
        else if (matchScore >= 50)
            status = 'PARTIAL';
        else
            status = 'NO_MATCH';
        return {
            profileId: profile.id,
            profileName: profile.name,
            matchScore,
            status,
            resolvedMapping,
            unmatchedHeaders,
            matchedCount,
            totalExpected,
        };
    }
    async suggestProfiles(fileHeaders, targetEntity) {
        const profiles = await this.prisma.working.importProfile.findMany({
            where: { targetEntity: targetEntity, status: 'ACTIVE' },
            orderBy: { usageCount: 'desc' },
        });
        const results = [];
        for (const profile of profiles) {
            const match = this.matchHeaders(fileHeaders, profile);
            if (match.matchScore > 0)
                results.push(match);
        }
        return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    }
    applyMapping(rowData, resolvedMapping, defaults) {
        const mapped = {};
        for (const m of resolvedMapping) {
            if (!m.matched || !m.targetField || m.transform === 'SKIP')
                continue;
            const header = m.matchedHeader || m.sourceHeader;
            let value = rowData[header] || '';
            value = this.applyTransform(value, m.transform);
            if (!value && !m.isRequired)
                continue;
            if (m.targetField.includes('.')) {
                const [parent, child] = m.targetField.split('.');
                if (!mapped[parent])
                    mapped[parent] = {};
                mapped[parent][child] = value;
            }
            else {
                mapped[m.targetField] = value;
            }
        }
        if (defaults) {
            for (const [key, val] of Object.entries(defaults)) {
                if (!mapped[key])
                    mapped[key] = val;
            }
        }
        return mapped;
    }
    applyTransform(value, transform) {
        if (!value || !transform)
            return value;
        switch (transform) {
            case 'TRIM': return value.trim();
            case 'UPPERCASE': return value.trim().toUpperCase();
            case 'LOWERCASE': return value.trim().toLowerCase();
            case 'CLEAN_PHONE': return value.replace(/[\s\-\(\)\.]/g, '').trim();
            case 'CLEAN_EMAIL': return value.trim().toLowerCase();
            case 'SPLIT_NAME': return value.trim();
            case 'APPEND_NOTES': return value.trim();
            default: return value.trim();
        }
    }
};
exports.ProfileMatcherService = ProfileMatcherService;
exports.ProfileMatcherService = ProfileMatcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileMatcherService);
//# sourceMappingURL=profile-matcher.service.js.map