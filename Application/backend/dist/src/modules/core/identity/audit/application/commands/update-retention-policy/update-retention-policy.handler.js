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
var UpdateRetentionPolicyHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRetentionPolicyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_retention_policy_command_1 = require("./update-retention-policy.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let UpdateRetentionPolicyHandler = UpdateRetentionPolicyHandler_1 = class UpdateRetentionPolicyHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateRetentionPolicyHandler_1.name);
    }
    async execute(command) {
        try {
            const existing = await this.prisma.identity.auditRetentionPolicy.findFirst({
                where: { entityType: command.entityType },
            });
            if (existing) {
                return this.prisma.identity.auditRetentionPolicy.update({
                    where: { id: existing.id },
                    data: {
                        retentionDays: command.retentionDays,
                        ...(command.archiveEnabled !== undefined && { archiveEnabled: command.archiveEnabled }),
                        ...(command.isActive !== undefined && { isActive: command.isActive }),
                    },
                });
            }
            else {
                return this.prisma.identity.auditRetentionPolicy.create({
                    data: {
                        entityType: command.entityType,
                        retentionDays: command.retentionDays,
                        archiveEnabled: command.archiveEnabled ?? false,
                        isActive: command.isActive ?? true,
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`UpdateRetentionPolicyHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateRetentionPolicyHandler = UpdateRetentionPolicyHandler;
exports.UpdateRetentionPolicyHandler = UpdateRetentionPolicyHandler = UpdateRetentionPolicyHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_retention_policy_command_1.UpdateRetentionPolicyCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateRetentionPolicyHandler);
//# sourceMappingURL=update-retention-policy.handler.js.map