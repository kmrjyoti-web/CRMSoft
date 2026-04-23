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
exports.DevRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dev_requests_service_1 = require("./dev-requests.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class SubmitRequestDto {
    partnerId;
    requestType;
    title;
    description;
    priority;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitRequestDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DevRequestType),
    __metadata("design:type", String)
], SubmitRequestDto.prototype, "requestType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitRequestDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitRequestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ErrorSeverity),
    __metadata("design:type", String)
], SubmitRequestDto.prototype, "priority", void 0);
class ReviewDto {
    action;
    estimatedHours;
    quotedPrice;
    rejectedReason;
}
__decorate([
    (0, class_validator_1.IsEnum)(['APPROVE', 'REJECT']),
    __metadata("design:type", String)
], ReviewDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReviewDto.prototype, "estimatedHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReviewDto.prototype, "quotedPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewDto.prototype, "rejectedReason", void 0);
class AssignDto {
    assignedDeveloper;
    gitBranch;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignDto.prototype, "assignedDeveloper", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignDto.prototype, "gitBranch", void 0);
class AcceptDto {
    actualHours;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AcceptDto.prototype, "actualHours", void 0);
class SetDueDateDto {
    dueDate;
    slaHours;
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SetDueDateDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SetDueDateDto.prototype, "slaHours", void 0);
class AddCommentDto {
    authorRole;
    authorName;
    message;
    isInternal;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCommentDto.prototype, "authorRole", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCommentDto.prototype, "authorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCommentDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddCommentDto.prototype, "isInternal", void 0);
let DevRequestsController = class DevRequestsController {
    devRequestsService;
    constructor(devRequestsService) {
        this.devRequestsService = devRequestsService;
    }
    submit(dto) {
        return this.devRequestsService.submit(dto);
    }
    getDashboard() {
        return this.devRequestsService.getDashboard();
    }
    findAll(partnerId, status, page = '1', limit = '20') {
        return this.devRequestsService.findAll({ partnerId, status, page: +page, limit: +limit });
    }
    findOne(id) {
        return this.devRequestsService.findOne(id);
    }
    review(id, dto) {
        return this.devRequestsService.review(id, dto);
    }
    assign(id, dto) {
        return this.devRequestsService.assign(id, dto);
    }
    deliver(id) {
        return this.devRequestsService.deliver(id);
    }
    accept(id, dto) {
        return this.devRequestsService.accept(id, dto.actualHours);
    }
    setDueDate(id, dto) {
        return this.devRequestsService.setDueDate(id, new Date(dto.dueDate), dto.slaHours);
    }
    getOverdue() {
        return this.devRequestsService.getOverdue();
    }
    addComment(id, dto) {
        return this.devRequestsService.addComment(id, dto);
    }
    getComments(id, isPartner) {
        return this.devRequestsService.getComments(id, isPartner === 'true');
    }
};
exports.DevRequestsController = DevRequestsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmitRequestDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('partnerId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReviewDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "review", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/deliver'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "deliver", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AcceptDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/due-date'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetDueDateDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "setDueDate", null);
__decorate([
    (0, common_1.Get)('overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddCommentDto]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('isPartner')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DevRequestsController.prototype, "getComments", null);
exports.DevRequestsController = DevRequestsController = __decorate([
    (0, swagger_1.ApiTags)('dev-requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dev-requests'),
    __metadata("design:paramtypes", [dev_requests_service_1.DevRequestsService])
], DevRequestsController);
//# sourceMappingURL=dev-requests.controller.js.map