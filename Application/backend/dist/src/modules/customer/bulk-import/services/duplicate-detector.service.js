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
exports.DuplicateDetectorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const fuzzy_matcher_service_1 = require("./fuzzy-matcher.service");
let DuplicateDetectorService = class DuplicateDetectorService {
    constructor(prisma, fuzzyMatcher) {
        this.prisma = prisma;
        this.fuzzyMatcher = fuzzyMatcher;
    }
    detectInFileDuplicates(rows, checkFields) {
        const results = new Map();
        const seen = new Map();
        for (const row of rows) {
            for (const field of checkFields) {
                const val = this.extractField(row.mappedData, field);
                if (!val)
                    continue;
                const key = `${field}:${val.toLowerCase()}`;
                const firstRow = seen.get(key);
                if (firstRow !== undefined && firstRow !== row.rowNumber) {
                    results.set(row.rowNumber, {
                        isDuplicate: true,
                        duplicateType: 'IN_FILE',
                        duplicateOfRowNumber: firstRow,
                        duplicateMatchField: field,
                        duplicateMatchValue: val,
                    });
                    break;
                }
                seen.set(key, row.rowNumber);
            }
        }
        return results;
    }
    async detectExactDbDuplicates(rows, checkFields, targetEntity) {
        const results = new Map();
        const fieldValues = new Map();
        for (const row of rows) {
            for (const field of checkFields) {
                const val = this.extractField(row.mappedData, field);
                if (!val)
                    continue;
                if (!fieldValues.has(field))
                    fieldValues.set(field, new Map());
                const valMap = fieldValues.get(field);
                const normalVal = val.toLowerCase().trim();
                if (!valMap.has(normalVal))
                    valMap.set(normalVal, []);
                valMap.get(normalVal).push(row.rowNumber);
            }
        }
        for (const [field, valMap] of fieldValues) {
            const values = Array.from(valMap.keys());
            if (values.length === 0)
                continue;
            const dbMatches = await this.queryDbForField(field, values, targetEntity);
            for (const dbMatch of dbMatches) {
                const matchVal = dbMatch.matchValue.toLowerCase();
                const rowNumbers = valMap.get(matchVal) || [];
                for (const rowNum of rowNumbers) {
                    if (!results.has(rowNum)) {
                        results.set(rowNum, {
                            isDuplicate: true,
                            duplicateType: 'EXACT_DB',
                            duplicateOfEntityId: dbMatch.entityId,
                            duplicateMatchField: field,
                            duplicateMatchValue: dbMatch.matchValue,
                        });
                    }
                }
            }
        }
        return results;
    }
    async detectFuzzyDbDuplicates(rows, fuzzyFields, targetEntity, threshold) {
        const results = new Map();
        const candidates = await this.loadFuzzyCandidates(targetEntity, 500);
        if (candidates.length === 0)
            return results;
        for (const row of rows) {
            const fieldScores = [];
            for (const fuzzyField of fuzzyFields) {
                const importVal = this.extractFuzzyField(row.mappedData, fuzzyField);
                if (!importVal)
                    continue;
                let bestScore = 0;
                let bestCandidate = null;
                let bestDbVal = '';
                for (const candidate of candidates) {
                    const dbVal = this.extractFuzzyField(candidate, fuzzyField);
                    if (!dbVal)
                        continue;
                    let score;
                    if (fuzzyField.includes('Name') || fuzzyField === 'firstName+lastName') {
                        score = this.fuzzyMatcher.nameSimilarity(importVal, dbVal);
                    }
                    else if (fuzzyField.includes('organization') || fuzzyField.includes('company')) {
                        score = this.fuzzyMatcher.companySimilarity(importVal, dbVal);
                    }
                    else {
                        score = this.fuzzyMatcher.levenshteinSimilarity(importVal, dbVal);
                    }
                    if (score > bestScore) {
                        bestScore = score;
                        bestCandidate = candidate;
                        bestDbVal = dbVal;
                    }
                }
                if (bestScore > 0.5) {
                    fieldScores.push({
                        field: fuzzyField,
                        importValue: importVal,
                        dbValue: bestDbVal,
                        similarity: bestScore,
                    });
                }
            }
            if (fieldScores.length === 0)
                continue;
            const combined = this.fuzzyMatcher.combinedScore(fieldScores);
            if (combined.score >= threshold) {
                const bestField = fieldScores.sort((a, b) => b.similarity - a.similarity)[0];
                results.set(row.rowNumber, {
                    isDuplicate: true,
                    duplicateType: 'FUZZY_DB',
                    duplicateOfEntityId: undefined,
                    duplicateMatchField: bestField.field,
                    duplicateMatchValue: bestField.dbValue,
                    fuzzyMatchScore: combined.score,
                    fuzzyMatchDetails: {
                        confidence: combined.confidence,
                        overallScore: combined.score,
                        fieldScores: combined.fieldScores,
                        matchReason: combined.matchReason,
                    },
                });
            }
        }
        return results;
    }
    extractField(data, field) {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            return data[parent]?.[child] || null;
        }
        return data[field] || null;
    }
    extractFuzzyField(data, field) {
        if (field.includes('+')) {
            return field.split('+').map(f => data[f] || '').join(' ').trim();
        }
        return this.extractField(data, field) || '';
    }
    async queryDbForField(field, values, targetEntity) {
        const results = [];
        if (targetEntity === 'ROW_CONTACT' || targetEntity === 'CONTACT' || targetEntity === 'LEAD') {
            if (field === 'email' || field === 'mobile' || field === 'phone') {
                const comms = await this.prisma.working.communication.findMany({
                    where: { value: { in: values, mode: 'insensitive' } },
                    select: { value: true, contactId: true, rawContactId: true },
                });
                for (const c of comms) {
                    results.push({
                        entityId: c.contactId || c.rawContactId || '',
                        matchValue: c.value,
                    });
                }
            }
        }
        if (targetEntity === 'ORGANIZATION') {
            if (field === 'name' || field === 'organization.name') {
                const orgs = await this.prisma.working.organization.findMany({
                    where: { name: { in: values, mode: 'insensitive' }, isActive: true },
                    select: { id: true, name: true },
                });
                for (const o of orgs)
                    results.push({ entityId: o.id, matchValue: o.name });
            }
        }
        return results;
    }
    async loadFuzzyCandidates(targetEntity, limit) {
        if (targetEntity === 'CONTACT') {
            return this.prisma.working.contact.findMany({
                where: { isActive: true },
                select: { id: true, firstName: true, lastName: true, organization: { select: { name: true } } },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
        }
        if (targetEntity === 'ORGANIZATION') {
            return this.prisma.working.organization.findMany({
                where: { isActive: true },
                select: { id: true, name: true, city: true },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
        }
        return [];
    }
};
exports.DuplicateDetectorService = DuplicateDetectorService;
exports.DuplicateDetectorService = DuplicateDetectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fuzzy_matcher_service_1.FuzzyMatcherService])
], DuplicateDetectorService);
//# sourceMappingURL=duplicate-detector.service.js.map