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
var ListRolesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRolesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const list_roles_query_1 = require("./list-roles.query");
let ListRolesHandler = ListRolesHandler_1 = class ListRolesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListRolesHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { tenantId: query.tenantId };
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { displayName: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            return this.prisma.identity.role.findMany({
                where,
                orderBy: { level: 'asc' },
                include: { _count: { select: { users: true } } },
            });
        }
        catch (error) {
            this.logger.error(`ListRolesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListRolesHandler = ListRolesHandler;
exports.ListRolesHandler = ListRolesHandler = ListRolesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_roles_query_1.ListRolesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListRolesHandler);
//# sourceMappingURL=list-roles.handler.js.map