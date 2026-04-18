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
exports.CreatePatchDto = exports.RollbackVersionDto = exports.PublishVersionDto = exports.CreateVersionDto = void 0;
const class_validator_1 = require("class-validator");
class CreateVersionDto {
}
exports.CreateVersionDto = CreateVersionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['MAJOR', 'MINOR', 'PATCH', 'HOTFIX']),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "releaseType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "codeName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVersionDto.prototype, "changelog", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVersionDto.prototype, "breakingChanges", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "migrationNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "gitBranch", void 0);
class PublishVersionDto {
}
exports.PublishVersionDto = PublishVersionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishVersionDto.prototype, "gitTag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishVersionDto.prototype, "gitCommitHash", void 0);
class RollbackVersionDto {
}
exports.RollbackVersionDto = RollbackVersionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RollbackVersionDto.prototype, "rollbackReason", void 0);
class CreatePatchDto {
}
exports.CreatePatchDto = CreatePatchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatchDto.prototype, "industryCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatchDto.prototype, "patchName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePatchDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePatchDto.prototype, "schemaChanges", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePatchDto.prototype, "configOverrides", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePatchDto.prototype, "menuOverrides", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePatchDto.prototype, "forceUpdate", void 0);
//# sourceMappingURL=create-version.dto.js.map