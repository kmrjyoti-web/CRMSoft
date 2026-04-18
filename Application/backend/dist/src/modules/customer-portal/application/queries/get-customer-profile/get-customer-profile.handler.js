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
var GetCustomerProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_customer_profile_query_1 = require("./get-customer-profile.query");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
let GetCustomerProfileHandler = GetCustomerProfileHandler_1 = class GetCustomerProfileHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(GetCustomerProfileHandler_1.name);
    }
    async execute(query) {
        try {
            const user = await this.userRepo.findById(query.customerId);
            if (!user)
                throw new common_1.NotFoundException('Customer account not found');
            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                companyName: user.companyName,
                gstin: user.gstin,
                linkedEntityType: user.linkedEntityType,
                linkedEntityId: user.linkedEntityId,
                linkedEntityName: user.linkedEntityName,
                isFirstLogin: user.isFirstLogin,
                loginCount: user.loginCount,
                lastLoginAt: user.lastLoginAt,
            };
        }
        catch (error) {
            this.logger.error(`GetCustomerProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCustomerProfileHandler = GetCustomerProfileHandler;
exports.GetCustomerProfileHandler = GetCustomerProfileHandler = GetCustomerProfileHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_customer_profile_query_1.GetCustomerProfileQuery),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetCustomerProfileHandler);
//# sourceMappingURL=get-customer-profile.handler.js.map