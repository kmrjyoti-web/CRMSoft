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
var PublishVersionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishVersionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const publish_version_command_1 = require("../commands/publish-version.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PublishVersionHandler = PublishVersionHandler_1 = class PublishVersionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PublishVersionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const version = await this.prisma.platform.appVersion.findUnique({
                where: { id: cmd.versionId },
            });
            if (!version)
                throw new common_1.NotFoundException(`Version ${cmd.versionId} not found`);
            if (version.status === 'LIVE') {
                throw new common_1.BadRequestException('Version is already LIVE');
            }
            await this.prisma.identity.versionBackup.create({
                data: {
                    versionId: cmd.versionId,
                    backupType: 'PRE_DEPLOY',
                    status: 'COMPLETED',
                    gitTag: cmd.gitTag ?? `v${version.version}`,
                    configSnapshot: { publishedBy: cmd.publishedBy, publishedAt: new Date() },
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
                    deployedAt: new Date(),
                    deployedBy: cmd.publishedBy,
                    gitTag: cmd.gitTag,
                    gitCommitHash: cmd.gitCommitHash,
                },
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`PublishVersionHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.PublishVersionHandler = PublishVersionHandler;
exports.PublishVersionHandler = PublishVersionHandler = PublishVersionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(publish_version_command_1.PublishVersionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublishVersionHandler);
//# sourceMappingURL=publish-version.handler.js.map