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
var UpdateTestGroupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestGroupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_test_group_command_1 = require("./update-test-group.command");
const test_group_repository_1 = require("../../../infrastructure/repositories/test-group.repository");
let UpdateTestGroupHandler = UpdateTestGroupHandler_1 = class UpdateTestGroupHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(UpdateTestGroupHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.repo.findById(cmd.id);
            if (!existing)
                throw new common_1.NotFoundException(`TestGroup not found: ${cmd.id}`);
            return this.repo.update(cmd.id, cmd.dto);
        }
        catch (error) {
            this.logger.error(`UpdateTestGroupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTestGroupHandler = UpdateTestGroupHandler;
exports.UpdateTestGroupHandler = UpdateTestGroupHandler = UpdateTestGroupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_test_group_command_1.UpdateTestGroupCommand),
    __param(0, (0, common_1.Inject)(test_group_repository_1.TEST_GROUP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateTestGroupHandler);
//# sourceMappingURL=update-test-group.handler.js.map