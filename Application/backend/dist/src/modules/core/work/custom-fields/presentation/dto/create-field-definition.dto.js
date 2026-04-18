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
exports.CreateFieldDefinitionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateFieldDefinitionDto {
}
exports.CreateFieldDefinitionDto = CreateFieldDefinitionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LEAD', description: 'Entity type this field belongs to' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'custom_priority' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "fieldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Custom Priority' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "fieldLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DROPDOWN', enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'JSON'] }),
    (0, class_validator_1.IsEnum)(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'JSON']),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "fieldType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFieldDefinitionDto.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Low', 'Medium', 'High'], description: 'Dropdown options' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFieldDefinitionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateFieldDefinitionDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=create-field-definition.dto.js.map