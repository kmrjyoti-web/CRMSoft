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
exports.TestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tests_service_1 = require("./tests.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const class_validator_1 = require("class-validator");
class TriggerTestDto {
    testType;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TriggerTestDto.prototype, "testType", void 0);
let TestsController = class TestsController {
    testsService;
    constructor(testsService) {
        this.testsService = testsService;
    }
    collect(partnerId, dto) {
        return this.testsService.collectTestResults(partnerId, dto);
    }
    trigger(partnerId, dto) {
        return this.testsService.triggerPartnerTest(partnerId, dto.testType);
    }
    dashboard(partnerId) {
        return this.testsService.getTestDashboard(partnerId);
    }
    getPartnerTests(partnerId, page = '1', limit = '20') {
        return this.testsService.getPartnerTests(partnerId, +page, +limit);
    }
};
exports.TestsController = TestsController;
__decorate([
    (0, common_1.Post)(':partnerId/collect'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "collect", null);
__decorate([
    (0, common_1.Post)(':partnerId/trigger'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TriggerTestDto]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "trigger", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "getPartnerTests", null);
exports.TestsController = TestsController = __decorate([
    (0, swagger_1.ApiTags)('tests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('tests'),
    __metadata("design:paramtypes", [tests_service_1.TestsService])
], TestsController);
//# sourceMappingURL=tests.controller.js.map