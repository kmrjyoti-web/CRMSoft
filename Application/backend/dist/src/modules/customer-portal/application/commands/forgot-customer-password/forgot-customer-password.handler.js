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
var ForgotCustomerPasswordHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotCustomerPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const forgot_customer_password_command_1 = require("./forgot-customer-password.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let ForgotCustomerPasswordHandler = ForgotCustomerPasswordHandler_1 = class ForgotCustomerPasswordHandler {
    constructor(userRepo, prisma) {
        this.userRepo = userRepo;
        this.prisma = prisma;
        this.logger = new common_1.Logger(ForgotCustomerPasswordHandler_1.name);
    }
    async execute(command) {
        try {
            const { email, tenantId } = command;
            const user = await this.userRepo.findByEmail(tenantId, email);
            if (!user || !user.isActive) {
                return { message: 'If that email exists, a reset link has been sent.' };
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.setPasswordResetToken(resetToken);
            await this.userRepo.update(user);
            this.logger.log(`[CUSTOMER PORTAL] Password reset token for ${email}: ${resetToken}`);
            return { message: 'If that email exists, a reset link has been sent.' };
        }
        catch (error) {
            this.logger.error(`ForgotCustomerPasswordHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ForgotCustomerPasswordHandler = ForgotCustomerPasswordHandler;
exports.ForgotCustomerPasswordHandler = ForgotCustomerPasswordHandler = ForgotCustomerPasswordHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(forgot_customer_password_command_1.ForgotCustomerPasswordCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], ForgotCustomerPasswordHandler);
//# sourceMappingURL=forgot-customer-password.handler.js.map