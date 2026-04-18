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
exports.ServiceVisitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ServiceVisitService = class ServiceVisitService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.serviceVisitLog.count({ where: { tenantId } });
        return `SV-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.serviceVisitLog.findMany({
            where: {
                tenantId,
                ...(filters?.customerId && { customerId: filters.customerId }),
                ...(filters?.sourceType && { sourceType: filters.sourceType }),
                ...(filters?.status && { status: filters.status }),
            },
            include: { charges: true },
            orderBy: { visitDate: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const visit = await this.prisma.working.serviceVisitLog.findFirst({
            where: { id, tenantId },
            include: { charges: true },
        });
        if (!visit)
            throw new common_1.NotFoundException('Service visit not found');
        return visit;
    }
    async create(tenantId, dto) {
        const visitNumber = await this.generateNumber(tenantId);
        return this.prisma.working.serviceVisitLog.create({
            data: { ...dto, tenantId, visitNumber },
            include: { charges: true },
        });
    }
    async update(tenantId, id, dto) {
        const visit = await this.prisma.working.serviceVisitLog.findFirst({ where: { id, tenantId } });
        if (!visit)
            throw new common_1.NotFoundException('Visit not found');
        return this.prisma.working.serviceVisitLog.update({
            where: { id },
            data: dto,
            include: { charges: true },
        });
    }
};
exports.ServiceVisitService = ServiceVisitService;
exports.ServiceVisitService = ServiceVisitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceVisitService);
//# sourceMappingURL=service-visit.service.js.map