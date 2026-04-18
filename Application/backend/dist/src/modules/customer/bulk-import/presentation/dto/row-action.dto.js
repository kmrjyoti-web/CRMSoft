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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowQueryDto = exports.EditRowDto = exports.RowBulkActionDto = exports.RowActionDto = void 0;
const class_validator_1 = require("class-validator");
class RowActionDto {
}
exports.RowActionDto = RowActionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RowActionDto.prototype, "action", void 0);
class RowBulkActionDto {
}
exports.RowBulkActionDto = RowBulkActionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RowBulkActionDto.prototype, "action", void 0);
class EditRowDto {
}
exports.EditRowDto = EditRowDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EditRowDto.prototype, "editedData", void 0);
class RowQueryDto {
}
exports.RowQueryDto = RowQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RowQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RowQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RowQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=row-action.dto.js.map