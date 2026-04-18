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
exports.CrossDbResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let CrossDbResolverService = class CrossDbResolverService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveUsers(records, fkFields, userSelect) {
        if (!records.length || !fkFields.length)
            return records;
        const allUserIds = new Set();
        for (const record of records) {
            for (const fk of fkFields) {
                const val = record[fk];
                if (val)
                    allUserIds.add(val);
            }
        }
        if (allUserIds.size === 0)
            return records;
        const users = await this.prisma.identity.user.findMany({
            where: { id: { in: Array.from(allUserIds) } },
            select: userSelect ?? { id: true, firstName: true, lastName: true, email: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        return records.map((record) => {
            const merged = { ...record };
            for (const fk of fkFields) {
                const relationName = fk.replace(/Id$/, '');
                merged[relationName] = record[fk] ? userMap.get(record[fk]) ?? null : null;
            }
            return merged;
        });
    }
    async resolveUser(userId) {
        if (!userId)
            return null;
        return this.prisma.identity.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true },
        });
    }
    async resolveRoles(records, fkField = 'roleId', roleSelect) {
        if (!records.length)
            return records;
        const roleIds = [...new Set(records.map((r) => r[fkField]).filter(Boolean))];
        if (roleIds.length === 0)
            return records;
        const roles = await this.prisma.identity.role.findMany({
            where: { id: { in: roleIds } },
            select: roleSelect ?? { id: true, name: true, displayName: true },
        });
        const roleMap = new Map(roles.map((r) => [r.id, r]));
        const relationName = fkField.replace(/Id$/, '');
        return records.map((record) => ({
            ...record,
            [relationName]: record[fkField] ? roleMap.get(record[fkField]) ?? null : null,
        }));
    }
    async resolveLookupValues(records, fkField = 'lookupValueId', includeCategory = false) {
        if (!records.length)
            return records;
        const lookupIds = [...new Set(records.map((r) => r[fkField]).filter(Boolean))];
        if (lookupIds.length === 0)
            return records;
        const lookups = await this.prisma.platform.lookupValue.findMany({
            where: { id: { in: lookupIds } },
            select: {
                id: true,
                value: true,
                label: true,
                ...(includeCategory ? { lookup: { select: { category: true } } } : {}),
            },
        });
        const lookupMap = new Map(lookups.map((l) => [l.id, l]));
        const relationName = fkField.replace(/Id$/, '');
        return records.map((record) => ({
            ...record,
            [relationName]: record[fkField] ? lookupMap.get(record[fkField]) ?? null : null,
        }));
    }
    async resolveCountries(ids) {
        if (!ids.length)
            return [];
        return this.prisma.globalReference.glCfgCountry.findMany({
            where: { id: { in: ids } },
        });
    }
    async resolveCountry(id) {
        if (!id)
            return null;
        return this.prisma.globalReference.glCfgCountry.findUnique({ where: { id } });
    }
    async resolveStates(ids) {
        if (!ids.length)
            return [];
        return this.prisma.globalReference.glCfgState.findMany({
            where: { id: { in: ids } },
        });
    }
    async resolveState(id) {
        if (!id)
            return null;
        return this.prisma.globalReference.glCfgState.findUnique({ where: { id } });
    }
    async resolveCities(ids) {
        if (!ids.length)
            return [];
        return this.prisma.globalReference.glCfgCity.findMany({
            where: { id: { in: ids } },
        });
    }
    async resolveCity(id) {
        if (!id)
            return null;
        return this.prisma.globalReference.glCfgCity.findUnique({ where: { id } });
    }
    async resolveGlobalLookupValues(ids) {
        if (!ids.length)
            return [];
        return this.prisma.globalReference.glCfgLookupValue.findMany({
            where: { id: { in: ids } },
        });
    }
    async resolveGlobalLookupValuesByType(typeCode) {
        return this.prisma.globalReference.glCfgLookupValue.findMany({
            where: {
                lookupType: { code: typeCode },
                isActive: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolvePincodes(pincodes) {
        if (!pincodes.length)
            return [];
        return this.prisma.globalReference.glCfgPincode.findMany({
            where: { pincode: { in: pincodes }, isActive: true },
        });
    }
    async resolvePincode(pincode) {
        if (!pincode)
            return null;
        return this.prisma.globalReference.glCfgPincode.findUnique({
            where: { pincode },
        });
    }
    async resolveGstRates(ids) {
        if (!ids.length)
            return [];
        return this.prisma.globalReference.glCfgGstRate.findMany({
            where: { id: { in: ids } },
        });
    }
    async resolveGstRate(id) {
        if (!id)
            return null;
        return this.prisma.globalReference.glCfgGstRate.findUnique({ where: { id } });
    }
    async resolveAllGstRates() {
        return this.prisma.globalReference.glCfgGstRate.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolveHsnCode(code) {
        if (!code)
            return null;
        return this.prisma.globalReference.glCfgHsnCode.findUnique({ where: { code } });
    }
    async resolveHsnCodes(codes) {
        if (!codes.length)
            return [];
        return this.prisma.globalReference.glCfgHsnCode.findMany({
            where: { code: { in: codes }, isActive: true },
            include: { defaultGstRate: true },
        });
    }
    async resolveCurrency(code) {
        if (!code)
            return null;
        return this.prisma.globalReference.glCfgCurrency.findUnique({ where: { code } });
    }
    async resolveAllCurrencies() {
        return this.prisma.globalReference.glCfgCurrency.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolveDefaultCurrency() {
        return this.prisma.globalReference.glCfgCurrency.findFirst({
            where: { isDefault: true },
        });
    }
    async resolveTimezone(tzIdentifier) {
        if (!tzIdentifier)
            return null;
        return this.prisma.globalReference.glCfgTimezone.findUnique({ where: { tzIdentifier } });
    }
    async resolveAllTimezones() {
        return this.prisma.globalReference.glCfgTimezone.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolveDefaultTimezone() {
        return this.prisma.globalReference.glCfgTimezone.findFirst({
            where: { isDefault: true },
        });
    }
    async resolveIndustryType(code) {
        if (!code)
            return null;
        return this.prisma.globalReference.glCfgIndustryType.findUnique({ where: { code } });
    }
    async resolveAllIndustryTypes() {
        return this.prisma.globalReference.glCfgIndustryType.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolveLanguage(code) {
        if (!code)
            return null;
        return this.prisma.globalReference.glCfgLanguage.findUnique({ where: { code } });
    }
    async resolveAllLanguages(indianOnly = false) {
        return this.prisma.globalReference.glCfgLanguage.findMany({
            where: { isActive: true, ...(indianOnly ? { isIndian: true } : {}) },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async resolveDefaultLanguage() {
        return this.prisma.globalReference.glCfgLanguage.findFirst({
            where: { isDefault: true },
        });
    }
};
exports.CrossDbResolverService = CrossDbResolverService;
exports.CrossDbResolverService = CrossDbResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrossDbResolverService);
//# sourceMappingURL=cross-db-resolver.service.js.map