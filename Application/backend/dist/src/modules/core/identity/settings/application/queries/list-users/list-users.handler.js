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
var ListUsersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const list_users_query_1 = require("./list-users.query");
let ListUsersHandler = ListUsersHandler_1 = class ListUsersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListUsersHandler_1.name);
    }
    async execute(query) {
        try {
            const take = Math.min(query.limit, 10000);
            const skip = (query.page - 1) * take;
            const where = { tenantId: query.tenantId, isDeleted: false };
            if (query.status)
                where.status = query.status;
            if (query.userType)
                where.userType = query.userType;
            if (query.roleId)
                where.roleId = query.roleId;
            if (query.search) {
                where.OR = [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.identity.user.findMany({
                    where, skip, take, orderBy: { createdAt: 'desc' },
                    include: { role: true, department: true, designation: true },
                }),
                this.prisma.identity.user.count({ where }),
            ]);
            const safe = data.map(({ password, ...u }) => u);
            return { data: safe, meta: { total, page: query.page, limit: take } };
        }
        catch (error) {
            this.logger.error(`ListUsersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListUsersHandler = ListUsersHandler;
exports.ListUsersHandler = ListUsersHandler = ListUsersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_users_query_1.ListUsersQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListUsersHandler);
//# sourceMappingURL=list-users.handler.js.map