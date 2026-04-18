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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLogicController = void 0;
const common_1 = require("@nestjs/common");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const task_logic_service_1 = require("../task-logic.service");
const upsert_task_logic_config_dto_1 = require("./dto/upsert-task-logic-config.dto");
let TaskLogicController = class TaskLogicController {
    constructor(taskLogicService) {
        this.taskLogicService = taskLogicService;
    }
    async getAll() {
        const result = await this.taskLogicService.getAllConfigs();
        return api_response_1.ApiResponse.success(result);
    }
    async getByKey(key) {
        const result = await this.taskLogicService.getConfig(key);
        return api_response_1.ApiResponse.success(result);
    }
    async upsert(key, dto) {
        const result = await this.taskLogicService.upsertConfig(key, dto.value, dto.description);
        return api_response_1.ApiResponse.success(result, 'Config saved');
    }
    async remove(key) {
        const result = await this.taskLogicService.deleteConfig(key);
        return api_response_1.ApiResponse.success(result, 'Config deactivated');
    }
};
exports.TaskLogicController = TaskLogicController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskLogicController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskLogicController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_task_logic_config_dto_1.UpsertTaskLogicConfigDto]),
    __metadata("design:returntype", Promise)
], TaskLogicController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':key'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskLogicController.prototype, "remove", null);
exports.TaskLogicController = TaskLogicController = __decorate([
    (0, common_1.Controller)('task-logic-configs'),
    __metadata("design:paramtypes", [task_logic_service_1.TaskLogicService])
], TaskLogicController);
//# sourceMappingURL=task-logic.controller.js.map