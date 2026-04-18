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
exports.CfgVerticalController = void 0;
const common_1 = require("@nestjs/common");
const cfg_vertical_service_1 = require("./cfg-vertical.service");
let CfgVerticalController = class CfgVerticalController {
    constructor(service) {
        this.service = service;
    }
    listAll() {
        return this.service.listAll();
    }
    findActive() {
        return this.service.findActive();
    }
    findBuilt() {
        return this.service.findBuilt();
    }
    findByCode(code) {
        return this.service.findByCode(code);
    }
};
exports.CfgVerticalController = CfgVerticalController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CfgVerticalController.prototype, "listAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CfgVerticalController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('built'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CfgVerticalController.prototype, "findBuilt", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CfgVerticalController.prototype, "findByCode", null);
exports.CfgVerticalController = CfgVerticalController = __decorate([
    (0, common_1.Controller)('platform/verticals'),
    __metadata("design:paramtypes", [cfg_vertical_service_1.CfgVerticalService])
], CfgVerticalController);
//# sourceMappingURL=cfg-vertical.controller.js.map