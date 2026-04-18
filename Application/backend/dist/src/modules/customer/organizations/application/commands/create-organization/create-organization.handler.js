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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CreateOrganizationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_organization_command_1 = require("./create-organization.command");
const organization_entity_1 = require("../../../domain/entities/organization.entity");
const organization_repository_interface_1 = require("../../../domain/interfaces/organization-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateOrganizationHandler = CreateOrganizationHandler_1 = class CreateOrganizationHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateOrganizationHandler_1.name);
    }
    async execute(command) {
        try {
            const existing = await this.repo.findByName(command.name.trim());
            if (existing) {
                throw new common_1.ConflictException(`Organization "${command.name}" already exists`);
            }
            const org = organization_entity_1.OrganizationEntity.create((0, crypto_1.randomUUID)(), {
                name: command.name,
                tenantId: command.tenantId,
                website: command.website,
                email: command.email,
                phone: command.phone,
                gstNumber: command.gstNumber,
                address: command.address,
                city: command.city,
                state: command.state,
                country: command.country,
                pincode: command.pincode,
                industry: command.industry,
                annualRevenue: command.annualRevenue,
                notes: command.notes,
                createdById: command.createdById,
            });
            const withEvents = this.publisher.mergeObjectContext(org);
            await this.repo.save(withEvents);
            if (command.filterIds?.length) {
                await this.prisma.working.organizationFilter.createMany({
                    data: command.filterIds.map(fid => ({
                        organizationId: org.id,
                        lookupValueId: fid,
                    })),
                    skipDuplicates: true,
                });
            }
            withEvents.commit();
            this.logger.log(`Organization created: ${org.id} (${org.name})`);
            return org.id;
        }
        catch (error) {
            this.logger.error(`CreateOrganizationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateOrganizationHandler = CreateOrganizationHandler;
exports.CreateOrganizationHandler = CreateOrganizationHandler = CreateOrganizationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_organization_command_1.CreateOrganizationCommand),
    __param(0, (0, common_1.Inject)(organization_repository_interface_1.ORGANIZATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], CreateOrganizationHandler);
//# sourceMappingURL=create-organization.handler.js.map