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
exports.CreditNoteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const credit_note_service_1 = require("../services/credit-note.service");
const credit_note_dto_1 = require("./dto/credit-note.dto");
let CreditNoteController = class CreditNoteController {
    constructor(creditNoteService) {
        this.creditNoteService = creditNoteService;
    }
    create(req, dto) {
        return this.creditNoteService.create(req.user.tenantId, dto, req.user.id);
    }
    issue(req, id) {
        return this.creditNoteService.issue(req.user.tenantId, id, req.user.id);
    }
    apply(req, id, dto) {
        return this.creditNoteService.apply(req.user.tenantId, id, dto);
    }
    cancel(req, id) {
        return this.creditNoteService.cancel(req.user.tenantId, id);
    }
    list(req, query) {
        return this.creditNoteService.list(req.user.tenantId, query);
    }
    getById(req, id) {
        return this.creditNoteService.getById(req.user.tenantId, id);
    }
};
exports.CreditNoteController = CreditNoteController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, credit_note_dto_1.CreateCreditNoteDto]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/issue'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "issue", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, credit_note_dto_1.ApplyCreditNoteDto]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "apply", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, credit_note_dto_1.CreditNoteQueryDto]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "getById", null);
exports.CreditNoteController = CreditNoteController = __decorate([
    (0, swagger_1.ApiTags)('Credit Notes'),
    (0, common_1.Controller)('credit-notes'),
    __metadata("design:paramtypes", [credit_note_service_1.CreditNoteService])
], CreditNoteController);
//# sourceMappingURL=credit-note.controller.js.map