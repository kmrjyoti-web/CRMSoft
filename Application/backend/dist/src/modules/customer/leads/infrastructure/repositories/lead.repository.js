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
exports.LeadRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const lead_mapper_1 = require("../mappers/lead.mapper");
let LeadRepository = class LeadRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.working.lead.findUnique({ where: { id } });
        return record ? lead_mapper_1.LeadMapper.toDomain(record) : null;
    }
    async save(entity, tx) {
        const data = lead_mapper_1.LeadMapper.toPersistence(entity);
        const client = tx || this.prisma;
        await client.lead.upsert({
            where: { id: entity.id },
            create: data,
            update: data,
        });
    }
    async delete(id) {
        await this.prisma.working.lead.delete({ where: { id } });
    }
    async nextLeadNumber(tx) {
        const client = tx || this.prisma;
        const count = await client.lead.count();
        const next = count + 1;
        return `LD-${String(next).padStart(5, '0')}`;
    }
};
exports.LeadRepository = LeadRepository;
exports.LeadRepository = LeadRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadRepository);
//# sourceMappingURL=lead.repository.js.map