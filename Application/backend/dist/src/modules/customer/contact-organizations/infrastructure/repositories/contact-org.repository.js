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
exports.ContactOrgRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const contact_org_mapper_1 = require("../mappers/contact-org.mapper");
let ContactOrgRepository = class ContactOrgRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.working.contactOrganization.findUnique({ where: { id } });
        return record ? contact_org_mapper_1.ContactOrgMapper.toDomain(record) : null;
    }
    async findByContactAndOrg(contactId, organizationId) {
        const record = await this.prisma.working.contactOrganization.findFirst({
            where: { contactId, organizationId },
        });
        return record ? contact_org_mapper_1.ContactOrgMapper.toDomain(record) : null;
    }
    async save(entity) {
        const data = contact_org_mapper_1.ContactOrgMapper.toPersistence(entity);
        await this.prisma.working.contactOrganization.upsert({
            where: { id: entity.id },
            create: data,
            update: data,
        });
    }
    async delete(id) {
        await this.prisma.working.contactOrganization.delete({ where: { id } });
    }
};
exports.ContactOrgRepository = ContactOrgRepository;
exports.ContactOrgRepository = ContactOrgRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactOrgRepository);
//# sourceMappingURL=contact-org.repository.js.map