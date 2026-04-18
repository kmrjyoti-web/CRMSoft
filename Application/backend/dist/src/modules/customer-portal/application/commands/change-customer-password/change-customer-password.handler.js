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
var ChangeCustomerPasswordHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeCustomerPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const change_customer_password_command_1 = require("./change-customer-password.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
const types_1 = require("../../../../../common/types");
let ChangeCustomerPasswordHandler = ChangeCustomerPasswordHandler_1 = class ChangeCustomerPasswordHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(ChangeCustomerPasswordHandler_1.name);
    }
    async execute(command) {
        try {
            const { customerId, currentPassword, newPassword } = command;
            const user = await this.userRepo.findById(customerId);
            if (!user)
                throw new common_1.NotFoundException('Customer account not found');
            const valid = await user.validatePassword(currentPassword);
            if (!valid)
                throw new common_1.UnauthorizedException('Current password is incorrect');
            const result = await user.resetPassword(newPassword);
            if ((0, types_1.isErr)(result))
                throw new common_1.BadRequestException(result.error.message);
            await this.userRepo.update(user);
            return { message: 'Password changed successfully' };
        }
        catch (error) {
            this.logger.error(`ChangeCustomerPasswordHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChangeCustomerPasswordHandler = ChangeCustomerPasswordHandler;
exports.ChangeCustomerPasswordHandler = ChangeCustomerPasswordHandler = ChangeCustomerPasswordHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(change_customer_password_command_1.ChangeCustomerPasswordCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ChangeCustomerPasswordHandler);
//# sourceMappingURL=change-customer-password.handler.js.map