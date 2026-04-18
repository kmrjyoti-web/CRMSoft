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
exports.OrganizationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const organization_mapper_1 = require("../mappers/organization.mapper");
let OrganizationRepository = class OrganizationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.working.organization.findUnique({ where: { id } });
        return record ? organization_mapper_1.OrganizationMapper.toDomain(record) : null;
    }
    async findByName(name) {
        const record = await this.prisma.working.organization.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
        return record ? organization_mapper_1.OrganizationMapper.toDomain(record) : null;
    }
    async save(entity) {
        const data = organization_mapper_1.OrganizationMapper.toPersistence(entity);
        await this.prisma.working.organization.upsert({
            where: { id: entity.id },
            create: data,
            update: data,
        });
    }
    async delete(id) {
        await this.prisma.working.organization.delete({ where: { id } });
    }
};
exports.OrganizationRepository = OrganizationRepository;
exports.OrganizationRepository = OrganizationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationRepository);
//# sourceMappingURL=organization.repository.js.map