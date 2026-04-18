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
var ActivatePortalHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivatePortalHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const activate_portal_command_1 = require("./activate-portal.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const customer_user_entity_1 = require("../../../domain/entities/customer-user.entity");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const types_1 = require("../../../../../common/types");
let ActivatePortalHandler = ActivatePortalHandler_1 = class ActivatePortalHandler {
    constructor(userRepo, prisma) {
        this.userRepo = userRepo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(ActivatePortalHandler_1.name);
    }
    async execute(command) {
        try {
            const { tenantId, adminId, entityType, entityId, menuCategoryId } = command;
            const existing = await this.userRepo.findByLinkedEntity(tenantId, entityType, entityId);
            if (existing && !existing.isDeleted) {
                throw new common_1.ConflictException('Portal login already activated for this entity');
            }
            const workingClient = await this.prisma.getWorkingClient(tenantId);
            const { name, email, phone } = await this.resolveEntity(workingClient, tenantId, entityType, entityId);
            if (!email) {
                throw new common_1.BadRequestException(`This ${entityType.toLowerCase()} has no email address. Add an email before activating portal access.`);
            }
            let resolvedCategoryId = menuCategoryId;
            if (!resolvedCategoryId) {
                const defaultCat = await this.prisma.identity.customerMenuCategory.findFirst({
                    where: { tenantId, isDefault: true, isActive: true, isDeleted: false },
                });
                resolvedCategoryId = defaultCat?.id;
            }
            const tempPassword = this.generateTempPassword();
            const result = await customer_user_entity_1.CustomerUserEntity.create((0, uuid_1.v4)(), tenantId, {
                email,
                phone: phone ?? undefined,
                linkedEntityType: entityType,
                linkedEntityId: entityId,
                linkedEntityName: name,
                displayName: name,
                menuCategoryId: resolvedCategoryId,
                isActive: true,
                password: tempPassword,
                createdById: adminId,
            });
            if ((0, types_1.isErr)(result))
                throw new common_1.BadRequestException(result.error.message);
            if (!(0, types_1.isOk)(result))
                throw new common_1.BadRequestException('Failed to create customer user');
            const saveResult = await this.userRepo.save(result.data);
            if ((0, types_1.isErr)(saveResult))
                throw new common_1.BadRequestException(saveResult.error.message);
            if (!(0, types_1.isOk)(saveResult))
                throw new common_1.BadRequestException('Failed to save customer user');
            const customer = saveResult.data;
            this.logger.log(`[CUSTOMER PORTAL] Activated for ${email} (${entityType}:${entityId}). Temp password: ${tempPassword}`);
            return {
                customerUserId: customer.id,
                email: customer.email,
                tempPassword,
                message: `Portal access activated. Credentials sent to ${email}`,
            };
        }
        catch (error) {
            this.logger.error(`ActivatePortalHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolveEntity(workingClient, tenantId, entityType, entityId) {
        switch (entityType) {
            case 'CONTACT': {
                const contact = await workingClient.contact.findFirst({
                    where: { id: entityId, tenantId, isDeleted: false },
                    include: {
                        communications: {
                            where: { type: 'EMAIL' },
                            take: 1,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                });
                if (!contact)
                    throw new common_1.NotFoundException('Contact not found');
                if (contact.entityVerificationStatus !== 'VERIFIED') {
                    throw new common_1.BadRequestException('Contact must be verified before activating portal access');
                }
                return {
                    name: `${contact.firstName} ${contact.lastName}`.trim(),
                    email: contact.communications?.[0]?.value ?? null,
                    phone: null,
                };
            }
            case 'ORGANIZATION': {
                const org = await workingClient.organization.findFirst({
                    where: { id: entityId, tenantId, isDeleted: false },
                });
                if (!org)
                    throw new common_1.NotFoundException('Organization not found');
                if (org.entityVerificationStatus !== 'VERIFIED') {
                    throw new common_1.BadRequestException('Organization must be verified before activating portal access');
                }
                return { name: org.name, email: org.email ?? null, phone: org.phone ?? null };
            }
            case 'LEDGER': {
                const ledger = await workingClient.ledgerMaster.findFirst({
                    where: { id: entityId, tenantId },
                });
                if (!ledger)
                    throw new common_1.NotFoundException('Ledger entry not found');
                return { name: ledger.name, email: ledger.email ?? null, phone: null };
            }
            default:
                throw new common_1.BadRequestException(`Unknown entity type: ${entityType}`);
        }
    }
    generateTempPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
        return Array.from(crypto.randomBytes(10))
            .map((b) => chars[b % chars.length])
            .join('');
    }
};
exports.ActivatePortalHandler = ActivatePortalHandler;
exports.ActivatePortalHandler = ActivatePortalHandler = ActivatePortalHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(activate_portal_command_1.ActivatePortalCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], ActivatePortalHandler);
//# sourceMappingURL=activate-portal.handler.js.map