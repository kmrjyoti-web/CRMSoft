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
var RollbackVersionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackVersionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const rollback_version_command_1 = require("../commands/rollback-version.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let RollbackVersionHandler = RollbackVersionHandler_1 = class RollbackVersionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RollbackVersionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const version = await this.prisma.platform.appVersion.findUnique({
                where: { id: cmd.versionId },
            });
            if (!version)
                throw new common_1.NotFoundException(`Version ${cmd.versionId} not found`);
            await this.prisma.identity.versionBackup.create({
                data: {
                    versionId: cmd.versionId,
                    backupType: 'MANUAL',
                    status: 'COMPLETED',
                    configSnapshot: {
                        type: 'pre-rollback',
                        rolledBackBy: cmd.rolledBackBy,
                        reason: cmd.rollbackReason,
                        at: new Date(),
                    },
                },
            });
            await this.prisma.platform.appVersion.updateMany({
                where: { status: 'LIVE' },
                data: { status: 'DEPRECATED' },
            });
            return this.prisma.platform.appVersion.update({
                where: { id: cmd.versionId },
                data: {
                    status: 'LIVE',
                    rollbackAt: new Date(),
                    rollbackReason: cmd.rollbackReason,
                    deployedAt: new Date(),
                    deployedBy: cmd.rolledBackBy,
                },
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`RollbackVersionHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.RollbackVersionHandler = RollbackVersionHandler;
exports.RollbackVersionHandler = RollbackVersionHandler = RollbackVersionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(rollback_version_command_1.RollbackVersionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RollbackVersionHandler);
//# sourceMappingURL=rollback-version.handler.js.map