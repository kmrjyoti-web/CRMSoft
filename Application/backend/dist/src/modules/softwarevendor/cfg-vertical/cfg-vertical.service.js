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
var CfgVerticalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CfgVerticalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let CfgVerticalService = CfgVerticalService_1 = class CfgVerticalService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CfgVerticalService_1.name);
    }
    async listAll() {
        try {
            return await this.prisma.platform.gvCfgVertical.findMany({
                include: { modules: true },
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to list verticals', error);
            throw error;
        }
    }
    async findActive() {
        try {
            return await this.prisma.platform.gvCfgVertical.findMany({
                where: { isActive: true },
                include: { modules: true },
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to list active verticals', error);
            throw error;
        }
    }
    async findBuilt() {
        try {
            return await this.prisma.platform.gvCfgVertical.findMany({
                where: { isBuilt: true },
                include: { modules: true },
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to list built verticals', error);
            throw error;
        }
    }
    async findByCode(code) {
        try {
            const vertical = await this.prisma.platform.gvCfgVertical.findUnique({
                where: { code },
                include: { modules: true },
            });
            if (!vertical) {
                throw new common_1.NotFoundException(`Vertical with code '${code}' not found`);
            }
            return vertical;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            this.logger.error(`Failed to find vertical by code: ${code}`, error);
            throw error;
        }
    }
};
exports.CfgVerticalService = CfgVerticalService;
exports.CfgVerticalService = CfgVerticalService = CfgVerticalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CfgVerticalService);
//# sourceMappingURL=cfg-vertical.service.js.map