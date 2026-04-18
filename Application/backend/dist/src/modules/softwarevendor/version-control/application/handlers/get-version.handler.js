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
var GetVersionHandler_1, GetCurrentVersionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentVersionHandler = exports.GetVersionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_version_query_1 = require("../queries/get-version.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let GetVersionHandler = GetVersionHandler_1 = class GetVersionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetVersionHandler_1.name);
    }
    async execute(query) {
        try {
            const version = await this.prisma.platform.appVersion.findUnique({
                where: { id: query.id },
                include: { patches: true },
            });
            if (!version)
                throw new common_1.NotFoundException(`Version ${query.id} not found`);
            return version;
        }
        catch (error) {
            const err = error;
            this.logger.error(`GetVersionHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.GetVersionHandler = GetVersionHandler;
exports.GetVersionHandler = GetVersionHandler = GetVersionHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_version_query_1.GetVersionQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetVersionHandler);
let GetCurrentVersionHandler = GetCurrentVersionHandler_1 = class GetCurrentVersionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetCurrentVersionHandler_1.name);
    }
    async execute(_query) {
        try {
            const version = await this.prisma.platform.appVersion.findFirst({
                where: { status: 'LIVE' },
                orderBy: { deployedAt: 'desc' },
            });
            return version ?? { status: 'NO_LIVE_VERSION', message: 'No version is currently LIVE' };
        }
        catch (error) {
            const err = error;
            this.logger.error(`GetCurrentVersionHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.GetCurrentVersionHandler = GetCurrentVersionHandler;
exports.GetCurrentVersionHandler = GetCurrentVersionHandler = GetCurrentVersionHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_version_query_1.GetCurrentVersionQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetCurrentVersionHandler);
//# sourceMappingURL=get-version.handler.js.map