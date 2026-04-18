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
exports.CompanyLocationsService = void 0;
const common_1 = require("@nestjs/common");
const country_state_city_1 = require("country-state-city");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const gst_state_codes_1 = require("../data/gst-state-codes");
let CompanyLocationsService = class CompanyLocationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLocationTree(tenantId) {
        return this.prisma.companyCountry.findMany({
            where: { tenantId, isActive: true },
            include: {
                states: {
                    where: { isActive: true },
                    include: {
                        cities: {
                            where: { isActive: true },
                            include: {
                                pincodes: {
                                    where: { isActive: true },
                                    orderBy: { pincode: 'asc' },
                                },
                            },
                            orderBy: { cityName: 'asc' },
                        },
                    },
                    orderBy: { stateName: 'asc' },
                },
            },
            orderBy: [{ isPrimary: 'desc' }, { countryName: 'asc' }],
        });
    }
    async getSummary(tenantId) {
        const [countries, states, cities, pincodes] = await Promise.all([
            this.prisma.companyCountry.count({ where: { tenantId, isActive: true } }),
            this.prisma.companyState.count({ where: { tenantId, isActive: true } }),
            this.prisma.companyCity.count({ where: { tenantId, isActive: true } }),
            this.prisma.companyPincode.count({ where: { tenantId, isActive: true } }),
        ]);
        return { countries, states, cities, pincodes };
    }
    async addCountry(tenantId, dto) {
        const existing = await this.prisma.companyCountry.findFirst({
            where: { tenantId, countryCode: dto.countryCode },
        });
        if (existing) {
            if (!existing.isActive) {
                return this.prisma.companyCountry.update({
                    where: { id: existing.id },
                    data: { isActive: true, isPrimary: dto.isPrimary ?? existing.isPrimary },
                });
            }
            throw new common_1.ConflictException(`Country ${dto.countryCode} already added`);
        }
        const countryInfo = country_state_city_1.Country.getCountryByCode(dto.countryCode);
        if (!countryInfo)
            throw new common_1.NotFoundException(`Country code ${dto.countryCode} not found`);
        if (dto.isPrimary) {
            await this.prisma.companyCountry.updateMany({
                where: { tenantId },
                data: { isPrimary: false },
            });
        }
        return this.prisma.companyCountry.create({
            data: {
                tenantId,
                countryName: countryInfo.name,
                countryCode: dto.countryCode,
                isoCode3: countryInfo.isoCode,
                phonecode: countryInfo.phonecode,
                currency: countryInfo.currency,
                currencySymbol: countryInfo.currency,
                isPrimary: dto.isPrimary ?? false,
            },
        });
    }
    async addStates(tenantId, countryId, dto) {
        const country = await this.prisma.companyCountry.findFirst({
            where: { id: countryId, tenantId },
        });
        if (!country)
            throw new common_1.NotFoundException('Company country not found');
        const results = [];
        for (const s of dto.states) {
            const stateInfo = country_state_city_1.State.getStateByCodeAndCountry(s.stateCode, country.countryCode);
            if (!stateInfo) {
                throw new common_1.NotFoundException(`State ${s.stateCode} not found in ${country.countryCode}`);
            }
            const gstCode = (0, gst_state_codes_1.getGstCodeForState)(s.stateCode);
            const existing = await this.prisma.companyState.findFirst({
                where: { tenantId, companyCountryId: countryId, stateCode: s.stateCode },
            });
            if (existing) {
                const updated = await this.prisma.companyState.update({
                    where: { id: existing.id },
                    data: {
                        isActive: true,
                        coverageType: s.coverageType,
                        isHeadquarter: s.isHeadquarter ?? false,
                        stateGstin: s.stateGstin,
                    },
                });
                results.push(updated);
            }
            else {
                if (s.isHeadquarter) {
                    await this.prisma.companyState.updateMany({
                        where: { tenantId },
                        data: { isHeadquarter: false },
                    });
                }
                const state = await this.prisma.companyState.create({
                    data: {
                        tenantId,
                        companyCountryId: countryId,
                        stateName: stateInfo.name,
                        stateCode: s.stateCode,
                        gstStateCode: gstCode ?? null,
                        coverageType: s.coverageType,
                        isHeadquarter: s.isHeadquarter ?? false,
                        stateGstin: s.stateGstin,
                    },
                });
                results.push(state);
            }
        }
        return results;
    }
    async addCities(tenantId, stateId, dto) {
        const state = await this.prisma.companyState.findFirst({
            where: { id: stateId, tenantId },
        });
        if (!state)
            throw new common_1.NotFoundException('Company state not found');
        const results = [];
        for (const c of dto.cities) {
            const existing = await this.prisma.companyCity.findFirst({
                where: { tenantId, companyStateId: stateId, cityName: c.cityName },
            });
            if (existing) {
                const updated = await this.prisma.companyCity.update({
                    where: { id: existing.id },
                    data: { isActive: true, coverageType: c.coverageType, district: c.district },
                });
                results.push(updated);
            }
            else {
                const city = await this.prisma.companyCity.create({
                    data: {
                        tenantId,
                        companyStateId: stateId,
                        cityName: c.cityName,
                        district: c.district,
                        coverageType: c.coverageType,
                    },
                });
                results.push(city);
            }
        }
        return results;
    }
    async addPincodes(tenantId, cityId, dto) {
        const city = await this.prisma.companyCity.findFirst({ where: { id: cityId, tenantId } });
        if (!city)
            throw new common_1.NotFoundException('Company city not found');
        await this.prisma.companyPincode.createMany({
            data: dto.pincodes.map((p) => ({
                tenantId,
                companyCityId: cityId,
                pincode: p.pincode,
                areaName: p.areaName ?? null,
            })),
            skipDuplicates: true,
        });
        return this.prisma.companyPincode.findMany({
            where: { tenantId, companyCityId: cityId, isActive: true },
            orderBy: { pincode: 'asc' },
        });
    }
    async addPincodeRange(tenantId, cityId, dto) {
        const city = await this.prisma.companyCity.findFirst({ where: { id: cityId, tenantId } });
        if (!city)
            throw new common_1.NotFoundException('Company city not found');
        const from = parseInt(dto.fromPincode, 10);
        const to = parseInt(dto.toPincode, 10);
        if (isNaN(from) || isNaN(to) || from > to) {
            throw new common_1.NotFoundException('Invalid pincode range');
        }
        if (to - from > 999) {
            throw new common_1.ConflictException('Range too large (max 1000 pincodes)');
        }
        const pincodes = [];
        for (let p = from; p <= to; p++) {
            pincodes.push({ tenantId, companyCityId: cityId, pincode: String(p).padStart(6, '0') });
        }
        await this.prisma.companyPincode.createMany({ data: pincodes, skipDuplicates: true });
        return { added: pincodes.length };
    }
    async removeCountry(tenantId, id) {
        await this.prisma.companyCountry.deleteMany({ where: { id, tenantId } });
    }
    async removeState(tenantId, id) {
        await this.prisma.companyState.deleteMany({ where: { id, tenantId } });
    }
    async removeCity(tenantId, id) {
        await this.prisma.companyCity.deleteMany({ where: { id, tenantId } });
    }
    async removePincode(tenantId, id) {
        await this.prisma.companyPincode.deleteMany({ where: { id, tenantId } });
    }
    async updateState(tenantId, id, data) {
        if (data.isHeadquarter) {
            await this.prisma.companyState.updateMany({ where: { tenantId }, data: { isHeadquarter: false } });
        }
        return this.prisma.companyState.updateMany({ where: { id, tenantId }, data });
    }
    async updateCity(tenantId, id, data) {
        return this.prisma.companyCity.updateMany({ where: { id, tenantId }, data });
    }
    getAllCountries() {
        return country_state_city_1.Country.getAllCountries().map((c) => ({
            name: c.name,
            code: c.isoCode,
            phonecode: c.phonecode,
            currency: c.currency,
            flag: c.flag,
        }));
    }
    getStatesOfCountry(countryCode) {
        return country_state_city_1.State.getStatesOfCountry(countryCode).map((s) => ({
            name: s.name,
            code: s.isoCode,
            countryCode: s.countryCode,
            gstStateCode: (0, gst_state_codes_1.getGstCodeForState)(s.isoCode),
        }));
    }
    getCitiesOfState(countryCode, stateCode) {
        return country_state_city_1.City.getCitiesOfState(countryCode, stateCode).map((c) => ({
            name: c.name,
            stateCode: c.stateCode,
            countryCode: c.countryCode,
        }));
    }
    getGstStateCodes() {
        return gst_state_codes_1.GST_STATE_CODES;
    }
    async checkOperatingArea(tenantId, dto) {
        const hqState = await this.prisma.companyState.findFirst({
            where: { tenantId, isHeadquarter: true, isActive: true },
        });
        const operatingState = await this.prisma.companyState.findFirst({
            where: { tenantId, stateCode: dto.customerStateCode, isActive: true },
            include: {
                cities: {
                    where: { isActive: true },
                    include: { pincodes: { where: { isActive: true } } },
                },
            },
        });
        if (!operatingState) {
            return {
                isInArea: false,
                isSameState: false,
                gstType: 'INTER',
                companyGstStateCode: hqState?.gstStateCode ?? null,
                customerGstStateCode: null,
                message: 'State not in operating area',
            };
        }
        const isSameState = hqState?.stateCode === dto.customerStateCode;
        if (operatingState.coverageType === 'ALL_CITIES') {
            return {
                isInArea: true,
                isSameState,
                gstType: isSameState ? 'INTRA' : 'INTER',
                companyGstStateCode: hqState?.gstStateCode ?? null,
                customerGstStateCode: operatingState.gstStateCode,
                message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
            };
        }
        for (const city of operatingState.cities) {
            if (city.coverageType === 'ALL_PINCODES') {
                return {
                    isInArea: true,
                    isSameState,
                    gstType: isSameState ? 'INTRA' : 'INTER',
                    companyGstStateCode: hqState?.gstStateCode ?? null,
                    customerGstStateCode: operatingState.gstStateCode,
                    message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
                };
            }
            const match = city.pincodes.find((p) => p.pincode === dto.customerPincode);
            if (match) {
                return {
                    isInArea: true,
                    isSameState,
                    gstType: isSameState ? 'INTRA' : 'INTER',
                    companyGstStateCode: hqState?.gstStateCode ?? null,
                    customerGstStateCode: operatingState.gstStateCode,
                    message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
                };
            }
        }
        return {
            isInArea: false,
            isSameState,
            gstType: 'INTER',
            companyGstStateCode: hqState?.gstStateCode ?? null,
            customerGstStateCode: operatingState.gstStateCode,
            message: 'Pincode not in operating area',
        };
    }
    async determineGstType(tenantId, customerStateCode) {
        const hqState = await this.prisma.companyState.findFirst({
            where: { tenantId, isHeadquarter: true, isActive: true },
        });
        const customerState = await this.prisma.companyState.findFirst({
            where: { tenantId, stateCode: customerStateCode, isActive: true },
        });
        return {
            gstType: hqState?.stateCode === customerStateCode ? 'INTRA' : 'INTER',
            companyGstStateCode: hqState?.gstStateCode ?? null,
            customerGstStateCode: customerState?.gstStateCode ?? null,
        };
    }
};
exports.CompanyLocationsService = CompanyLocationsService;
exports.CompanyLocationsService = CompanyLocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyLocationsService);
//# sourceMappingURL=company-locations.service.js.map