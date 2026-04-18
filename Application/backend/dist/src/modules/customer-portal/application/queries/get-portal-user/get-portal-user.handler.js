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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GetPortalUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPortalUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_portal_user_query_1 = require("./get-portal-user.query");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let GetPortalUserHandler = GetPortalUserHandler_1 = class GetPortalUserHandler {
    constructor(userRepo, prisma) {
        this.userRepo = userRepo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPortalUserHandler_1.name);
    }
    async execute(query) {
        try {
            const user = await this.userRepo.findById(query.id);
            if (!user)
                throw new common_1.NotFoundException('Portal user not found');
            let menuCategory = null;
            if (user.menuCategoryId) {
                menuCategory = await this.prisma.identity.customerMenuCategory.findUnique({
                    where: { id: user.menuCategoryId },
                    select: { id: true, name: true, nameHi: true, icon: true, color: true, enabledRoutes: true },
                });
            }
            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                displayName: user.displayName,
                companyName: user.companyName,
                linkedEntityType: user.linkedEntityType,
                linkedEntityId: user.linkedEntityId,
                linkedEntityName: user.linkedEntityName,
                isActive: user.isActive,
                isFirstLogin: user.isFirstLogin,
                loginCount: user.loginCount,
                lastLoginAt: user.lastLoginAt,
                pageOverrides: user.pageOverrides,
                menuCategory,
                createdAt: user.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`GetPortalUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPortalUserHandler = GetPortalUserHandler;
exports.GetPortalUserHandler = GetPortalUserHandler = GetPortalUserHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_portal_user_query_1.GetPortalUserQuery),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], GetPortalUserHandler);
//# sourceMappingURL=get-portal-user.handler.js.map