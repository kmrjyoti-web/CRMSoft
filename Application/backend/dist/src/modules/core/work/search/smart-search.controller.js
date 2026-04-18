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
exports.SmartSearchController = void 0;
const common_1 = require("@nestjs/common");
const smart_search_service_1 = require("./smart-search.service");
const smart_search_dto_1 = require("./dto/smart-search.dto");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
let SmartSearchController = class SmartSearchController {
    constructor(service) {
        this.service = service;
    }
    async search(dto, user) {
        const tenantId = user?.tenantId;
        const result = await this.service.search(tenantId, dto);
        return api_response_1.ApiResponse.success(result);
    }
    getParameters(entityType) {
        const result = this.service.getParameterConfig(entityType);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.SmartSearchController = SmartSearchController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smart_search_dto_1.SmartSearchDto, Object]),
    __metadata("design:returntype", Promise)
], SmartSearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('parameters/:entityType'),
    __param(0, (0, common_1.Param)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SmartSearchController.prototype, "getParameters", null);
exports.SmartSearchController = SmartSearchController = __decorate([
    (0, common_1.Controller)('api/v1/search/smart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [smart_search_service_1.SmartSearchService])
], SmartSearchController);
//# sourceMappingURL=smart-search.controller.js.map