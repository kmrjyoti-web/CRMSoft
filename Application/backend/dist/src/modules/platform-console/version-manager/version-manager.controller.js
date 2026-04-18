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
exports.VersionManagerController = void 0;
const common_1 = require("@nestjs/common");
const version_manager_service_1 = require("./version-manager.service");
const create_release_dto_1 = require("./dto/create-release.dto");
const update_release_dto_1 = require("./dto/update-release.dto");
let VersionManagerController = class VersionManagerController {
    constructor(versionManagerService) {
        this.versionManagerService = versionManagerService;
    }
    getVerticalVersions() {
        return this.versionManagerService.getVerticalVersions();
    }
    getVerticalVersion(type) {
        return this.versionManagerService.getVerticalVersion(type);
    }
    getRollbacks(page, limit) {
        return this.versionManagerService.getRollbacks({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getReleases(verticalType, status, page, limit) {
        return this.versionManagerService.getReleases({
            verticalType,
            status,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    createRelease(dto) {
        return this.versionManagerService.createRelease(dto);
    }
    getRelease(id) {
        return this.versionManagerService.getRelease(id);
    }
    updateRelease(id, dto) {
        return this.versionManagerService.updateRelease(id, dto);
    }
    publishRelease(id, body) {
        return this.versionManagerService.publishRelease(id, body.publishedBy);
    }
    rollbackRelease(id, body) {
        return this.versionManagerService.rollbackRelease(id, body.reason, body.rolledBackBy);
    }
};
exports.VersionManagerController = VersionManagerController;
__decorate([
    (0, common_1.Get)('verticals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "getVerticalVersions", null);
__decorate([
    (0, common_1.Get)('verticals/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "getVerticalVersion", null);
__decorate([
    (0, common_1.Get)('rollbacks'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "getRollbacks", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('verticalType')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "getReleases", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_release_dto_1.CreateReleaseDto]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "createRelease", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "getRelease", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_release_dto_1.UpdateReleaseDto]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "updateRelease", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "publishRelease", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VersionManagerController.prototype, "rollbackRelease", null);
exports.VersionManagerController = VersionManagerController = __decorate([
    (0, common_1.Controller)('platform-console/versions'),
    __metadata("design:paramtypes", [version_manager_service_1.VersionManagerService])
], VersionManagerController);
//# sourceMappingURL=version-manager.controller.js.map