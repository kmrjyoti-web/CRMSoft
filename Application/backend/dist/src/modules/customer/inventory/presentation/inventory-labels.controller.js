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
exports.InventoryLabelsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const label_service_1 = require("../services/label.service");
const inventory_dto_1 = require("./dto/inventory.dto");
let InventoryLabelsController = class InventoryLabelsController {
    constructor(labelService) {
        this.labelService = labelService;
    }
    async list() {
        const data = await this.labelService.list();
        return api_response_1.ApiResponse.success(data);
    }
    async upsert(dto) {
        const data = await this.labelService.upsert(dto);
        return api_response_1.ApiResponse.success(data, 'Label saved');
    }
};
exports.InventoryLabelsController = InventoryLabelsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List inventory labels per industry' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryLabelsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create/update inventory labels for industry' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.UpsertLabelDto]),
    __metadata("design:returntype", Promise)
], InventoryLabelsController.prototype, "upsert", null);
exports.InventoryLabelsController = InventoryLabelsController = __decorate([
    (0, swagger_1.ApiTags)('Vendor - Inventory Labels'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vendor/inventory-labels'),
    __metadata("design:paramtypes", [label_service_1.InventoryLabelService])
], InventoryLabelsController);
//# sourceMappingURL=inventory-labels.controller.js.map