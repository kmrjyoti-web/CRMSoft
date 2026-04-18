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
exports.ContactRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const contact_mapper_1 = require("../mappers/contact.mapper");
let ContactRepository = class ContactRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.working.contact.findUnique({ where: { id } });
        return record ? contact_mapper_1.ContactMapper.toDomain(record) : null;
    }
    async save(entity) {
        const data = contact_mapper_1.ContactMapper.toPersistence(entity);
        await this.prisma.working.contact.upsert({
            where: { id: entity.id },
            create: data,
            update: data,
        });
    }
    async delete(id) {
        await this.prisma.working.contact.delete({ where: { id } });
    }
};
exports.ContactRepository = ContactRepository;
exports.ContactRepository = ContactRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactRepository);
//# sourceMappingURL=contact.repository.js.map