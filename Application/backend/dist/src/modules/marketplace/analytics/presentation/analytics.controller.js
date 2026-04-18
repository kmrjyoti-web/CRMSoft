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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const track_event_command_1 = require("../application/commands/track-event/track-event.command");
const get_analytics_query_1 = require("../application/queries/get-analytics/get-analytics.query");
const track_event_dto_1 = require("./dto/track-event.dto");
let AnalyticsController = class AnalyticsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async track(dto, userId, tenantId) {
        await this.commandBus.execute(new track_event_command_1.TrackEventCommand(tenantId, dto.entityType, dto.entityId, dto.eventType, userId, dto.source, dto.deviceType, dto.city, dto.state, dto.pincode, dto.orderValue, dto.metadata));
        return api_response_1.ApiResponse.success(null, 'Event tracked');
    }
    async getAnalytics(entityType, entityId, tenantId) {
        const result = await this.queryBus.execute(new get_analytics_query_1.GetAnalyticsQuery(tenantId, entityType.toUpperCase(), entityId));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('track'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Track an analytics event (impression, click, enquiry, order, etc.)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_event_dto_1.TrackEventDto, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "track", null);
__decorate([
    (0, common_1.Get)(':entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics summary for an entity' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/analytics'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map