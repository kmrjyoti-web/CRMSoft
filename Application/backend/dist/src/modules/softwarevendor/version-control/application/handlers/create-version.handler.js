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
var CreateVersionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVersionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_version_command_1 = require("../commands/create-version.command");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CreateVersionHandler = CreateVersionHandler_1 = class CreateVersionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateVersionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.platform.appVersion.findUnique({
                where: { version: cmd.version },
            });
            if (existing) {
                throw new common_1.ConflictException(`Version ${cmd.version} already exists`);
            }
            return this.prisma.platform.appVersion.create({
                data: {
                    version: cmd.version,
                    releaseType: cmd.releaseType,
                    status: 'DRAFT',
                    changelog: cmd.changelog ?? [],
                    breakingChanges: cmd.breakingChanges ?? [],
                    migrationNotes: cmd.migrationNotes,
                    codeName: cmd.codeName,
                    gitBranch: cmd.gitBranch,
                },
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`CreateVersionHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.CreateVersionHandler = CreateVersionHandler;
exports.CreateVersionHandler = CreateVersionHandler = CreateVersionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_version_command_1.CreateVersionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateVersionHandler);
//# sourceMappingURL=create-version.handler.js.map