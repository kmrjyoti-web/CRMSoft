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
exports.SaleMasterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let SaleMasterService = class SaleMasterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.working.saleMaster.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    async findById(tenantId, id) {
        const sm = await this.prisma.working.saleMaster.findFirst({ where: { tenantId, id } });
        if (!sm)
            throw new common_1.NotFoundException('Sale master not found');
        return sm;
    }
    async create(tenantId, data) {
        const existing = await this.prisma.working.saleMaster.findFirst({ where: { tenantId, code: data.code } });
        if (existing)
            throw new common_1.BadRequestException(`Sale master code "${data.code}" already exists`);
        if (data.isDefault) {
            await this.prisma.working.saleMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
        }
        return this.prisma.working.saleMaster.create({ data: { tenantId, ...data } });
    }
    async update(tenantId, id, data) {
        const sm = await this.prisma.working.saleMaster.findFirst({ where: { tenantId, id } });
        if (!sm)
            throw new common_1.NotFoundException('Sale master not found');
        if (data.isDefault) {
            await this.prisma.working.saleMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
        }
        return this.prisma.working.saleMaster.update({ where: { id }, data });
    }
    async delete(tenantId, id) {
        const sm = await this.prisma.working.saleMaster.findFirst({ where: { tenantId, id } });
        if (!sm)
            throw new common_1.NotFoundException('Sale master not found');
        return this.prisma.working.saleMaster.update({ where: { id }, data: { isActive: false } });
    }
};
exports.SaleMasterService = SaleMasterService;
exports.SaleMasterService = SaleMasterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SaleMasterService);
//# sourceMappingURL=sale-master.service.js.map