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
exports.CommunicationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const communication_mapper_1 = require("../mappers/communication.mapper");
let CommunicationRepository = class CommunicationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.working.communication.findUnique({ where: { id } });
        return record ? communication_mapper_1.CommunicationMapper.toDomain(record) : null;
    }
    async save(entity) {
        const data = communication_mapper_1.CommunicationMapper.toPersistence(entity);
        await this.prisma.working.communication.upsert({
            where: { id: entity.id },
            create: data,
            update: data,
        });
    }
    async delete(id) {
        await this.prisma.working.communication.delete({ where: { id } });
    }
    async findPrimaryByEntity(entityField, entityId, type) {
        const where = { [entityField]: entityId, type, isPrimary: true };
        const record = await this.prisma.working.communication.findFirst({ where });
        return record ? communication_mapper_1.CommunicationMapper.toDomain(record) : null;
    }
};
exports.CommunicationRepository = CommunicationRepository;
exports.CommunicationRepository = CommunicationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationRepository);
//# sourceMappingURL=communication.repository.js.map