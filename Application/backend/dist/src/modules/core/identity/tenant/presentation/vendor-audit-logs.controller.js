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
exports.VendorAuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const vendor_audit_logs_service_1 = require("../services/vendor-audit-logs.service");
let VendorAuditLogsController = class VendorAuditLogsController {
    constructor(vendorAuditLogsService) {
        this.vendorAuditLogsService = vendorAuditLogsService;
    }
    async list(page = 1, limit = 20, tenantId, category, action) {
        const p = +page;
        const l = +limit;
        const { data, total } = await this.vendorAuditLogsService.list({ tenantId, category, action, page: p, limit: l });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
};
exports.VendorAuditLogsController = VendorAuditLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List audit logs with pagination' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorAuditLogsController.prototype, "list", null);
exports.VendorAuditLogsController = VendorAuditLogsController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('admin/audit-logs'),
    __metadata("design:paramtypes", [vendor_audit_logs_service_1.VendorAuditLogsService])
], VendorAuditLogsController);
//# sourceMappingURL=vendor-audit-logs.controller.js.map