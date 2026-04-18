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
var DeleteScheduledTestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteScheduledTestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_scheduled_test_command_1 = require("./delete-scheduled-test.command");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
let DeleteScheduledTestHandler = DeleteScheduledTestHandler_1 = class DeleteScheduledTestHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(DeleteScheduledTestHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.repo.findById(cmd.id);
            if (!existing || existing.tenantId !== cmd.tenantId) {
                throw new common_1.NotFoundException('Scheduled test not found');
            }
            await this.repo.softDelete(cmd.id);
        }
        catch (error) {
            this.logger.error(`DeleteScheduledTestHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteScheduledTestHandler = DeleteScheduledTestHandler;
exports.DeleteScheduledTestHandler = DeleteScheduledTestHandler = DeleteScheduledTestHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_scheduled_test_command_1.DeleteScheduledTestCommand),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteScheduledTestHandler);
//# sourceMappingURL=delete-scheduled-test.handler.js.map