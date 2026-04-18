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
exports.NotificationSettingsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const update_preferences_dto_1 = require("./dto/update-preferences.dto");
const register_push_dto_1 = require("./dto/register-push.dto");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_preferences_command_1 = require("../application/commands/update-preferences/update-preferences.command");
const register_push_command_1 = require("../application/commands/register-push/register-push.command");
const unregister_push_command_1 = require("../application/commands/unregister-push/unregister-push.command");
const create_template_command_1 = require("../application/commands/create-template/create-template.command");
const update_template_command_1 = require("../application/commands/update-template/update-template.command");
const get_preferences_query_1 = require("../application/queries/get-preferences/get-preferences.query");
const get_templates_query_1 = require("../application/queries/get-templates/get-templates.query");
let NotificationSettingsController = class NotificationSettingsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async getPreferences(userId) {
        const result = await this.queryBus.execute(new get_preferences_query_1.GetPreferencesQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async updatePreferences(dto, userId) {
        const result = await this.commandBus.execute(new update_preferences_command_1.UpdatePreferencesCommand(userId, dto.channels, dto.categories, dto.quietHoursStart, dto.quietHoursEnd, dto.digestFrequency, dto.timezone));
        return api_response_1.ApiResponse.success(result, 'Preferences updated');
    }
    async registerPush(dto, userId) {
        const result = await this.commandBus.execute(new register_push_command_1.RegisterPushCommand(userId, dto.endpoint, dto.p256dh, dto.auth, dto.deviceType));
        return api_response_1.ApiResponse.success(result, 'Push subscription registered');
    }
    async unregisterPush(endpoint, userId) {
        const result = await this.commandBus.execute(new unregister_push_command_1.UnregisterPushCommand(userId, endpoint));
        return api_response_1.ApiResponse.success(result, 'Push subscription removed');
    }
    async getTemplates(category) {
        const result = await this.queryBus.execute(new get_templates_query_1.GetTemplatesQuery(category));
        return api_response_1.ApiResponse.success(result);
    }
    async createTemplate(dto) {
        const result = await this.commandBus.execute(new create_template_command_1.CreateTemplateCommand(dto.name, dto.category, dto.subject, dto.body, dto.channels, dto.variables));
        return api_response_1.ApiResponse.success(result, 'Template created');
    }
    async updateTemplate(id, dto) {
        const result = await this.commandBus.execute(new update_template_command_1.UpdateTemplateCommand(id, dto.subject, dto.body, dto.channels, dto.variables));
        return api_response_1.ApiResponse.success(result, 'Template updated');
    }
};
exports.NotificationSettingsController = NotificationSettingsController;
__decorate([
    (0, common_1.Get)('preferences'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)('preferences'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_preferences_dto_1.UpdatePreferencesDto, String]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('push/register'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_push_dto_1.RegisterPushDto, String]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "registerPush", null);
__decorate([
    (0, common_1.Post)('push/unregister'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Body)('endpoint')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "unregisterPush", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:manage-templates'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:manage-templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:manage-templates'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationSettingsController.prototype, "updateTemplate", null);
exports.NotificationSettingsController = NotificationSettingsController = __decorate([
    (0, common_1.Controller)('notification-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], NotificationSettingsController);
//# sourceMappingURL=notification-settings.controller.js.map