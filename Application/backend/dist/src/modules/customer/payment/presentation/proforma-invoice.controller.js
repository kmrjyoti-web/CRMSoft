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
exports.ProformaInvoiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const proforma_invoice_service_1 = require("../services/proforma-invoice.service");
const proforma_invoice_dto_1 = require("./dto/proforma-invoice.dto");
let ProformaInvoiceController = class ProformaInvoiceController {
    constructor(proformaService) {
        this.proformaService = proformaService;
    }
    generate(req, dto) {
        return this.proformaService.generateFromQuotation(req.user.tenantId, dto, req.user.id);
    }
    create(req, dto) {
        return this.proformaService.create(req.user.tenantId, dto, req.user.id);
    }
    list(req, query) {
        return this.proformaService.list(req.user.tenantId, query);
    }
    getById(req, id) {
        return this.proformaService.getById(req.user.tenantId, id);
    }
    update(req, id, dto) {
        return this.proformaService.update(req.user.tenantId, id, dto);
    }
    send(req, id) {
        return this.proformaService.send(req.user.tenantId, id);
    }
    convert(req, id) {
        return this.proformaService.convertToInvoice(req.user.tenantId, id, req.user.id);
    }
    cancel(req, id, dto) {
        return this.proformaService.cancel(req.user.tenantId, id, dto.reason, req.user.id);
    }
};
exports.ProformaInvoiceController = ProformaInvoiceController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, proforma_invoice_dto_1.GenerateProformaFromQuotationDto]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, proforma_invoice_dto_1.CreateProformaInvoiceDto]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, proforma_invoice_dto_1.ProformaInvoiceQueryDto]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, proforma_invoice_dto_1.UpdateProformaInvoiceDto]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "convert", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, proforma_invoice_dto_1.CancelProformaDto]),
    __metadata("design:returntype", void 0)
], ProformaInvoiceController.prototype, "cancel", null);
exports.ProformaInvoiceController = ProformaInvoiceController = __decorate([
    (0, swagger_1.ApiTags)('Proforma Invoices'),
    (0, common_1.Controller)('proforma-invoices'),
    __metadata("design:paramtypes", [proforma_invoice_service_1.ProformaInvoiceService])
], ProformaInvoiceController);
//# sourceMappingURL=proforma-invoice.controller.js.map