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
var AdminResetCustomerPasswordHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminResetCustomerPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const admin_reset_customer_password_command_1 = require("./admin-reset-customer-password.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const types_1 = require("../../../../../common/types");
let AdminResetCustomerPasswordHandler = AdminResetCustomerPasswordHandler_1 = class AdminResetCustomerPasswordHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(AdminResetCustomerPasswordHandler_1.name);
    }
    async execute(command) {
        try {
            const user = await this.userRepo.findById(command.customerUserId);
            if (!user)
                throw new common_1.NotFoundException('Portal user not found');
            const newPassword = this.generatePassword();
            const result = await user.resetPassword(newPassword);
            if ((0, types_1.isErr)(result))
                throw new Error(result.error.message);
            await this.userRepo.update(user);
            this.logger.log(`[ADMIN RESET] New password for ${user.email}: ${newPassword}`);
            return {
                email: user.email,
                newPassword,
                message: `Password reset. New credentials sent to ${user.email}`,
            };
        }
        catch (error) {
            this.logger.error(`AdminResetCustomerPasswordHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    generatePassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
        return Array.from(crypto.randomBytes(10))
            .map((b) => chars[b % chars.length])
            .join('');
    }
};
exports.AdminResetCustomerPasswordHandler = AdminResetCustomerPasswordHandler;
exports.AdminResetCustomerPasswordHandler = AdminResetCustomerPasswordHandler = AdminResetCustomerPasswordHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(admin_reset_customer_password_command_1.AdminResetCustomerPasswordCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], AdminResetCustomerPasswordHandler);
//# sourceMappingURL=admin-reset-customer-password.handler.js.map