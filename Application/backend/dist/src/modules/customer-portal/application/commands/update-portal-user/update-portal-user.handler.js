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
var UpdatePortalUserHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePortalUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_portal_user_command_1 = require("./update-portal-user.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
let UpdatePortalUserHandler = UpdatePortalUserHandler_1 = class UpdatePortalUserHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(UpdatePortalUserHandler_1.name);
    }
    async execute(command) {
        try {
            const { customerUserId, menuCategoryId, pageOverrides, isActive } = command;
            const user = await this.userRepo.findById(customerUserId);
            if (!user)
                throw new common_1.NotFoundException('Portal user not found');
            if (menuCategoryId !== undefined)
                user.updateMenuCategory(menuCategoryId);
            if (pageOverrides !== undefined)
                user.updatePageOverrides(pageOverrides);
            if (isActive !== undefined) {
                isActive ? user.activate() : user.deactivate();
            }
            await this.userRepo.update(user);
            return { id: user.id, message: 'Portal user updated' };
        }
        catch (error) {
            this.logger.error(`UpdatePortalUserHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdatePortalUserHandler = UpdatePortalUserHandler;
exports.UpdatePortalUserHandler = UpdatePortalUserHandler = UpdatePortalUserHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_portal_user_command_1.UpdatePortalUserCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdatePortalUserHandler);
//# sourceMappingURL=update-portal-user.handler.js.map