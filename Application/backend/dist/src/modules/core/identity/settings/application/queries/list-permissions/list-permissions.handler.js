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
var ListPermissionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPermissionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const list_permissions_query_1 = require("./list-permissions.query");
let ListPermissionsHandler = ListPermissionsHandler_1 = class ListPermissionsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListPermissionsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.module)
                where.module = query.module;
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { displayName: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            return this.prisma.identity.permission.findMany({
                where,
                orderBy: [{ module: 'asc' }, { action: 'asc' }],
            });
        }
        catch (error) {
            this.logger.error(`ListPermissionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListPermissionsHandler = ListPermissionsHandler;
exports.ListPermissionsHandler = ListPermissionsHandler = ListPermissionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_permissions_query_1.ListPermissionsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListPermissionsHandler);
//# sourceMappingURL=list-permissions.handler.js.map