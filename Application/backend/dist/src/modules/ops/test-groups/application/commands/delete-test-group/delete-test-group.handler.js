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
var DeleteTestGroupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTestGroupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_test_group_command_1 = require("./delete-test-group.command");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let DeleteTestGroupHandler = DeleteTestGroupHandler_1 = class DeleteTestGroupHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(DeleteTestGroupHandler_1.name);
    }
    async execute(cmd) {
        try {
            const group = await this.repo.findById(cmd.id);
            if (!group)
                throw new common_1.NotFoundException(`TestGroup not found: ${cmd.id}`);
            if (group.isSystem)
                throw new common_1.BadRequestException('System test groups cannot be deleted');
            await this.repo.softDelete(cmd.id);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DeleteTestGroupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteTestGroupHandler = DeleteTestGroupHandler;
exports.DeleteTestGroupHandler = DeleteTestGroupHandler = DeleteTestGroupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_test_group_command_1.DeleteTestGroupCommand),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteTestGroupHandler);
//# sourceMappingURL=delete-test-group.handler.js.map