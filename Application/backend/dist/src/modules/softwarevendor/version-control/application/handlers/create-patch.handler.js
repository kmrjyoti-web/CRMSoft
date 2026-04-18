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
var CreatePatchHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePatchHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_patch_command_1 = require("../commands/create-patch.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CreatePatchHandler = CreatePatchHandler_1 = class CreatePatchHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreatePatchHandler_1.name);
    }
    async execute(cmd) {
        try {
            const version = await this.prisma.platform.appVersion.findUnique({
                where: { id: cmd.versionId },
            });
            if (!version)
                throw new common_1.NotFoundException(`Version ${cmd.versionId} not found`);
            const existing = await this.prisma.platform.industryPatch.findFirst({
                where: { versionId: cmd.versionId, industryCode: cmd.industryCode, patchName: cmd.patchName },
            });
            if (existing) {
                throw new common_1.ConflictException(`Patch ${cmd.patchName} already exists for this version and industry`);
            }
            return this.prisma.platform.industryPatch.create({
                data: {
                    versionId: cmd.versionId,
                    industryCode: cmd.industryCode,
                    patchName: cmd.patchName,
                    description: cmd.description,
                    schemaChanges: cmd.schemaChanges ?? null,
                    configOverrides: cmd.configOverrides ?? null,
                    menuOverrides: cmd.menuOverrides ?? null,
                    forceUpdate: cmd.forceUpdate ?? false,
                    status: 'PENDING',
                },
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`CreatePatchHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.CreatePatchHandler = CreatePatchHandler;
exports.CreatePatchHandler = CreatePatchHandler = CreatePatchHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_patch_command_1.CreatePatchCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatePatchHandler);
//# sourceMappingURL=create-patch.handler.js.map