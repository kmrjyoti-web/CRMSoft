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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let LocationService = class LocationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId) {
        return this.prisma.working.stockLocation.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.working.stockLocation.findUnique({
            where: { tenantId_code: { tenantId, code: dto.code } },
        });
        if (existing)
            throw new common_1.BadRequestException(`Location code "${dto.code}" already exists`);
        if (dto.isDefault) {
            await this.prisma.working.stockLocation.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const mainLocation = await this.prisma.working.stockLocation.create({
            data: { tenantId, ...dto },
        });
        const subStores = [
            { suffix: '-E', name: `${dto.name} (Expiry)`, type: 'EXPIRY_STORE' },
            { suffix: '-S', name: `${dto.name} (Scrap)`, type: 'SCRAP_STORE' },
        ];
        for (const sub of subStores) {
            const subCode = `${dto.code}${sub.suffix}`;
            const existing = await this.prisma.working.stockLocation.findUnique({
                where: { tenantId_code: { tenantId, code: subCode } },
            });
            if (!existing) {
                await this.prisma.working.stockLocation.create({
                    data: {
                        tenantId,
                        name: sub.name,
                        code: subCode,
                        type: sub.type,
                        address: dto.address,
                        city: dto.city,
                        state: dto.state,
                        pincode: dto.pincode,
                        parentLocationId: mainLocation.id,
                    },
                });
            }
        }
        return mainLocation;
    }
    async update(tenantId, id, dto) {
        const loc = await this.prisma.working.stockLocation.findFirst({ where: { id, tenantId } });
        if (!loc)
            throw new common_1.NotFoundException('Location not found');
        if (dto.isDefault) {
            await this.prisma.working.stockLocation.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.working.stockLocation.update({
            where: { id },
            data: dto,
        });
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationService);
//# sourceMappingURL=location.service.js.map