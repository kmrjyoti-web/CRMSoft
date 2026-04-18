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
var GetRoleHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_role_query_1 = require("./get-role.query");
let GetRoleHandler = GetRoleHandler_1 = class GetRoleHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRoleHandler_1.name);
    }
    async execute(query) {
        try {
            const role = await this.prisma.identity.role.findFirst({
                where: { id: query.roleId, tenantId: query.tenantId },
                include: {
                    permissions: { include: { permission: true } },
                    _count: { select: { users: true } },
                },
            });
            if (!role)
                throw new common_1.NotFoundException(`Role ${query.roleId} not found`);
            return { ...role, permissions: role.permissions.map((rp) => rp.permission) };
        }
        catch (error) {
            this.logger.error(`GetRoleHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRoleHandler = GetRoleHandler;
exports.GetRoleHandler = GetRoleHandler = GetRoleHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_role_query_1.GetRoleQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRoleHandler);
//# sourceMappingURL=get-role.handler.js.map