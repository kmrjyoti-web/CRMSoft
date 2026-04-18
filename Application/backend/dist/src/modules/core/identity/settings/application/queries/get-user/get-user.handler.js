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
var GetUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_user_query_1 = require("./get-user.query");
let GetUserHandler = GetUserHandler_1 = class GetUserHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetUserHandler_1.name);
    }
    async execute(query) {
        try {
            const user = await this.prisma.identity.user.findFirst({
                where: { id: query.userId, tenantId: query.tenantId },
                include: { role: true, department: true, designation: true },
            });
            if (!user)
                throw new common_1.NotFoundException(`User ${query.userId} not found`);
            const { password, ...safe } = user;
            return safe;
        }
        catch (error) {
            this.logger.error(`GetUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetUserHandler = GetUserHandler;
exports.GetUserHandler = GetUserHandler = GetUserHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_user_query_1.GetUserQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetUserHandler);
//# sourceMappingURL=get-user.handler.js.map