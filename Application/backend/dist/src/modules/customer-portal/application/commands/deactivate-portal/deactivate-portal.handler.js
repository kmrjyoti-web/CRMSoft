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
var DeactivatePortalHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivatePortalHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_portal_command_1 = require("./deactivate-portal.command");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
let DeactivatePortalHandler = DeactivatePortalHandler_1 = class DeactivatePortalHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(DeactivatePortalHandler_1.name);
    }
    async execute(command) {
        try {
            const { tenantId, customerUserId } = command;
            const user = await this.userRepo.findById(customerUserId);
            if (!user)
                throw new common_1.NotFoundException('Portal user not found');
            if (user.tenantId !== tenantId)
                throw new common_1.ForbiddenException('Access denied');
            user.deactivate();
            await this.userRepo.update(user);
            return { message: 'Portal access deactivated' };
        }
        catch (error) {
            this.logger.error(`DeactivatePortalHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivatePortalHandler = DeactivatePortalHandler;
exports.DeactivatePortalHandler = DeactivatePortalHandler = DeactivatePortalHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_portal_command_1.DeactivatePortalCommand),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeactivatePortalHandler);
//# sourceMappingURL=deactivate-portal.handler.js.map