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
var ResetCustomerPasswordHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCustomerPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reset_customer_password_command_1 = require("./reset-customer-password.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const types_1 = require("../../../../../common/types");
let ResetCustomerPasswordHandler = ResetCustomerPasswordHandler_1 = class ResetCustomerPasswordHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(ResetCustomerPasswordHandler_1.name);
    }
    async execute(command) {
        try {
            const { token, newPassword } = command;
            const user = await this.userRepo.findByPasswordResetToken(token);
            if (!user)
                throw new common_1.BadRequestException('Invalid or expired reset token');
            if (!user.passwordResetExp || new Date() > user.passwordResetExp) {
                throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
            }
            const result = await user.resetPassword(newPassword);
            if ((0, types_1.isErr)(result))
                throw new common_1.BadRequestException(result.error.message);
            await this.userRepo.update(user);
            return { message: 'Password reset successfully. You can now log in.' };
        }
        catch (error) {
            this.logger.error(`ResetCustomerPasswordHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ResetCustomerPasswordHandler = ResetCustomerPasswordHandler;
exports.ResetCustomerPasswordHandler = ResetCustomerPasswordHandler = ResetCustomerPasswordHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reset_customer_password_command_1.ResetCustomerPasswordCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ResetCustomerPasswordHandler);
//# sourceMappingURL=reset-customer-password.handler.js.map